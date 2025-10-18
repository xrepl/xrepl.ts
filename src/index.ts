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

// Session Management operation parameters
export type { SwitchNamespaceParams } from "./operations/session-management/switch-namespace";
export type { SessionInfoParams } from "./operations/session-management/session-info";
export type { ClearSessionParams } from "./operations/session-management/clear-session";

// Code Evaluation operation parameters
export type { EvalParams } from "./operations/code-evaluation/eval";
export type { EvalMultipleParams } from "./operations/code-evaluation/eval-multiple";
export type { EvalAtPointParams } from "./operations/code-evaluation/eval-at-point";
export type { StreamEvalParams } from "./operations/code-evaluation/stream-eval";
export type { CancelParams } from "./operations/code-evaluation/cancel";
export type { LoadFileParams } from "./operations/code-evaluation/load-file";

// Code Intelligence operation parameters
export type { CompleteParams } from "./operations/code-intelligence/complete";
export type { CompleteContextParams } from "./operations/code-intelligence/complete-context";
export type { SignatureParams } from "./operations/code-intelligence/signature";
export type { EldocParams } from "./operations/code-intelligence/eldoc";
export type { EldocBatchParams } from "./operations/code-intelligence/eldoc-batch";
export type { TypeInfoParams } from "./operations/code-intelligence/type-info";
export type { FormatParams } from "./operations/code-intelligence/format";
export type { AproposParams } from "./operations/code-intelligence/apropos";
export type { IndentInfoParams } from "./operations/code-intelligence/indent-info";
export type { BufferAnalysisParams } from "./operations/code-intelligence/buffer-analysis";
export type { HighlightRegionsParams } from "./operations/code-intelligence/highlight-regions";

// Navigation operation parameters
export type { FindDefinitionParams } from "./operations/navigation/find-definition";
export type { FindReferencesParams } from "./operations/navigation/find-references";
export type { ListDefinitionsParams } from "./operations/navigation/list-definitions";
export type { SymbolAtPointParams } from "./operations/navigation/symbol-at-point";
export type { WorkspaceSymbolsParams } from "./operations/navigation/workspace-symbols";

// Documentation operation parameters
export type { DocParams } from "./operations/documentation/doc";
export type { ModuleDocParams } from "./operations/documentation/module-doc";
export type { SearchDocsParams } from "./operations/documentation/search-docs";
export type { GenerateDocParams } from "./operations/documentation/generate-doc";
export type { ModuleSummaryParams } from "./operations/documentation/module-summary";

// Debugging operation parameters
export type { SetBreakpointParams } from "./operations/debugging/set-breakpoint";
export type { ClearBreakpointParams } from "./operations/debugging/clear-breakpoint";
export type { StacktraceParams } from "./operations/debugging/stacktrace";
export type { InspectLocalsParams } from "./operations/debugging/inspect-locals";
export type { EvalInFrameParams } from "./operations/debugging/eval-in-frame";
export type { StepParams } from "./operations/debugging/step";

// Testing operation parameters
export type { TestRunParams } from "./operations/testing/test-run";
export type { TestCoverageParams } from "./operations/testing/test-coverage";
export type { TestRerunFailuresParams } from "./operations/testing/test-rerun-failures";
export type { GenerateTestsParams } from "./operations/testing/generate-tests";

// Refactoring operation parameters
export type { RenameSymbolParams } from "./operations/refactoring/rename-symbol";
export type { ExtractFunctionParams } from "./operations/refactoring/extract-function";
export type { InlineFunctionParams } from "./operations/refactoring/inline-function";

// Compilation & Building operation parameters
export type { CompileFileParams } from "./operations/compilation-building/compile-file";
export type { CompileProjectParams } from "./operations/compilation-building/compile-project";
export type { LintParams } from "./operations/compilation-building/lint";
export type { DependenciesParams } from "./operations/compilation-building/dependencies";
export type { BuildParams } from "./operations/compilation-building/build";

// BEAM-Specific operation parameters
export type { HotReloadParams } from "./operations/beam-specific/hot-reload";
export type { ListProcessesParams } from "./operations/beam-specific/list-processes";
export type { InspectProcessParams } from "./operations/beam-specific/inspect-process";
export type { TraceCallsParams } from "./operations/beam-specific/trace-calls";
export type { SystemInfoParams } from "./operations/beam-specific/system-info";
export type { ObserverDataParams } from "./operations/beam-specific/observer-data";

// Status & Introspection operation parameters
export type { CapabilitiesParams } from "./operations/status-introspection/capabilities";
export type { VersionParams } from "./operations/status-introspection/version";
export type { LoadedModulesParams } from "./operations/status-introspection/loaded-modules";
export type { ModuleInfoParams } from "./operations/status-introspection/module-info";
export type { UploadHistoryParams } from "./operations/status-introspection/upload-history";

// Advanced Features operation parameters
export type { MacroexpandParams } from "./operations/advanced-features/macroexpand";
export type { MacroexpandAllParams } from "./operations/advanced-features/macroexpand-all";
export type { ListMacrosParams } from "./operations/advanced-features/list-macros";
export type { HistoryParams } from "./operations/advanced-features/history";
export type { SearchHistoryParams } from "./operations/advanced-features/search-history";
export type { ProfileStartParams } from "./operations/advanced-features/profile-start";
export type { ProfileStopParams } from "./operations/advanced-features/profile-stop";
export type { BenchmarkParams } from "./operations/advanced-features/benchmark";
export type { SnippetsParams } from "./operations/advanced-features/snippets";
export type { ExpandSnippetParams } from "./operations/advanced-features/expand-snippet";
export type { GenerateFunctionParams } from "./operations/advanced-features/generate-function";
export type { SuggestImprovementsParams } from "./operations/advanced-features/suggest-improvements";
export type { ShareSessionParams } from "./operations/advanced-features/share-session";
export type { RestoreSessionParams } from "./operations/advanced-features/restore-session";
export type { TextDocumentDidOpenParams } from "./operations/advanced-features/text-document-did-open";
export type { TextDocumentDidChangeParams } from "./operations/advanced-features/text-document-did-change";
export type { TextDocumentDidCloseParams } from "./operations/advanced-features/text-document-did-close";
