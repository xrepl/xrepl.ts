/**
 * Base error interface for all xREPL errors
 */
export interface XReplError {
  type: string;
  message: string;
}

/**
 * Transport layer errors
 */
export interface TransportError extends XReplError {
  type:
    | "connection_error"
    | "disconnection_error"
    | "send_error"
    | "receive_error"
    | "timeout_error";
}

/**
 * Codec errors (MessagePack encoding/decoding)
 */
export interface CodecError extends XReplError {
  type: "encoding_error" | "decoding_error";
}

/**
 * Protocol operation errors
 */
export interface OperationError extends XReplError {
  type: "operation_error" | "validation_error";
  operation?: string;
}

/**
 * Client-level errors
 */
export interface ClientError extends XReplError {
  type:
    | "client_error"
    | "client_creation_error"
    | "session_error";
}

/**
 * Connection management errors
 */
export interface ConnectionError extends XReplError {
  type:
    | "connection_failed"
    | "disconnection_failed"
    | "send_failed"
    | "receive_failed"
    | "request_timeout";
}

/**
 * Server-returned errors
 */
export interface ServerError extends XReplError {
  type: string; // Server error type (e.g., "badarg", "undef")
  stacktrace?: StackFrame[];
}

export interface StackFrame {
  module: string;
  function: string;
  arity: number;
  file: string;
  line: number;
}
