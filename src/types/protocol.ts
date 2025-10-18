/**
 * Base request structure for all xREPL operations
 */
export interface BaseRequest {
  /** Unique message ID (e.g., "req-123", "msg-0") */
  id: string;
  /** Operation name */
  op: string;
  /** Session ID (optional for most ops) */
  session?: string;
  /** Auth token (TCP only) */
  token?: string;
}

/**
 * Base response structure for all xREPL operations
 */
export interface BaseResponse {
  /** Echoed from request */
  id: string;
  /** Status array: ["done"], ["error", "done"], ["evaluating"], etc. */
  status: string[];
  /** Session ID */
  session?: string;
}

/**
 * Status values that can appear in response.status
 */
export type StatusValue =
  | "done"
  | "error"
  | "evaluating"
  | "streaming"
  | "breakpoint"
  | "session-closed"
  | "ping";

/**
 * Stack frame information for errors
 */
export interface StackFrame {
  module: string;
  function: string;
  arity: number;
  file: string;
  line: number;
}

// ============================================================================
// Phase 1: Core REPL Operations
// ============================================================================

/**
 * Eval operation - evaluate LFE code
 */
export interface EvalRequest extends BaseRequest {
  op: "eval";
  session: string;
  code: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface EvalResponse extends BaseResponse {
  value?: string;
  ns?: string;
  formatted?: string;
  error?: string;
  error_type?: string;
  stacktrace?: StackFrame[];
  out?: string;
  err?: string;
}

/**
 * Clone operation - clone an existing session or create new one
 */
export interface CloneRequest extends BaseRequest {
  op: "clone";
  session?: string; // Session to clone from (optional)
}

export interface CloneResponse extends BaseResponse {
  new_session: string;
  namespace?: string;
}

/**
 * Close operation - close a session
 */
export interface CloseRequest extends BaseRequest {
  op: "close";
  session: string;
}

export interface CloseResponse extends BaseResponse {
  // Status will contain "session-closed" and "done"
}

/**
 * Ls-sessions operation - list all active sessions
 */
export interface LsSessionsRequest extends BaseRequest {
  op: "ls-sessions";
}

export interface SessionInfo {
  id: string;
  namespace: string;
  created: string;
  last_active: string;
}

export interface LsSessionsResponse extends BaseResponse {
  sessions: SessionInfo[];
}

/**
 * Ping operation - health check
 */
export interface PingRequest extends BaseRequest {
  op: "ping";
}

export interface PingResponse extends BaseResponse {
  // Status will contain "ping" and "done"
}

/**
 * Describe operation - get server capabilities and version info
 */
export interface DescribeRequest extends BaseRequest {
  op: "describe";
}

export interface DescribeResponse extends BaseResponse {
  versions?: {
    xrepl?: string;
    lfe?: string;
    erlang?: string;
  };
  ops?: string[]; // List of supported operations
  aux?: Record<string, unknown>; // Additional server info
}

/**
 * Interrupt operation - interrupt a running evaluation
 */
export interface InterruptRequest extends BaseRequest {
  op: "interrupt";
  session: string;
  interrupt_id?: string; // ID of specific eval to interrupt
}

export interface InterruptResponse extends BaseResponse {
  // Status will indicate if interrupt was successful
}

/**
 * Load-file operation - load and evaluate an entire file
 */
export interface LoadFileRequest extends BaseRequest {
  op: "load-file";
  session: string;
  file: string; // File path to load
  content?: string; // Optional: file contents (if not provided, server reads from disk)
}

export interface LoadFileResponse extends BaseResponse {
  result?: string;
  error?: string;
  error_type?: string;
  stacktrace?: StackFrame[];
  out?: string;
  err?: string;
}

// ============================================================================
// Phase 2: Code Intelligence Operations
// ============================================================================

/**
 * Complete operation - code completion
 */
export interface CompleteRequest extends BaseRequest {
  op: "complete";
  session: string;
  prefix: string;
  context?: string;
  line?: number;
  column?: number;
}

export interface CompletionItem {
  candidate: string;
  type?: string; // "function", "module", "variable", etc.
  ns?: string;
  doc?: string;
  arglists?: string[];
}

export interface CompleteResponse extends BaseResponse {
  completions: CompletionItem[];
  prefix: string;
}

/**
 * Signature operation - function signature help
 */
export interface SignatureRequest extends BaseRequest {
  op: "signature" | "signature_help";
  session: string;
  symbol: string;
  context?: string;
}

export interface SignatureInfo {
  label: string;
  parameters?: Array<{
    label: string;
    documentation?: string;
  }>;
  documentation?: string;
}

export interface SignatureResponse extends BaseResponse {
  signatures: SignatureInfo[];
  active_signature?: number;
  active_parameter?: number;
}

/**
 * Eldoc operation - expression documentation
 */
export interface EldocRequest extends BaseRequest {
  op: "eldoc";
  session: string;
  symbol: string;
  context?: string;
}

export interface EldocResponse extends BaseResponse {
  name: string;
  doc?: string;
  arglists?: string[];
  type?: string;
}

/**
 * Doc operation - symbol documentation
 */
export interface DocRequest extends BaseRequest {
  op: "doc";
  session: string;
  symbol: string;
}

export interface DocResponse extends BaseResponse {
  doc?: string;
  formatted_doc?: string;
  arglists?: string[];
  file?: string;
  line?: number;
}

/**
 * Find-definition operation - go to definition
 */
export interface FindDefinitionRequest extends BaseRequest {
  op: "find-definition" | "definition";
  session: string;
  symbol: string;
  context?: string;
}

export interface Location {
  file: string;
  line: number;
  column?: number;
  end_line?: number;
  end_column?: number;
}

export interface FindDefinitionResponse extends BaseResponse {
  definitions: Location[];
}

/**
 * Find-references operation - find all references to a symbol
 */
export interface FindReferencesRequest extends BaseRequest {
  op: "find-references" | "references";
  session: string;
  symbol: string;
  include_declaration?: boolean;
}

export interface FindReferencesResponse extends BaseResponse {
  references: Location[];
}

/**
 * List-definitions operation - list all definitions in a file/namespace
 */
export interface ListDefinitionsRequest extends BaseRequest {
  op: "list-definitions";
  session: string;
  file?: string;
  namespace?: string;
}

export interface DefinitionInfo {
  name: string;
  type: string; // "function", "macro", "record", etc.
  location: Location;
  signature?: string;
}

export interface ListDefinitionsResponse extends BaseResponse {
  definitions: DefinitionInfo[];
}

/**
 * Format operation - format code
 */
export interface FormatRequest extends BaseRequest {
  op: "format" | "format_code";
  session: string;
  code: string;
  file?: string;
}

export interface FormatResponse extends BaseResponse {
  formatted?: string;
  error?: string;
}

// ============================================================================
// Phase 3: Compilation & Building Operations
// ============================================================================

/**
 * Diagnostic information for compilation errors/warnings
 */
export interface Diagnostic {
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  file: string;
  line: number;
  column?: number;
  end_line?: number;
  end_column?: number;
  code?: string;
}

/**
 * Compile-file operation - compile a single file
 */
export interface CompileFileRequest extends BaseRequest {
  op: "compile-file" | "compile_file";
  session: string;
  file: string;
  content?: string; // Optional: file contents (if not provided, server reads from disk)
  options?: {
    warnings_as_errors?: boolean;
    output_dir?: string;
    include_paths?: string[];
  };
}

export interface CompileFileResponse extends BaseResponse {
  success: boolean;
  diagnostics?: Diagnostic[];
  output_file?: string;
  warnings?: number;
  errors?: number;
  compile_time?: number; // milliseconds
}

/**
 * Compile-project operation - compile entire project
 */
export interface CompileProjectRequest extends BaseRequest {
  op: "compile-project" | "compile_project";
  session: string;
  project_root?: string;
  options?: {
    warnings_as_errors?: boolean;
    parallel?: boolean;
    clean?: boolean;
    output_dir?: string;
  };
}

export interface CompileProjectResponse extends BaseResponse {
  success: boolean;
  diagnostics?: Diagnostic[];
  files_compiled?: number;
  warnings?: number;
  errors?: number;
  compile_time?: number; // milliseconds
}

/**
 * Lint operation - lint code without compilation
 */
export interface LintRequest extends BaseRequest {
  op: "lint";
  session: string;
  file?: string;
  content?: string;
  code?: string; // Alternative to content
  options?: {
    rules?: string[];
    severity?: "error" | "warning" | "info";
  };
}

export interface LintResponse extends BaseResponse {
  diagnostics: Diagnostic[];
  warnings?: number;
  errors?: number;
  info?: number;
}

/**
 * Buffer-analysis operation - analyze code buffer for issues
 */
export interface BufferAnalysisRequest extends BaseRequest {
  op: "buffer-analysis" | "buffer_analysis";
  session: string;
  content: string;
  file?: string;
  options?: {
    include_warnings?: boolean;
    include_style?: boolean;
  };
}

export interface BufferAnalysisResponse extends BaseResponse {
  diagnostics: Diagnostic[];
  warnings?: number;
  errors?: number;
  suggestions?: Array<{
    message: string;
    location: Location;
    fix?: string;
  }>;
}

// ============================================================================
// Phase 5: Debugging Operations
// ============================================================================

/**
 * Set-breakpoint operation - set a breakpoint in code
 */
export interface SetBreakpointRequest extends BaseRequest {
  op: "set-breakpoint" | "set_breakpoint";
  session: string;
  file: string;
  line: number;
  column?: number;
  condition?: string; // Optional: break only if condition is true
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  column?: number;
  condition?: string;
  enabled: boolean;
}

export interface SetBreakpointResponse extends BaseResponse {
  breakpoint_id: string;
  breakpoint: Breakpoint;
}

/**
 * Clear-breakpoint operation - clear/remove a breakpoint
 */
export interface ClearBreakpointRequest extends BaseRequest {
  op: "clear-breakpoint" | "clear_breakpoint";
  session: string;
  breakpoint_id: string;
}

export interface ClearBreakpointResponse extends BaseResponse {
  cleared: boolean;
}

/**
 * List-breakpoints operation - list all active breakpoints
 */
export interface ListBreakpointsRequest extends BaseRequest {
  op: "list-breakpoints" | "list_breakpoints";
  session: string;
}

export interface ListBreakpointsResponse extends BaseResponse {
  breakpoints: Breakpoint[];
}

/**
 * Stacktrace operation - get current stack trace
 */
export interface StacktraceRequest extends BaseRequest {
  op: "stacktrace";
  session: string;
  thread_id?: string;
}

export interface StacktraceResponse extends BaseResponse {
  frames: StackFrame[];
}

/**
 * Step operation - step through code execution
 */
export interface StepRequest extends BaseRequest {
  op: "step";
  session: string;
  type: "into" | "over" | "out"; // step into, step over, step out
  count?: number; // Number of steps (default: 1)
}

export interface StepResponse extends BaseResponse {
  current_frame?: StackFrame;
  stopped_at?: Location;
}

/**
 * Inspect-locals operation - inspect local variables in current frame
 */
export interface InspectLocalsRequest extends BaseRequest {
  op: "inspect-locals" | "inspect_locals";
  session: string;
  frame_id?: number; // Optional: specific frame to inspect (default: current)
}

export interface LocalVariable {
  name: string;
  value: string;
  type?: string;
}

export interface InspectLocalsResponse extends BaseResponse {
  locals: LocalVariable[];
  frame_id?: number;
}

/**
 * Eval-in-frame operation - evaluate expression in specific stack frame
 */
export interface EvalInFrameRequest extends BaseRequest {
  op: "eval-in-frame" | "eval_in_frame";
  session: string;
  code: string;
  frame_id?: number; // Optional: specific frame (default: current)
}

export interface EvalInFrameResponse extends BaseResponse {
  value?: string;
  error?: string;
  error_type?: string;
  frame_id?: number;
}

// ============================================================================
// Phase 6: Testing & Refactoring Operations
// ============================================================================

/**
 * Test result information
 */
export interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip" | "error";
  duration?: number; // milliseconds
  error?: string;
  error_type?: string;
  stacktrace?: StackFrame[];
}

