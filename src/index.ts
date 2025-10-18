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

// Operation parameter types - Phase 1
export type { EvalParams } from "./operations/phase1/eval";
export type { LoadFileParams } from "./operations/phase1/load-file";

// Operation parameter types - Phase 2
export type { CompleteParams } from "./operations/phase2/complete";
export type { SignatureParams } from "./operations/phase2/signature";
export type { EldocParams } from "./operations/phase2/eldoc";
export type { DocParams } from "./operations/phase2/doc";
export type { FindDefinitionParams } from "./operations/phase2/find-definition";
export type { FindReferencesParams } from "./operations/phase2/find-references";
export type { ListDefinitionsParams } from "./operations/phase2/list-definitions";
export type { FormatParams } from "./operations/phase2/format";

// Operation parameter types - Phase 3
export type { CompileFileParams } from "./operations/phase3/compile-file";
export type { CompileProjectParams } from "./operations/phase3/compile-project";
export type { LintParams } from "./operations/phase3/lint";
export type { BufferAnalysisParams } from "./operations/phase3/buffer-analysis";

// Operation parameter types - Phase 5
export type { SetBreakpointParams } from "./operations/phase5/set-breakpoint";
export type { ClearBreakpointParams } from "./operations/phase5/clear-breakpoint";
export type { StacktraceParams } from "./operations/phase5/stacktrace";
export type { StepParams } from "./operations/phase5/step";
export type { InspectLocalsParams } from "./operations/phase5/inspect-locals";
export type { EvalInFrameParams } from "./operations/phase5/eval-in-frame";

// Operation parameter types - Phase 6
export type { TestRunParams } from "./operations/phase6/test-run";
export type { TestCoverageParams } from "./operations/phase6/test-coverage";
export type { TestRerunFailuresParams } from "./operations/phase6/test-rerun-failures";
export type { RenameSymbolParams } from "./operations/phase6/rename-symbol";
export type { ExtractFunctionParams } from "./operations/phase6/extract-function";
export type { InlineFunctionParams } from "./operations/phase6/inline-function";
