import { Result, ok, err } from "neverthrow";
import { Transport } from "./transport/base";
import { TcpTransport, TcpConfig } from "./transport/tcp";
import { UnixSocketTransport, UnixSocketConfig } from "./transport/unix";
import { ConnectionManager } from "./connection/manager";
import { SessionTracker } from "./session/tracker";
import { ClientError, OperationError } from "./types/errors";

// Session Management operations
import { cloneSession } from "./operations/session-management/clone";
import { closeSession } from "./operations/session-management/close";
import { listSessions } from "./operations/session-management/ls-sessions";
import {
  switchNamespace,
  SwitchNamespaceParams,
} from "./operations/session-management/switch-namespace";
import {
  sessionInfo,
  SessionInfoParams,
} from "./operations/session-management/session-info";
import {
  clearSession,
  ClearSessionParams,
} from "./operations/session-management/clear-session";

// Code Evaluation operations
import { evalCode, EvalParams } from "./operations/code-evaluation/eval";
import {
  evalMultiple,
  EvalMultipleParams,
} from "./operations/code-evaluation/eval-multiple";
import {
  evalAtPoint,
  EvalAtPointParams,
} from "./operations/code-evaluation/eval-at-point";
import {
  streamEval,
  StreamEvalParams,
} from "./operations/code-evaluation/stream-eval";
import { interrupt } from "./operations/code-evaluation/interrupt";
import { cancel, CancelParams } from "./operations/code-evaluation/cancel";
import { loadFile, LoadFileParams } from "./operations/code-evaluation/load-file";

// Code Intelligence operations
import { complete, CompleteParams } from "./operations/code-intelligence/complete";
import {
  completeContext,
  CompleteContextParams,
} from "./operations/code-intelligence/complete-context";
import { signature, SignatureParams } from "./operations/code-intelligence/signature";
import { eldoc, EldocParams } from "./operations/code-intelligence/eldoc";
import {
  eldocBatch,
  EldocBatchParams,
} from "./operations/code-intelligence/eldoc-batch";
import { typeInfo, TypeInfoParams } from "./operations/code-intelligence/type-info";
import { format, FormatParams } from "./operations/code-intelligence/format";
import { apropos, AproposParams } from "./operations/code-intelligence/apropos";
import {
  indentInfo,
  IndentInfoParams,
} from "./operations/code-intelligence/indent-info";
import {
  bufferAnalysis,
  BufferAnalysisParams,
} from "./operations/code-intelligence/buffer-analysis";
import {
  highlightRegions,
  HighlightRegionsParams,
} from "./operations/code-intelligence/highlight-regions";

// Navigation operations
import {
  findDefinition,
  FindDefinitionParams,
} from "./operations/navigation/find-definition";
import {
  findReferences,
  FindReferencesParams,
} from "./operations/navigation/find-references";
import {
  listDefinitions,
  ListDefinitionsParams,
} from "./operations/navigation/list-definitions";
import {
  symbolAtPoint,
  SymbolAtPointParams,
} from "./operations/navigation/symbol-at-point";
import {
  workspaceSymbols,
  WorkspaceSymbolsParams,
} from "./operations/navigation/workspace-symbols";

// Documentation operations
import { doc, DocParams } from "./operations/documentation/doc";
import {
  moduleDoc,
  ModuleDocParams,
} from "./operations/documentation/module-doc";
import {
  searchDocs,
  SearchDocsParams,
} from "./operations/documentation/search-docs";
import {
  generateDoc,
  GenerateDocParams,
} from "./operations/documentation/generate-doc";
import {
  moduleSummary,
  ModuleSummaryParams,
} from "./operations/documentation/module-summary";

// Debugging operations
import {
  setBreakpoint,
  SetBreakpointParams,
} from "./operations/debugging/set-breakpoint";
import {
  clearBreakpoint,
  ClearBreakpointParams,
} from "./operations/debugging/clear-breakpoint";
import { listBreakpoints } from "./operations/debugging/list-breakpoints";
import { stacktrace, StacktraceParams } from "./operations/debugging/stacktrace";
import {
  inspectLocals,
  InspectLocalsParams,
} from "./operations/debugging/inspect-locals";
import {
  evalInFrame,
  EvalInFrameParams,
} from "./operations/debugging/eval-in-frame";
import { step, StepParams } from "./operations/debugging/step";

// Testing operations
import { testRun, TestRunParams } from "./operations/testing/test-run";
import {
  testCoverage,
  TestCoverageParams,
} from "./operations/testing/test-coverage";
import {
  testRerunFailures,
  TestRerunFailuresParams,
} from "./operations/testing/test-rerun-failures";
import {
  generateTests,
  GenerateTestsParams,
} from "./operations/testing/generate-tests";

// Refactoring operations
import {
  renameSymbol,
  RenameSymbolParams,
} from "./operations/refactoring/rename-symbol";
import {
  extractFunction,
  ExtractFunctionParams,
} from "./operations/refactoring/extract-function";
import {
  inlineFunction,
  InlineFunctionParams,
} from "./operations/refactoring/inline-function";

