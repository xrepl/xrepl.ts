import * as net from "net";
import { Result, ok, err } from "neverthrow";
import { Transport, TransportConfig } from "./base";
import { TransportError } from "../types/errors";
import { readLengthPrefix } from "../codec/msgpack";

export interface UnixSocketConfig extends TransportConfig {
  socketPath: string;
}

/**
 * UNIX domain socket transport implementation for xREPL
 * Uses 4-byte big-endian length prefix (packet: 4 mode)
 */
export class UnixSocketTransport implements Transport {
  private socket: net.Socket | null = null;
  private connected = false;
  private connectionCallbacks: Array<(connected: boolean) => void> = [];
  private receiveBuffer: Buffer = Buffer.alloc(0);
  private pendingReceives: Array<{
    resolve: (result: Result<Uint8Array, TransportError>) => void;
  }> = [];

  constructor(private config: UnixSocketConfig) {}

  async connect(): Promise<Result<void, TransportError>> {
    return new Promise((resolve) => {
      try {
        this.socket = new net.Socket();

        const timeout = this.config.timeout || 5000;
        const timer = setTimeout(() => {
          this.socket?.destroy();
          resolve(
            err({
              type: "timeout_error",
              message: `Connection timeout after ${timeout}ms`,
            })
          );
        }, timeout);

        this.socket.on("connect", () => {
          clearTimeout(timer);
          this.connected = true;
          this.notifyConnectionChange(true);
          resolve(ok(undefined));
        });

        this.socket.on("data", (data: Buffer) => {
          this.handleIncomingData(data);
        });

        this.socket.on("error", (error: Error) => {
          clearTimeout(timer);
          this.connected = false;
          this.notifyConnectionChange(false);
          resolve(
            err({
              type: "connection_error",
              message: `UNIX socket connection error: ${error.message}`,
            })
          );
        });

        this.socket.on("close", () => {
          this.connected = false;
          this.notifyConnectionChange(false);
        });

        this.socket.connect(this.config.socketPath);
      } catch (error) {
        resolve(
          err({
            type: "connection_error",
            message: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`,
          })
        );
      }
    });
  }

  async disconnect(): Promise<Result<void, TransportError>> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(ok(undefined));
        return;
      }

      try {
        this.socket.end(() => {
          this.connected = false;
          this.socket = null;
          this.notifyConnectionChange(false);
          resolve(ok(undefined));
        });
      } catch (error) {
        resolve(
          err({
            type: "disconnection_error",
            message: `Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`,
          })
        );
      }
    });
  }

  async send(data: Uint8Array): Promise<Result<void, TransportError>> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        resolve(
          err({
            type: "send_error",
            message: "Not connected",
          })
        );
        return;
      }

      try {
        this.socket.write(Buffer.from(data), (error) => {
          if (error) {
            resolve(
              err({
                type: "send_error",
                message: `Failed to send data: ${error.message}`,
              })
            );
          } else {
            resolve(ok(undefined));
          }
        });
      } catch (error) {
        resolve(
          err({
            type: "send_error",
            message: `Failed to send data: ${error instanceof Error ? error.message : String(error)}`,
          })
        );
      }
    });
  }

  async receive(): Promise<Result<Uint8Array, TransportError>> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        resolve(
          err({
            type: "receive_error",
            message: "Not connected",
          })
        );
        return;
      }

      // Check if we already have a complete message in the buffer
      const message = this.tryExtractMessage();
      if (message) {
        resolve(ok(message));
        return;
      }

      // Wait for more data
      this.pendingReceives.push({ resolve });
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyConnectionChange(connected: boolean): void {
    for (const callback of this.connectionCallbacks) {
      try {
        callback(connected);
      } catch (error) {
        console.error("Error in connection callback:", error);
      }
    }
  }

  private handleIncomingData(data: Buffer): void {
    // Append to receive buffer
    this.receiveBuffer = Buffer.concat([this.receiveBuffer, data]);

    // Try to extract messages and resolve pending receives
    while (this.pendingReceives.length > 0) {
      const message = this.tryExtractMessage();
      if (!message) {
        break;
      }

      const pending = this.pendingReceives.shift();
      if (pending) {
        pending.resolve(ok(message));
      }
    }
  }

  private tryExtractMessage(): Uint8Array | null {
    // Need at least 4 bytes for length prefix
    if (this.receiveBuffer.length < 4) {
      return null;
    }

    try {
      // Read length prefix
      const length = readLengthPrefix(
        new Uint8Array(this.receiveBuffer.subarray(0, 4))
      );

      // Check if we have the complete message
      if (this.receiveBuffer.length < 4 + length) {
        return null;
      }

      // Extract the message (without the length prefix)
      const message = new Uint8Array(
        this.receiveBuffer.subarray(4, 4 + length)
      );

      // Remove the message from the buffer
      this.receiveBuffer = this.receiveBuffer.subarray(4 + length);

      return message;
    } catch (error) {
      console.error("Error extracting message:", error);
      return null;
    }
  }
}
