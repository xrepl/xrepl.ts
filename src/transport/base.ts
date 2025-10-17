import { Result } from "neverthrow";
import { TransportError } from "../types/errors";

/**
 * Configuration for transport connections
 */
export interface TransportConfig {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Enable automatic reconnection */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
}

/**
 * Abstract transport interface for xREPL communication
 */
export interface Transport {
  /**
   * Connect to the xREPL server
   */
  connect(): Promise<Result<void, TransportError>>;

  /**
   * Disconnect from the xREPL server
   */
  disconnect(): Promise<Result<void, TransportError>>;

  /**
   * Send a MessagePack-encoded message
   * @param data - Encoded MessagePack data
   */
  send(data: Uint8Array): Promise<Result<void, TransportError>>;

  /**
   * Receive a MessagePack-encoded message
   * @returns Encoded MessagePack data
   */
  receive(): Promise<Result<Uint8Array, TransportError>>;

  /**
   * Check if transport is currently connected
   */
  isConnected(): boolean;

  /**
   * Register callback for connection events
   */
  onConnectionChange(callback: (connected: boolean) => void): void;
}