// Compilation & Building operations
import {
  compileFile,
  CompileFileParams,
} from "./operations/compilation-building/compile-file";
import {
  compileProject,
  CompileProjectParams,
} from "./operations/compilation-building/compile-project";
import { lint, LintParams } from "./operations/compilation-building/lint";
import {
  dependencies,
  DependenciesParams,
} from "./operations/compilation-building/dependencies";
import { build, BuildParams } from "./operations/compilation-building/build";

// BEAM-Specific operations
import { hotReload, HotReloadParams } from "./operations/beam-specific/hot-reload";
import {
  listProcesses,
  ListProcessesParams,
} from "./operations/beam-specific/list-processes";
import {
  inspectProcess,
  InspectProcessParams,
} from "./operations/beam-specific/inspect-process";
import { traceCalls, TraceCallsParams } from "./operations/beam-specific/trace-calls";
import { systemInfo, SystemInfoParams } from "./operations/beam-specific/system-info";
import {
  observerData,
  ObserverDataParams,
} from "./operations/beam-specific/observer-data";

// Status & Introspection operations
import { describe } from "./operations/status-introspection/describe";
import {
  capabilities,
  CapabilitiesParams,
} from "./operations/status-introspection/capabilities";
import { version, VersionParams } from "./operations/status-introspection/version";
import { ping } from "./operations/status-introspection/ping";
import {
  loadedModules,
  LoadedModulesParams,
} from "./operations/status-introspection/loaded-modules";
import {
  moduleInfo,
  ModuleInfoParams,
} from "./operations/status-introspection/module-info";
import {
  uploadHistory,
  UploadHistoryParams,
} from "./operations/status-introspection/upload-history";

// Advanced Features operations
import {
  macroexpand,
  MacroexpandParams,
} from "./operations/advanced-features/macroexpand";
import {
  macroexpandAll,
  MacroexpandAllParams,
} from "./operations/advanced-features/macroexpand-all";
import {
  listMacros,
  ListMacrosParams,
} from "./operations/advanced-features/list-macros";
import { history, HistoryParams } from "./operations/advanced-features/history";
import {
  searchHistory,
  SearchHistoryParams,
} from "./operations/advanced-features/search-history";
import {
  profileStart,
  ProfileStartParams,
} from "./operations/advanced-features/profile-start";
import {
  profileStop,
  ProfileStopParams,
} from "./operations/advanced-features/profile-stop";
import { benchmark, BenchmarkParams } from "./operations/advanced-features/benchmark";
import { snippets, SnippetsParams } from "./operations/advanced-features/snippets";
import {
  expandSnippet,
  ExpandSnippetParams,
} from "./operations/advanced-features/expand-snippet";
import {
  generateFunction,
  GenerateFunctionParams,
} from "./operations/advanced-features/generate-function";
import {
  suggestImprovements,
  SuggestImprovementsParams,
} from "./operations/advanced-features/suggest-improvements";
import {
  shareSession,
  ShareSessionParams,
} from "./operations/advanced-features/share-session";
import {
  restoreSession,
  RestoreSessionParams,
} from "./operations/advanced-features/restore-session";
import {
  textDocumentDidOpen,
  TextDocumentDidOpenParams,
} from "./operations/advanced-features/text-document-did-open";
import {
  textDocumentDidChange,
  TextDocumentDidChangeParams,
} from "./operations/advanced-features/text-document-did-change";
import {
  textDocumentDidClose,
  TextDocumentDidCloseParams,
} from "./operations/advanced-features/text-document-did-close";