/**
 * Test-run operation - run tests
 */
export interface TestRunRequest extends BaseRequest {
  op: "test-run" | "test_run";
  session: string;
  namespace?: string; // Optional: specific namespace to test
  test?: string; // Optional: specific test to run
  options?: {
    parallel?: boolean;
    verbose?: boolean;
  };
}

export interface TestRunResponse extends BaseResponse {
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    duration: number; // milliseconds
  };
}

/**
 * Test-coverage operation - get test coverage information
 */
export interface TestCoverageRequest extends BaseRequest {
  op: "test-coverage" | "test_coverage";
  session: string;
  namespace?: string;
  options?: {
    include_source?: boolean;
  };
}

export interface CoverageInfo {
  file: string;
  lines_covered: number;
  lines_total: number;
  coverage_percent: number;
  uncovered_lines?: number[];
}

export interface TestCoverageResponse extends BaseResponse {
  coverage: CoverageInfo[];
  summary: {
    lines_covered: number;
    lines_total: number;
    coverage_percent: number;
  };
}

/**
 * Test-rerun-failures operation - rerun only failed tests
 */
export interface TestRerunFailuresRequest extends BaseRequest {
  op: "test-rerun-failures" | "test_rerun_failures";
  session: string;
  options?: {
    parallel?: boolean;
    verbose?: boolean;
  };
}

