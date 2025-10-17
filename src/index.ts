/**
 * @xrepl/client - TypeScript client library for xREPL protocol
 *
 * This library enables communication with an LFE (Lisp Flavored Erlang)
 * language server using MessagePack over TCP or UNIX domain sockets.
 *
 * @packageDocumentation
 */

// Main client factory and interface
export { createClient, XReplClient, XReplClientConfig } from "./client";

// Protocol types
export * from "./types/protocol";

// Error types (excluding StackFrame which is already exported from protocol)
export type {
  XReplError,
  TransportError,
  CodecError,
  OperationError,
  ClientError,
  ConnectionError,
  ServerError,
} from "./types/errors";

// Transport types
export { TcpConfig } from "./transport/tcp";
export { UnixSocketConfig } from "./transport/unix";

// Operation parameter types
export type { EvalParams } from "./operations/phase1/eval";
export type { LoadFileParams } from "./operations/phase1/load-file";