// Import types
import {
  EvalResponse,
  CloneResponse,
  CloseResponse,
  LsSessionsResponse,
  PingResponse,
  DescribeResponse,
  InterruptResponse,
  LoadFileResponse,
  CompleteResponse,
  SignatureResponse,
  EldocResponse,
  DocResponse,
  FindDefinitionResponse,
  FindReferencesResponse,
  ListDefinitionsResponse,
  FormatResponse,
  CompileFileResponse,
  CompileProjectResponse,
  LintResponse,
  BufferAnalysisResponse,
  SetBreakpointResponse,
  ClearBreakpointResponse,
  ListBreakpointsResponse,
  StacktraceResponse,
  StepResponse,
  InspectLocalsResponse,
  EvalInFrameResponse,
  TestRunResponse,
  TestCoverageResponse,
  TestRerunFailuresResponse,
  RenameSymbolResponse,
  ExtractFunctionResponse,
  InlineFunctionResponse,
  HotReloadResponse,
  ListProcessesResponse,
  InspectProcessResponse,
  TraceCallsResponse,
  SystemInfoResponse,
  ObserverDataResponse,
  MacroexpandResponse,
  MacroexpandAllResponse,
  ProfileStartResponse,
  ProfileStopResponse,
  BenchmarkResponse,
  WorkspaceSymbolsResponse,
  GenerateFunctionResponse,
  GenerateTestsResponse,
  SuggestImprovementsResponse,
  SnippetsResponse,
  ShareSessionResponse,
  RestoreSessionResponse,
  SwitchNamespaceResponse,
  SessionInfoResponse,
  UploadHistoryResponse,
  TypeInfoResponse,
  AproposResponse,
  SymbolAtPointResponse,
  DependenciesResponse,
  BuildResponse,
  EvalMultipleResponse,
  CancelResponse,
  CapabilitiesResponse,
  VersionResponse,
  LoadedModulesResponse,
  CompleteContextResponse,
  EldocBatchResponse,
  IndentInfoResponse,
  HighlightRegionsResponse,
  EvalAtPointResponse,
  StreamEvalResponse,
  ModuleDocResponse,
  SearchDocsResponse,
  HistoryResponse,
  ClearSessionResponse,
  ModuleInfoResponse,
  ListMacrosResponse,
  SearchHistoryResponse,
  GenerateDocResponse,
  ModuleSummaryResponse,
  ExpandSnippetResponse,
  TextDocumentDidOpenResponse,
  TextDocumentDidChangeResponse,
  TextDocumentDidCloseResponse,
} from "./types/protocol";

/**
 * Configuration for xREPL client
 */
export type XReplClientConfig =
  | { type: "tcp"; config: TcpConfig }
  | { type: "unix"; config: UnixSocketConfig };

/**
 * Main xREPL client interface
 */
export interface XReplClient {
  // Connection management
  connect(): Promise<Result<void, ClientError>>;
  disconnect(): Promise<Result<void, ClientError>>;
  isConnected(): boolean;

  // Session management
  getActiveSession(): string | undefined;
  setActiveSession(sessionId: string): Result<void, ClientError>;

  // Phase 1: Core REPL operations
  eval(params: EvalParams): Promise<Result<EvalResponse, OperationError>>;
  clone(
    sourceSession?: string
  ): Promise<Result<CloneResponse, OperationError>>;
  close(sessionId: string): Promise<Result<CloseResponse, OperationError>>;
  lsSessions(): Promise<Result<LsSessionsResponse, OperationError>>;
  ping(): Promise<Result<PingResponse, OperationError>>;
  describe(): Promise<Result<DescribeResponse, OperationError>>;
  interrupt(
    sessionId: string,
    interruptId?: string
  ): Promise<Result<InterruptResponse, OperationError>>;
  loadFile(
    params: LoadFileParams
  ): Promise<Result<LoadFileResponse, OperationError>>;

  // Phase 2: Code Intelligence operations
  complete(
    params: CompleteParams
  ): Promise<Result<CompleteResponse, OperationError>>;
  signature(
    params: SignatureParams
  ): Promise<Result<SignatureResponse, OperationError>>;
  eldoc(params: EldocParams): Promise<Result<EldocResponse, OperationError>>;
  doc(params: DocParams): Promise<Result<DocResponse, OperationError>>;
  findDefinition(
    params: FindDefinitionParams
  ): Promise<Result<FindDefinitionResponse, OperationError>>;
  findReferences(
    params: FindReferencesParams
  ): Promise<Result<FindReferencesResponse, OperationError>>;
  listDefinitions(
    params: ListDefinitionsParams
  ): Promise<Result<ListDefinitionsResponse, OperationError>>;
  format(
    params: FormatParams
  ): Promise<Result<FormatResponse, OperationError>>;

  // Phase 3: Compilation & Building operations
  compileFile(
    params: CompileFileParams
  ): Promise<Result<CompileFileResponse, OperationError>>;
  compileProject(
    params: CompileProjectParams
  ): Promise<Result<CompileProjectResponse, OperationError>>;
  lint(params: LintParams): Promise<Result<LintResponse, OperationError>>;
  bufferAnalysis(
    params: BufferAnalysisParams
  ): Promise<Result<BufferAnalysisResponse, OperationError>>;

  // Phase 5: Debugging operations
  setBreakpoint(
    params: SetBreakpointParams
  ): Promise<Result<SetBreakpointResponse, OperationError>>;
  clearBreakpoint(
    params: ClearBreakpointParams
  ): Promise<Result<ClearBreakpointResponse, OperationError>>;
  listBreakpoints(): Promise<Result<ListBreakpointsResponse, OperationError>>;
  stacktrace(
    params: StacktraceParams
  ): Promise<Result<StacktraceResponse, OperationError>>;
  step(params: StepParams): Promise<Result<StepResponse, OperationError>>;
  inspectLocals(
    params: InspectLocalsParams
  ): Promise<Result<InspectLocalsResponse, OperationError>>;
  evalInFrame(
    params: EvalInFrameParams
  ): Promise<Result<EvalInFrameResponse, OperationError>>;

