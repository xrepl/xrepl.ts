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

// Operation parameter types - Phase 7
export type { HotReloadParams } from "./operations/phase7/hot-reload";
export type { ListProcessesParams } from "./operations/phase7/list-processes";
export type { InspectProcessParams } from "./operations/phase7/inspect-process";
export type { TraceCallsParams } from "./operations/phase7/trace-calls";
export type { SystemInfoParams } from "./operations/phase7/system-info";
export type { ObserverDataParams } from "./operations/phase7/observer-data";

// Operation parameter types - Phase 8
export type { MacroexpandParams } from "./operations/phase8/macroexpand";
export type { MacroexpandAllParams } from "./operations/phase8/macroexpand-all";
export type { ProfileStartParams } from "./operations/phase8/profile-start";
export type { ProfileStopParams } from "./operations/phase8/profile-stop";
export type { BenchmarkParams } from "./operations/phase8/benchmark";
export type { WorkspaceSymbolsParams } from "./operations/phase8/workspace-symbols";
export type { GenerateFunctionParams } from "./operations/phase8/generate-function";
export type { GenerateTestsParams } from "./operations/phase8/generate-tests";
export type { SuggestImprovementsParams } from "./operations/phase8/suggest-improvements";
export type { SnippetsParams } from "./operations/phase8/snippets";
export type { ShareSessionParams } from "./operations/phase8/share-session";
export type { RestoreSessionParams } from "./operations/phase8/restore-session";

// Operation parameter types - Phase 9
export type { SwitchNamespaceParams } from "./operations/phase9/switch-namespace";
export type { SessionInfoParams } from "./operations/phase9/session-info";
export type { UploadHistoryParams } from "./operations/phase9/upload-history";
export type { TypeInfoParams } from "./operations/phase9/type-info";
export type { AproposParams } from "./operations/phase9/apropos";
export type { SymbolAtPointParams } from "./operations/phase9/symbol-at-point";
export type { DependenciesParams } from "./operations/phase9/dependencies";
export type { BuildParams } from "./operations/phase9/build";
export type { EvalMultipleParams } from "./operations/phase9/eval-multiple";
export type { CancelParams } from "./operations/phase9/cancel";
export type { CapabilitiesParams } from "./operations/phase9/capabilities";
export type { VersionParams } from "./operations/phase9/version";
export type { LoadedModulesParams } from "./operations/phase9/loaded-modules";

// Operation parameter types - Phase 10
export type { CompleteContextParams } from "./operations/phase10/complete-context";
export type { EldocBatchParams } from "./operations/phase10/eldoc-batch";
export type { IndentInfoParams } from "./operations/phase10/indent-info";
export type { HighlightRegionsParams } from "./operations/phase10/highlight-regions";
export type { EvalAtPointParams } from "./operations/phase10/eval-at-point";
export type { StreamEvalParams } from "./operations/phase10/stream-eval";
export type { ModuleDocParams } from "./operations/phase10/module-doc";
export type { SearchDocsParams } from "./operations/phase10/search-docs";
export type { HistoryParams } from "./operations/phase10/history";
export type { ClearSessionParams } from "./operations/phase10/clear-session";
export type { ModuleInfoParams } from "./operations/phase10/module-info";

// Operation parameter types - Phase 11
export type { ListMacrosParams } from "./operations/phase11/list-macros";
export type { SearchHistoryParams } from "./operations/phase11/search-history";
export type { GenerateDocParams } from "./operations/phase11/generate-doc";
export type { ModuleSummaryParams } from "./operations/phase11/module-summary";
export type { ExpandSnippetParams } from "./operations/phase11/expand-snippet";
export type { TextDocumentDidOpenParams } from "./operations/phase11/text-document-did-open";
export type { TextDocumentDidChangeParams } from "./operations/phase11/text-document-did-change";
export type { TextDocumentDidCloseParams } from "./operations/phase11/text-document-did-close";
