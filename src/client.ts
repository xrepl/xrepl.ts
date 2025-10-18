import { Result, ok, err } from "neverthrow";
import { Transport } from "./transport/base";
import { TcpTransport, TcpConfig } from "./transport/tcp";
import { UnixSocketTransport, UnixSocketConfig } from "./transport/unix";
import { ConnectionManager } from "./connection/manager";
import { SessionTracker } from "./session/tracker";
import { ClientError, OperationError } from "./types/errors";

// Import Phase 1 operations
import { evalCode, EvalParams } from "./operations/phase1/eval";
import { cloneSession } from "./operations/phase1/clone";
import { closeSession } from "./operations/phase1/close";
import { listSessions } from "./operations/phase1/ls-sessions";
import { ping } from "./operations/phase1/ping";
import { describe } from "./operations/phase1/describe";
import { interrupt } from "./operations/phase1/interrupt";
import { loadFile, LoadFileParams } from "./operations/phase1/load-file";

// Import Phase 2 operations
import { complete, CompleteParams } from "./operations/phase2/complete";
import { signature, SignatureParams } from "./operations/phase2/signature";
import { eldoc, EldocParams } from "./operations/phase2/eldoc";
import { doc, DocParams } from "./operations/phase2/doc";
import {
  findDefinition,
  FindDefinitionParams,
} from "./operations/phase2/find-definition";
import {
  findReferences,
  FindReferencesParams,
} from "./operations/phase2/find-references";
import {
  listDefinitions,
  ListDefinitionsParams,
} from "./operations/phase2/list-definitions";
import { format, FormatParams } from "./operations/phase2/format";

// Import Phase 3 operations
import {
  compileFile,
  CompileFileParams,
} from "./operations/phase3/compile-file";
import {
  compileProject,
  CompileProjectParams,
} from "./operations/phase3/compile-project";
import { lint, LintParams } from "./operations/phase3/lint";
import {
  bufferAnalysis,
  BufferAnalysisParams,
} from "./operations/phase3/buffer-analysis";

// Import Phase 5 operations
import {
  setBreakpoint,
  SetBreakpointParams,
} from "./operations/phase5/set-breakpoint";
import {
  clearBreakpoint,
  ClearBreakpointParams,
} from "./operations/phase5/clear-breakpoint";
import { listBreakpoints } from "./operations/phase5/list-breakpoints";
import { stacktrace, StacktraceParams } from "./operations/phase5/stacktrace";
import { step, StepParams } from "./operations/phase5/step";
import {
  inspectLocals,
  InspectLocalsParams,
} from "./operations/phase5/inspect-locals";
import {
  evalInFrame,
  EvalInFrameParams,
} from "./operations/phase5/eval-in-frame";

// Import Phase 6 operations
import { testRun, TestRunParams } from "./operations/phase6/test-run";
import {
  testCoverage,
  TestCoverageParams,
} from "./operations/phase6/test-coverage";
import {
  testRerunFailures,
  TestRerunFailuresParams,
} from "./operations/phase6/test-rerun-failures";
import {
  renameSymbol,
  RenameSymbolParams,
} from "./operations/phase6/rename-symbol";
import {
  extractFunction,
  ExtractFunctionParams,
} from "./operations/phase6/extract-function";
import {
  inlineFunction,
  InlineFunctionParams,
} from "./operations/phase6/inline-function";

// Import Phase 7 operations
import { hotReload, HotReloadParams } from "./operations/phase7/hot-reload";
import {
  listProcesses,
  ListProcessesParams,
} from "./operations/phase7/list-processes";
import {
  inspectProcess,
  InspectProcessParams,
} from "./operations/phase7/inspect-process";
import { traceCalls, TraceCallsParams } from "./operations/phase7/trace-calls";
import { systemInfo, SystemInfoParams } from "./operations/phase7/system-info";
import {
  observerData,
  ObserverDataParams,
} from "./operations/phase7/observer-data";

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
    });
  } catch (error) {
    return err({
      type: "client_creation_error",
      message: `Failed to create client: ${error}`,
    });
  }
}