  // Phase 6: Testing & Refactoring operations
  testRun(
    params: TestRunParams
  ): Promise<Result<TestRunResponse, OperationError>>;
  testCoverage(
    params: TestCoverageParams
  ): Promise<Result<TestCoverageResponse, OperationError>>;
  testRerunFailures(
    params: TestRerunFailuresParams
  ): Promise<Result<TestRerunFailuresResponse, OperationError>>;
  renameSymbol(
    params: RenameSymbolParams
  ): Promise<Result<RenameSymbolResponse, OperationError>>;
  extractFunction(
    params: ExtractFunctionParams
  ): Promise<Result<ExtractFunctionResponse, OperationError>>;
  inlineFunction(
    params: InlineFunctionParams
  ): Promise<Result<InlineFunctionResponse, OperationError>>;

  // Phase 7: BEAM-Specific operations
  hotReload(
    params: HotReloadParams
  ): Promise<Result<HotReloadResponse, OperationError>>;
  listProcesses(
    params: ListProcessesParams
  ): Promise<Result<ListProcessesResponse, OperationError>>;
  inspectProcess(
    params: InspectProcessParams
  ): Promise<Result<InspectProcessResponse, OperationError>>;
  traceCalls(
    params: TraceCallsParams
  ): Promise<Result<TraceCallsResponse, OperationError>>;
  systemInfo(
    params: SystemInfoParams
  ): Promise<Result<SystemInfoResponse, OperationError>>;
  observerData(
    params: ObserverDataParams
  ): Promise<Result<ObserverDataResponse, OperationError>>;

  // Phase 8: Advanced Features
  macroexpand(
    params: MacroexpandParams
  ): Promise<Result<MacroexpandResponse, OperationError>>;
  macroexpandAll(
    params: MacroexpandAllParams
  ): Promise<Result<MacroexpandAllResponse, OperationError>>;
  profileStart(
    params: ProfileStartParams
  ): Promise<Result<ProfileStartResponse, OperationError>>;
  profileStop(
    params: ProfileStopParams
  ): Promise<Result<ProfileStopResponse, OperationError>>;
  benchmark(
    params: BenchmarkParams
  ): Promise<Result<BenchmarkResponse, OperationError>>;
  workspaceSymbols(
    params: WorkspaceSymbolsParams
  ): Promise<Result<WorkspaceSymbolsResponse, OperationError>>;
  generateFunction(
    params: GenerateFunctionParams
  ): Promise<Result<GenerateFunctionResponse, OperationError>>;
  generateTests(
    params: GenerateTestsParams
  ): Promise<Result<GenerateTestsResponse, OperationError>>;
  suggestImprovements(
    params: SuggestImprovementsParams
  ): Promise<Result<SuggestImprovementsResponse, OperationError>>;
  snippets(
    params: SnippetsParams
  ): Promise<Result<SnippetsResponse, OperationError>>;
  shareSession(
    params: ShareSessionParams
  ): Promise<Result<ShareSessionResponse, OperationError>>;
  restoreSession(
    params: RestoreSessionParams
  ): Promise<Result<RestoreSessionResponse, OperationError>>;

  // Phase 9: MUST HAVE - Essential Operations
  switchNamespace(
    params: SwitchNamespaceParams
  ): Promise<Result<SwitchNamespaceResponse, OperationError>>;
  sessionInfo(
    params: SessionInfoParams
  ): Promise<Result<SessionInfoResponse, OperationError>>;
  uploadHistory(
    params: UploadHistoryParams
  ): Promise<Result<UploadHistoryResponse, OperationError>>;
  typeInfo(
    params: TypeInfoParams
  ): Promise<Result<TypeInfoResponse, OperationError>>;
  apropos(
    params: AproposParams
  ): Promise<Result<AproposResponse, OperationError>>;
  symbolAtPoint(
    params: SymbolAtPointParams
  ): Promise<Result<SymbolAtPointResponse, OperationError>>;
  dependencies(
    params: DependenciesParams
  ): Promise<Result<DependenciesResponse, OperationError>>;
  build(
    params: BuildParams
  ): Promise<Result<BuildResponse, OperationError>>;
  evalMultiple(
    params: EvalMultipleParams
  ): Promise<Result<EvalMultipleResponse, OperationError>>;
  cancel(
    params: CancelParams
  ): Promise<Result<CancelResponse, OperationError>>;
  capabilities(
    params: CapabilitiesParams
  ): Promise<Result<CapabilitiesResponse, OperationError>>;
  version(
    params: VersionParams
  ): Promise<Result<VersionResponse, OperationError>>;
  loadedModules(
    params: LoadedModulesParams
  ): Promise<Result<LoadedModulesResponse, OperationError>>;

