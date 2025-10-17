import { Result, ok, err } from "neverthrow";
import { Transport } from "../transport/base";
import { ConnectionError } from "../types/errors";
import { ReconnectStrategy } from "./reconnect";
import { encodePacket, decodeMessage } from "../codec/msgpack";
import { BaseRequest, BaseResponse } from "../types/protocol";

export interface ConnectionConfig {
  /** Enable automatic reconnection */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
}

/**
 * Manages connection lifecycle, reconnection, and health monitoring
 */
export class ConnectionManager {
  private reconnectStrategy: ReconnectStrategy;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(
    private transport: Transport,
    private config: ConnectionConfig
  ) {
    this.reconnectStrategy = new ReconnectStrategy();
    this.setupConnectionMonitoring();
  }

  /**
   * Establish connection with automatic retry
   */
  async connect(): Promise<Result<void, ConnectionError>> {
    const result = await this.transport.connect();

    if (result.isErr()) {
      // Attempt reconnection if configured
      if (
        this.config.autoReconnect &&
        this.reconnectStrategy.getAttemptCount() <
          (this.config.maxReconnectAttempts || 10)
      ) {
        await this.scheduleReconnect();
        return err({
          type: "connection_failed",
          message: result.error.message,
        });
      }

      return err({
        type: "connection_failed",
        message: result.error.message,
      });
    }

    // Reset reconnection strategy on successful connection
    this.reconnectStrategy.reset();

    // Start health check
    if (this.config.autoReconnect) {
      this.startHealthCheck();
    }

    return ok(undefined);
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<Result<void, ConnectionError>> {
    this.stopHealthCheck();
    this.stopReconnectTimer();

    const result = await this.transport.disconnect();

    if (result.isErr()) {
      return err({
        type: "disconnection_failed",
        message: result.error.message,
      });
    }

    return ok(undefined);
  }

  /**
   * Send request and wait for response
   */
  async sendRequest<TReq extends BaseRequest, TRes extends BaseResponse>(
    request: TReq
  ): Promise<Result<TRes, ConnectionError>> {
    // Encode the request
    const encodeResult = encodePacket(request);
    if (encodeResult.isErr()) {
      return err({
        type: "send_failed",
        message: `Failed to encode request: ${encodeResult.error.message}`,
      });
    }

    // Send the request
    const sendResult = await this.transport.send(encodeResult.value);
    if (sendResult.isErr()) {
      return err({
        type: "send_failed",
        message: sendResult.error.message,
      });
    }

    // Receive the response with timeout
    const timeout = this.config.requestTimeout || 30000;
    const receivePromise = this.transport.receive();
    const timeoutPromise = new Promise<Result<Uint8Array, ConnectionError>>(
      (resolve) =>
        setTimeout(
          () =>
            resolve(
              err({
                type: "request_timeout",
                message: `Request timeout after ${timeout}ms`,
              })
            ),
          timeout
        )
    );

    const receiveResult = await Promise.race([
      receivePromise,
      timeoutPromise,
    ]);

    if (receiveResult.isErr()) {
      return err({
        type: receiveResult.error.type as ConnectionError["type"],
        message: receiveResult.error.message,
      });
    }

    // Decode the response
    const decodeResult = decodeMessage<TRes>(receiveResult.value);
    if (decodeResult.isErr()) {
      return err({
        type: "receive_failed",
        message: `Failed to decode response: ${decodeResult.error.message}`,
      });
    }

    return ok(decodeResult.value);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.transport.isConnected();
  }

  /**
   * Start health check ping loop
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();

    // Send ping every 30 seconds
    this.healthCheckTimer = setInterval(() => {
      if (!this.transport.isConnected() && this.config.autoReconnect) {
        void this.attemptReconnect();
      }
    }, 30000);
  }

  /**
   * Stop health check
   */
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    this.transport.onConnectionChange((connected) => {
      if (!connected && this.config.autoReconnect) {
        void this.attemptReconnect();
      }
    });
  }

  /**
   * Schedule a reconnection attempt
   */
  private async scheduleReconnect(): Promise<void> {
    const delay = this.reconnectStrategy.getNextDelay();
    return new Promise((resolve) => {
      this.reconnectTimer = setTimeout(() => {
        void this.attemptReconnect().then(resolve);
      }, delay);
    });
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnect(): Promise<void> {
    if (
      this.reconnectStrategy.getAttemptCount() >=
      (this.config.maxReconnectAttempts || 10)
    ) {
      console.error("Maximum reconnection attempts reached");
      return;
    }

    console.log(
      `Attempting to reconnect (attempt ${this.reconnectStrategy.getAttemptCount() + 1})...`
    );

    const result = await this.transport.connect();
    if (result.isOk()) {
      console.log("Reconnection successful");
      this.reconnectStrategy.reset();
    } else {
      await this.scheduleReconnect();
    }
  }

  /**
   * Stop reconnection timer
   */
  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