export interface TestRerunFailuresResponse extends BaseResponse {
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    duration: number; // milliseconds
  };
}

/**
 * Text edit for refactoring operations
 */
export interface TextEdit {
  file: string;
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
  new_text: string;
}

/**
 * Rename-symbol operation - rename a symbol across the codebase
 */
export interface RenameSymbolRequest extends BaseRequest {
  op: "rename-symbol" | "rename_symbol";
  session: string;
  symbol: string;
  new_name: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface RenameSymbolResponse extends BaseResponse {
  edits: TextEdit[];
  files_affected: number;
}

/**
 * Extract-function operation - extract code into a new function
 */
export interface ExtractFunctionRequest extends BaseRequest {
  op: "extract-function" | "extract_function";
  session: string;
  file: string;
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
  function_name: string;
}

export interface ExtractFunctionResponse extends BaseResponse {
  edits: TextEdit[];
  new_function: string;
}

/**
 * Inline-function operation - inline a function call
 */
export interface InlineFunctionRequest extends BaseRequest {
  op: "inline-function" | "inline_function";
  session: string;
  symbol: string;
  file?: string;
  line?: number;
  column?: number;
  inline_all?: boolean; // Inline all occurrences or just one
}

export interface InlineFunctionResponse extends BaseResponse {
  edits: TextEdit[];
  occurrences_inlined: number;
}

// ============================================================================
// Phase 7: BEAM-Specific Operations
// ============================================================================

/**
 * Process information for BEAM VM
 */
export interface ProcessInfo {
  pid: string;
  name?: string;
  initial_call?: string;
  current_function?: string;
  status: string;
  message_queue_len: number;
  heap_size?: number;
  stack_size?: number;
  reductions?: number;
}

/**
 * Hot-reload operation - hot reload code modules
 */
export interface HotReloadRequest extends BaseRequest {
  op: "hot-reload" | "hot_reload";
  session: string;
  modules?: string[]; // Optional: specific modules to reload (default: all changed)
  purge?: boolean; // Purge old code
}

export interface HotReloadResponse extends BaseResponse {
  reloaded_modules: string[];
  errors?: Array<{
    module: string;
    error: string;
  }>;
}

/**
 * List-processes operation - list all BEAM processes
 */
export interface ListProcessesRequest extends BaseRequest {
  op: "list-processes" | "list_processes";
  session: string;
  filter?: {
    min_message_queue_len?: number;
    min_heap_size?: number;
    status?: string;
  };
}

export interface ListProcessesResponse extends BaseResponse {
  processes: ProcessInfo[];
  total_processes: number;
}

/**
 * Inspect-process operation - inspect a specific BEAM process
 */
export interface InspectProcessRequest extends BaseRequest {
  op: "inspect-process" | "inspect_process";
  session: string;
  pid: string;
  options?: {
    include_messages?: boolean;
    include_backtrace?: boolean;
    include_dictionary?: boolean;
  };
}

export interface InspectProcessResponse extends BaseResponse {
  process: ProcessInfo;
  messages?: unknown[];
  backtrace?: string[];
  dictionary?: Record<string, unknown>;
}

/**
 * Trace-calls operation - trace function calls
 */
export interface TraceCallsRequest extends BaseRequest {
  op: "trace-calls" | "trace_calls";
  session: string;
  action: "start" | "stop" | "status";
  module?: string;
  function?: string;
  arity?: number;
  options?: {
    max_traces?: number;
    timeout?: number;
  };
}

export interface TraceEvent {
  timestamp: string;
  pid: string;
  module: string;
  function: string;
  arity: number;
  args?: unknown[];
  result?: unknown;
}

export interface TraceCallsResponse extends BaseResponse {
  trace_status: "started" | "stopped" | "running";
  traces?: TraceEvent[];
  trace_count?: number;
}

/**
 * System-info operation - get BEAM system information
 */
export interface SystemInfoRequest extends BaseRequest {
  op: "system-info" | "system_info";
  session: string;
  categories?: string[]; // Optional: specific categories (e.g., "memory", "cpu", "processes")
}

export interface SystemInfoResponse extends BaseResponse {
  system: {
    erlang_version?: string;
    otp_release?: string;
    erts_version?: string;
    system_architecture?: string;
  };
  memory?: {
    total: number;
    processes: number;
    system: number;
    atom: number;
    binary: number;
    code: number;
    ets: number;
  };
  statistics?: {
    uptime: number; // seconds
    run_queue: number;
    process_count: number;
    port_count: number;
    atom_count: number;
  };
  scheduler_info?: {
    schedulers: number;
    schedulers_online: number;
  };
}

/**
 * Observer-data operation - get data for observer/monitoring tools
 */
export interface ObserverDataRequest extends BaseRequest {
  op: "observer-data" | "observer_data";
  session: string;
  data_type: "applications" | "processes" | "ports" | "ets" | "mnesia";
  options?: {
    sort_by?: string;
    limit?: number;
  };
}

export interface ObserverDataResponse extends BaseResponse {
  data_type: string;
  data: unknown[]; // Type varies based on data_type
  timestamp: string;
}

// Additional operation types will be added for phase 8 as needed