  // Phase 10: SHOULD HAVE - Enhanced Features
  completeContext(
    params: CompleteContextParams
  ): Promise<Result<CompleteContextResponse, OperationError>>;
  eldocBatch(
    params: EldocBatchParams
  ): Promise<Result<EldocBatchResponse, OperationError>>;
  indentInfo(
    params: IndentInfoParams
  ): Promise<Result<IndentInfoResponse, OperationError>>;
  highlightRegions(
    params: HighlightRegionsParams
  ): Promise<Result<HighlightRegionsResponse, OperationError>>;
  evalAtPoint(
    params: EvalAtPointParams
  ): Promise<Result<EvalAtPointResponse, OperationError>>;
  streamEval(
    params: StreamEvalParams
  ): Promise<Result<StreamEvalResponse, OperationError>>;
  moduleDoc(
    params: ModuleDocParams
  ): Promise<Result<ModuleDocResponse, OperationError>>;
  searchDocs(
    params: SearchDocsParams
  ): Promise<Result<SearchDocsResponse, OperationError>>;
  history(
    params: HistoryParams
  ): Promise<Result<HistoryResponse, OperationError>>;
  clearSession(
    params: ClearSessionParams
  ): Promise<Result<ClearSessionResponse, OperationError>>;
  moduleInfo(
    params: ModuleInfoParams
  ): Promise<Result<ModuleInfoResponse, OperationError>>;

  // Phase 11: NICE TO HAVE - Additional Features
  listMacros(
    params: ListMacrosParams
  ): Promise<Result<ListMacrosResponse, OperationError>>;
  searchHistory(
    params: SearchHistoryParams
  ): Promise<Result<SearchHistoryResponse, OperationError>>;
  generateDoc(
    params: GenerateDocParams
  ): Promise<Result<GenerateDocResponse, OperationError>>;
  moduleSummary(
    params: ModuleSummaryParams
  ): Promise<Result<ModuleSummaryResponse, OperationError>>;
  expandSnippet(
    params: ExpandSnippetParams
  ): Promise<Result<ExpandSnippetResponse, OperationError>>;
  textDocumentDidOpen(
    params: TextDocumentDidOpenParams
  ): Promise<Result<TextDocumentDidOpenResponse, OperationError>>;
  textDocumentDidChange(
    params: TextDocumentDidChangeParams
  ): Promise<Result<TextDocumentDidChangeResponse, OperationError>>;
  textDocumentDidClose(
    params: TextDocumentDidCloseParams
  ): Promise<Result<TextDocumentDidCloseResponse, OperationError>>;
}

/**
 * Create an xREPL client
 *
 * @param config - Client configuration (TCP or UNIX socket)
 * @returns Result containing client instance or error
 *
 * @example
 * ```typescript
 * // TCP connection
 * const tcpClient = createClient({
 *   type: "tcp",
 *   config: {
 *     host: "localhost",
 *     port: 50123,
 *     token: "secret-token"
 *   }
 * });
 *
 * // UNIX socket connection
 * const unixClient = createClient({
 *   type: "unix",
 *   config: {
 *     socketPath: "/tmp/xrepl.sock"
 *   }
 * });
 * ```
 */
export function createClient(
  config: XReplClientConfig
): Result<XReplClient, ClientError> {
  try {
    // Create appropriate transport
    const transport: Transport =
      config.type === "tcp"
        ? new TcpTransport(config.config)
        : new UnixSocketTransport(config.config);

    // Create connection manager
    const connectionManager = new ConnectionManager(transport, {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      requestTimeout: 30000,
    });

    // Create session tracker
    const sessionTracker = new SessionTracker();

    // Get token for TCP connections
    const token = config.type === "tcp" ? config.config.token : undefined;

    // Return client implementation
    return ok({
      async connect(): Promise<Result<void, ClientError>> {
        const result = await connectionManager.connect();
        if (result.isErr()) {
          return err({
            type: "client_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      async disconnect(): Promise<Result<void, ClientError>> {
        const result = await connectionManager.disconnect();
        if (result.isErr()) {
          return err({
            type: "client_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      isConnected(): boolean {
        return connectionManager.isConnected();
      },

      getActiveSession(): string | undefined {
        return sessionTracker.getActiveSession();
      },

      setActiveSession(sessionId: string): Result<void, ClientError> {
        const result = sessionTracker.setActiveSession(sessionId);
        if (result.isErr()) {
          return err({
            type: "session_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      async eval(
        params: EvalParams
      ): Promise<Result<EvalResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eval",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return evalCode(connectionManager, session, params, token);
      },

      async clone(
        sourceSession?: string
      ): Promise<Result<CloneResponse, OperationError>> {
        const result = await cloneSession(
          connectionManager,
          sourceSession,
          token
        );

        // Track the new session
        if (result.isOk()) {
          sessionTracker.addSession({
            id: result.value.new_session,
            active: true,
            created: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            namespace: result.value.namespace,
          });
        }

        return result;
      },

      async close(
        sessionId: string
      ): Promise<Result<CloseResponse, OperationError>> {
        const result = await closeSession(connectionManager, sessionId, token);

        // Remove session from tracker
        if (result.isOk()) {
          sessionTracker.removeSession(sessionId);
        }

        return result;
      },

      async lsSessions(): Promise<Result<LsSessionsResponse, OperationError>> {
        return listSessions(connectionManager, token);
      },

      async ping(): Promise<Result<PingResponse, OperationError>> {
        return ping(connectionManager, token);
      },

      async describe(): Promise<Result<DescribeResponse, OperationError>> {
        return describe(connectionManager, token);
      },

      async interrupt(
        sessionId: string,
        interruptId?: string
      ): Promise<Result<InterruptResponse, OperationError>> {
        return interrupt(connectionManager, sessionId, interruptId, token);
      },

      async loadFile(
        params: LoadFileParams
      ): Promise<Result<LoadFileResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "load-file",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return loadFile(connectionManager, session, params, token);
      },

      // Phase 2: Code Intelligence operations
      async complete(
        params: CompleteParams
      ): Promise<Result<CompleteResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "complete",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return complete(connectionManager, session, params, token);
      },

      async signature(
        params: SignatureParams
      ): Promise<Result<SignatureResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "signature",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return signature(connectionManager, session, params, token);
      },

      async eldoc(
        params: EldocParams
      ): Promise<Result<EldocResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eldoc",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return eldoc(connectionManager, session, params, token);
      },

      async doc(
        params: DocParams
      ): Promise<Result<DocResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "doc",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return doc(connectionManager, session, params, token);
      },

      async findDefinition(
        params: FindDefinitionParams
      ): Promise<Result<FindDefinitionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "find-definition",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return findDefinition(connectionManager, session, params, token);
      },

      async findReferences(
        params: FindReferencesParams
      ): Promise<Result<FindReferencesResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "find-references",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return findReferences(connectionManager, session, params, token);
      },

      async listDefinitions(
        params: ListDefinitionsParams
      ): Promise<Result<ListDefinitionsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "list-definitions",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return listDefinitions(connectionManager, session, params, token);
      },

      async format(
        params: FormatParams
      ): Promise<Result<FormatResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "format",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return format(connectionManager, session, params, token);
      },

      // Phase 3: Compilation & Building operations
      async compileFile(
        params: CompileFileParams
      ): Promise<Result<CompileFileResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "compile-file",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return compileFile(connectionManager, session, params, token);
      },

      async compileProject(
        params: CompileProjectParams
      ): Promise<Result<CompileProjectResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "compile-project",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return compileProject(connectionManager, session, params, token);
      },

      async lint(
        params: LintParams
      ): Promise<Result<LintResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "lint",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return lint(connectionManager, session, params, token);
      },

      async bufferAnalysis(
        params: BufferAnalysisParams
      ): Promise<Result<BufferAnalysisResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "buffer-analysis",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return bufferAnalysis(connectionManager, session, params, token);
      },

      // Phase 5: Debugging operations
      async setBreakpoint(
        params: SetBreakpointParams
      ): Promise<Result<SetBreakpointResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "set-breakpoint",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return setBreakpoint(connectionManager, session, params, token);
      },

      async clearBreakpoint(
        params: ClearBreakpointParams
      ): Promise<Result<ClearBreakpointResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "clear-breakpoint",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return clearBreakpoint(connectionManager, session, params, token);
      },

      async listBreakpoints(): Promise<
        Result<ListBreakpointsResponse, OperationError>
      > {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "list-breakpoints",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return listBreakpoints(connectionManager, session, token);
      },

      async stacktrace(
        params: StacktraceParams
      ): Promise<Result<StacktraceResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "stacktrace",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return stacktrace(connectionManager, session, params, token);
      },

      async step(
        params: StepParams
      ): Promise<Result<StepResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "step",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return step(connectionManager, session, params, token);
      },

      async inspectLocals(
        params: InspectLocalsParams
      ): Promise<Result<InspectLocalsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "inspect-locals",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return inspectLocals(connectionManager, session, params, token);
      },

      async evalInFrame(
        params: EvalInFrameParams
      ): Promise<Result<EvalInFrameResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eval-in-frame",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return evalInFrame(connectionManager, session, params, token);
      },

      // Phase 6: Testing & Refactoring operations
      async testRun(
        params: TestRunParams
      ): Promise<Result<TestRunResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "test-run",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return testRun(connectionManager, session, params, token);
      },

      async testCoverage(
        params: TestCoverageParams
      ): Promise<Result<TestCoverageResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "test-coverage",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return testCoverage(connectionManager, session, params, token);
      },

      async testRerunFailures(
        params: TestRerunFailuresParams
      ): Promise<Result<TestRerunFailuresResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "test-rerun-failures",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return testRerunFailures(connectionManager, session, params, token);
      },

      async renameSymbol(
        params: RenameSymbolParams
      ): Promise<Result<RenameSymbolResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "rename-symbol",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return renameSymbol(connectionManager, session, params, token);
      },

      async extractFunction(
        params: ExtractFunctionParams
      ): Promise<Result<ExtractFunctionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "extract-function",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return extractFunction(connectionManager, session, params, token);
      },

      async inlineFunction(
        params: InlineFunctionParams
      ): Promise<Result<InlineFunctionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "inline-function",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return inlineFunction(connectionManager, session, params, token);
      },

      // Phase 7: BEAM-Specific operations
      async hotReload(
        params: HotReloadParams
      ): Promise<Result<HotReloadResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "hot-reload",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return hotReload(connectionManager, session, params, token);
      },

      async listProcesses(
        params: ListProcessesParams
      ): Promise<Result<ListProcessesResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "list-processes",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return listProcesses(connectionManager, session, params, token);
      },

      async inspectProcess(
        params: InspectProcessParams
      ): Promise<Result<InspectProcessResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "inspect-process",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return inspectProcess(connectionManager, session, params, token);
      },

      async traceCalls(
        params: TraceCallsParams
      ): Promise<Result<TraceCallsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "trace-calls",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return traceCalls(connectionManager, session, params, token);
      },

      async systemInfo(
        params: SystemInfoParams
      ): Promise<Result<SystemInfoResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "system-info",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return systemInfo(connectionManager, session, params, token);
      },

      async observerData(
        params: ObserverDataParams
      ): Promise<Result<ObserverDataResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "observer-data",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return observerData(connectionManager, session, params, token);
      },

      // Phase 8: Advanced Features
      async macroexpand(
        params: MacroexpandParams
      ): Promise<Result<MacroexpandResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "macroexpand",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return macroexpand(connectionManager, session, params, token);
      },

      async macroexpandAll(
        params: MacroexpandAllParams
      ): Promise<Result<MacroexpandAllResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "macroexpand-all",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return macroexpandAll(connectionManager, session, params, token);
      },

      async profileStart(
        params: ProfileStartParams
      ): Promise<Result<ProfileStartResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "profile-start",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return profileStart(connectionManager, session, params, token);
      },

      async profileStop(
        params: ProfileStopParams
      ): Promise<Result<ProfileStopResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "profile-stop",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return profileStop(connectionManager, session, params, token);
      },

      async benchmark(
        params: BenchmarkParams
      ): Promise<Result<BenchmarkResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "benchmark",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return benchmark(connectionManager, session, params, token);
      },

      async workspaceSymbols(
        params: WorkspaceSymbolsParams
      ): Promise<Result<WorkspaceSymbolsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "workspace-symbols",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return workspaceSymbols(connectionManager, session, params, token);
      },

      async generateFunction(
        params: GenerateFunctionParams
      ): Promise<Result<GenerateFunctionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "generate-function",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return generateFunction(connectionManager, session, params, token);
      },

      async generateTests(
        params: GenerateTestsParams
      ): Promise<Result<GenerateTestsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "generate-tests",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return generateTests(connectionManager, session, params, token);
      },

      async suggestImprovements(
        params: SuggestImprovementsParams
      ): Promise<Result<SuggestImprovementsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "suggest-improvements",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return suggestImprovements(connectionManager, session, params, token);
      },

      async snippets(
        params: SnippetsParams
      ): Promise<Result<SnippetsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "snippets",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return snippets(connectionManager, session, params, token);
      },

      async shareSession(
        params: ShareSessionParams
      ): Promise<Result<ShareSessionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "share-session",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return shareSession(connectionManager, session, params, token);
      },

      async restoreSession(
        params: RestoreSessionParams
      ): Promise<Result<RestoreSessionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "restore-session",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return restoreSession(connectionManager, session, params, token);
      },

      // Phase 9: MUST HAVE - Essential Operations
      async switchNamespace(
        params: SwitchNamespaceParams
      ): Promise<Result<SwitchNamespaceResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "switch-namespace",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return switchNamespace(connectionManager, session, params, token);
      },

      async sessionInfo(
        params: SessionInfoParams
      ): Promise<Result<SessionInfoResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "session-info",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return sessionInfo(connectionManager, session, params, token);
      },

      async uploadHistory(
        params: UploadHistoryParams
      ): Promise<Result<UploadHistoryResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "upload-history",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return uploadHistory(connectionManager, session, params, token);
      },

      async typeInfo(
        params: TypeInfoParams
      ): Promise<Result<TypeInfoResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "type-info",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return typeInfo(connectionManager, session, params, token);
      },

      async apropos(
        params: AproposParams
      ): Promise<Result<AproposResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "apropos",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return apropos(connectionManager, session, params, token);
      },

      async symbolAtPoint(
        params: SymbolAtPointParams
      ): Promise<Result<SymbolAtPointResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "symbol-at-point",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return symbolAtPoint(connectionManager, session, params, token);
      },

      async dependencies(
        params: DependenciesParams
      ): Promise<Result<DependenciesResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "dependencies",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return dependencies(connectionManager, session, params, token);
      },

      async build(
        params: BuildParams
      ): Promise<Result<BuildResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "build",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return build(connectionManager, session, params, token);
      },

      async evalMultiple(
        params: EvalMultipleParams
      ): Promise<Result<EvalMultipleResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eval-multiple",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return evalMultiple(connectionManager, session, params, token);
      },

      async cancel(
        params: CancelParams
      ): Promise<Result<CancelResponse, OperationError>> {
        // Note: cancel doesn't require a session since it operates on request IDs
        return cancel(connectionManager, "", params, token);
      },

      async capabilities(
        params: CapabilitiesParams
      ): Promise<Result<CapabilitiesResponse, OperationError>> {
        // Note: capabilities is a global query, doesn't require a session
        return capabilities(connectionManager, params, token);
      },

      async version(
        params: VersionParams
      ): Promise<Result<VersionResponse, OperationError>> {
        // Note: version is a global query, doesn't require a session
        return version(connectionManager, params, token);
      },

      async loadedModules(
        params: LoadedModulesParams
      ): Promise<Result<LoadedModulesResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "loaded-modules",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return loadedModules(connectionManager, session, params, token);
      },

      // Phase 10: SHOULD HAVE - Enhanced Features
      async completeContext(
        params: CompleteContextParams
      ): Promise<Result<CompleteContextResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "complete-context",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return completeContext(connectionManager, session, params, token);
      },

      async eldocBatch(
        params: EldocBatchParams
      ): Promise<Result<EldocBatchResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eldoc-batch",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return eldocBatch(connectionManager, session, params, token);
      },

      async indentInfo(
        params: IndentInfoParams
      ): Promise<Result<IndentInfoResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "indent-info",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return indentInfo(connectionManager, session, params, token);
      },

      async highlightRegions(
        params: HighlightRegionsParams
      ): Promise<Result<HighlightRegionsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "highlight-regions",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return highlightRegions(connectionManager, session, params, token);
      },

      async evalAtPoint(
        params: EvalAtPointParams
      ): Promise<Result<EvalAtPointResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eval-at-point",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return evalAtPoint(connectionManager, session, params, token);
      },

      async streamEval(
        params: StreamEvalParams
      ): Promise<Result<StreamEvalResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "stream-eval",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return streamEval(connectionManager, session, params, token);
      },

      async moduleDoc(
        params: ModuleDocParams
      ): Promise<Result<ModuleDocResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "module-doc",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return moduleDoc(connectionManager, session, params, token);
      },

      async searchDocs(
        params: SearchDocsParams
      ): Promise<Result<SearchDocsResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "search-docs",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return searchDocs(connectionManager, session, params, token);
      },

      async history(
        params: HistoryParams
      ): Promise<Result<HistoryResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "history",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return history(connectionManager, session, params, token);
      },

      async clearSession(
        params: ClearSessionParams
      ): Promise<Result<ClearSessionResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "clear-session",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return clearSession(connectionManager, session, params, token);
      },

      async moduleInfo(
        params: ModuleInfoParams
      ): Promise<Result<ModuleInfoResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "module-info",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return moduleInfo(connectionManager, session, params, token);
      },

      // Phase 11: NICE TO HAVE - Additional Features
      async listMacros(
        params: ListMacrosParams
      ): Promise<Result<ListMacrosResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "list-macros",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return listMacros(connectionManager, session, params, token);
      },

      async searchHistory(
        params: SearchHistoryParams
      ): Promise<Result<SearchHistoryResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "search-history",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return searchHistory(connectionManager, session, params, token);
      },

      async generateDoc(
        params: GenerateDocParams
      ): Promise<Result<GenerateDocResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "generate-doc",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return generateDoc(connectionManager, session, params, token);
      },

      async moduleSummary(
        params: ModuleSummaryParams
      ): Promise<Result<ModuleSummaryResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "module-summary",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return moduleSummary(connectionManager, session, params, token);
      },

      async expandSnippet(
        params: ExpandSnippetParams
      ): Promise<Result<ExpandSnippetResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "expand-snippet",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return expandSnippet(connectionManager, session, params, token);
      },

      async textDocumentDidOpen(
        params: TextDocumentDidOpenParams
      ): Promise<Result<TextDocumentDidOpenResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "text-document-did-open",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return textDocumentDidOpen(connectionManager, session, params, token);
      },

      async textDocumentDidChange(
        params: TextDocumentDidChangeParams
      ): Promise<Result<TextDocumentDidChangeResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "text-document-did-change",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return textDocumentDidChange(connectionManager, session, params, token);
      },

      async textDocumentDidClose(
        params: TextDocumentDidCloseParams
      ): Promise<Result<TextDocumentDidCloseResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "text-document-did-close",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return textDocumentDidClose(connectionManager, session, params, token);
      },
    });
  } catch (error) {
    return err({
      type: "client_creation_error",
      message: `Failed to create client: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
