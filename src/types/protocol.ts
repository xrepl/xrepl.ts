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

// ============================================================================
// Phase 8: Advanced Features
// ============================================================================

/**
 * Macroexpand operation - expand macros in code
 */
export interface MacroexpandRequest extends BaseRequest {
  op: "macroexpand" | "macro-expand";
  session: string;
  code: string;
  expand_all?: boolean; // Expand all levels or just one
}

export interface MacroexpandResponse extends BaseResponse {
  expanded: string;
  original: string;
}

/**
 * Macroexpand-all operation - expand all macros recursively
 */
export interface MacroexpandAllRequest extends BaseRequest {
  op: "macroexpand-all" | "macroexpand_all" | "macro-expand-all";
  session: string;
  code: string;
}

export interface MacroexpandAllResponse extends BaseResponse {
  expanded: string;
  original: string;
  expansion_depth: number;
}

/**
 * Profile-start operation - start profiling
 */
export interface ProfileStartRequest extends BaseRequest {
  op: "profile-start" | "profile_start";
  session: string;
  options?: {
    modules?: string[];
    functions?: string[];
    sample_rate?: number;
  };
}

export interface ProfileStartResponse extends BaseResponse {
  profile_id: string;
  profiling_started: boolean;
}

/**
 * Profile-stop operation - stop profiling and get results
 */
export interface ProfileStopRequest extends BaseRequest {
  op: "profile-stop" | "profile_stop";
  session: string;
  profile_id?: string;
}

export interface ProfileResult {
  function: string;
  module: string;
  calls: number;
  time_us: number; // microseconds
  percentage: number;
}

export interface ProfileStopResponse extends BaseResponse {
  profile_id?: string;
  results: ProfileResult[];
  total_time_us: number;
  total_calls: number;
}

/**
 * Benchmark operation - benchmark code execution
 */
export interface BenchmarkRequest extends BaseRequest {
  op: "benchmark";
  session: string;
  code: string;
  iterations?: number;
  warmup?: number;
}

export interface BenchmarkResponse extends BaseResponse {
  iterations: number;
  mean_time_us: number;
  median_time_us: number;
  min_time_us: number;
  max_time_us: number;
  std_dev_us: number;
  total_time_us: number;
}

/**
 * Workspace-symbols operation - search for symbols across workspace
 */
export interface WorkspaceSymbolsRequest extends BaseRequest {
  op: "workspace-symbols" | "workspace_symbols";
  session: string;
  query?: string; // Optional search query
  kind?: string; // Optional: filter by symbol kind
}

export interface SymbolInfo {
  name: string;
  kind: string; // "function", "macro", "record", "type", etc.
  location: Location;
  container?: string; // Containing module/namespace
}

export interface WorkspaceSymbolsResponse extends BaseResponse {
  symbols: SymbolInfo[];
  total: number;
}

/**
 * Generate-function operation - AI-generated function code
 */
export interface GenerateFunctionRequest extends BaseRequest {
  op: "generate-function" | "generate_function";
  session: string;
  description: string;
  name?: string;
  params?: Array<{ name: string; type?: string; description?: string }>;
  return_type?: string;
  examples?: string[];
}

export interface GenerateFunctionResponse extends BaseResponse {
  code: string;
  documentation?: string;
  tests?: string;
  confidence?: number; // 0-100
}

/**
 * Generate-tests operation - AI-generated test cases
 */
export interface GenerateTestsRequest extends BaseRequest {
  op: "generate-tests" | "generate_tests";
  session: string;
  code: string;
  function_name?: string;
  framework?: string;
  count?: number;
  include_edge_cases?: boolean;
}

export interface TestCase {
  name: string;
  code: string;
  description?: string;
  category?: string; // "basic", "edge-case", "error-handling", etc.
}

export interface GenerateTestsResponse extends BaseResponse {
  tests: TestCase[];
  test_count: number;
  framework?: string;
}

/**
 * Suggest-improvements operation - AI-powered code improvement suggestions
 */
export interface SuggestImprovementsRequest extends BaseRequest {
  op: "suggest-improvements" | "suggest_improvements";
  session: string;
  code: string;
  file?: string;
  focus?: string[]; // "performance", "readability", "style", "security", "best-practices"
  max_suggestions?: number;
}

export interface Suggestion {
  category: string; // "performance", "readability", "style", "security", "best-practices"
  description: string;
  original_code?: string;
  suggested_code?: string;
  rationale?: string;
  severity?: "info" | "warning" | "critical";
}

export interface SuggestImprovementsResponse extends BaseResponse {
  suggestions: Suggestion[];
  total: number;
}

/**
 * Snippets operation - retrieve code snippets and templates
 */
export interface SnippetsRequest extends BaseRequest {
  op: "snippets";
  session: string;
  query?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface Snippet {
  name: string;
  description: string;
  code: string;
  category?: string;
  tags?: string[];
  placeholders?: Array<{ name: string; default?: string }>;
}

export interface SnippetsResponse extends BaseResponse {
  snippets: Snippet[];
  total: number;
}

/**
 * Share-session operation - share a session for collaboration
 */
export interface ShareSessionRequest extends BaseRequest {
  op: "share-session" | "share_session";
  session: string;
  include_history?: boolean;
  include_bindings?: boolean;
  expiration?: number; // seconds
  label?: string;
}

export interface ShareSessionResponse extends BaseResponse {
  share_id: string;
  access_token?: string;
  expires_at?: string; // ISO 8601 timestamp
  url?: string; // Optional shareable URL
}

/**
 * Restore-session operation - restore a shared session
 */
export interface RestoreSessionRequest extends BaseRequest {
  op: "restore-session" | "restore_session";
  session: string;
  share_id: string;
  access_token?: string;
  new_session?: boolean;
}

export interface RestoreSessionResponse extends BaseResponse {
  session: string;
  history?: string[]; // Restored history entries
  bindings_count?: number;
  restored_at: string; // ISO 8601 timestamp
}

// ============================================================================
// Phase 9: MUST HAVE - Essential Operations
// ============================================================================

/**
 * Switch-namespace operation - change module/namespace context
 */
export interface SwitchNamespaceRequest extends BaseRequest {
  op: "switch_namespace" | "switch-namespace";
  session: string;
  namespace: string; // Module name
}

export interface SwitchNamespaceResponse extends BaseResponse {
  namespace: string; // Confirmed new namespace
}

/**
 * Session-info operation - get detailed session information
 */
export interface SessionInfoRequest extends BaseRequest {
  op: "session_info" | "session-info";
  session: string;
}

export interface SessionInfoResponse extends BaseResponse {
  session_data: {
    id: string;
    created: string;
    last_active: string;
    namespace: string;
    bindings: Record<string, string>; // Variable bindings
    loaded_modules: string[];
  };
}

/**
 * Upload-history operation - sync client history to server
 */
export interface UploadHistoryRequest extends BaseRequest {
  op: "upload_history" | "upload-history";
  session: string;
  history?: string[]; // Emacs style
  commands?: string[]; // VSCode style (alias)
}

export interface UploadHistoryResponse extends BaseResponse {
  uploaded?: number;
}

/**
 * Type-info operation - get type information
 */
export interface TypeInfoRequest extends BaseRequest {
  op: "type_info" | "type-info";
  session: string;
  symbol: string;
}

export interface TypeInfoResponse extends BaseResponse {
  type_spec: string;
  argument_types: string[];
  return_type: string;
}

/**
 * Apropos operation - search symbols
 */
export interface AproposRequest extends BaseRequest {
  op: "apropos";
  session: string;
  query: string;
  search_docs?: boolean;
  search_private?: boolean;
}

export interface AproposResult {
  name: string;
  type: string;
  arity?: number;
  module: string;
  doc: string;
}

export interface AproposResponse extends BaseResponse {
  results: AproposResult[];
}

/**
 * Symbol-at-point operation - get symbol information at location
 */
export interface SymbolAtPointRequest extends BaseRequest {
  op: "symbol_at_point" | "symbol-at-point";
  session: string;
  file: string;
  line: number;
  column: number;
  contents?: string;
}

export interface SymbolAtPointResponse extends BaseResponse {
  symbol: string;
  type: string;
  module: string;
  arity?: number;
  local: boolean;
  definition_location?: {
    file: string;
    line: number;
  };
}

/**
 * Dependencies operation - list project dependencies
 */
export interface DependenciesRequest extends BaseRequest {
  op: "dependencies";
  session: string;
  project_root: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: "required" | "test" | "dev";
}

export interface DependenciesResponse extends BaseResponse {
  dependencies: Dependency[];
}

/**
 * Build operation - execute project build
 */
export interface BuildRequest extends BaseRequest {
  op: "build";
  session: string;
  project_root: string;
  target: "compile" | "test" | "release" | string;
}

export interface BuildResponse extends BaseResponse {
  success: boolean;
  output: string;
  duration_ms: number;
}

/**
 * Eval-multiple operation - evaluate multiple forms
 */
export interface EvalMultipleRequest extends BaseRequest {
  op: "eval_multiple" | "eval-multiple";
  session: string;
  forms: string[]; // Array of code strings
}

export interface EvalResult {
  value: string;
  status: "ok" | "error";
  error?: string;
}

export interface EvalMultipleResponse extends BaseResponse {
  results: EvalResult[];
}

/**
 * Cancel operation - cancel running operation
 */
export interface CancelRequest extends BaseRequest {
  op: "cancel";
  cancel_id: string; // ID of operation to cancel
}

export interface CancelResponse extends BaseResponse {
  cancelled: boolean;
  target_id: string;
}

/**
 * Capabilities operation - get server capabilities
 */
export interface CapabilitiesRequest extends BaseRequest {
  op: "capabilities";
}

export interface OperationCapability {
  name: string;
  description: string;
  required_fields: string[];
  optional_fields: string[];
}

export interface ServerFeatures {
  hot_reload: boolean;
  debugging: boolean;
  macroexpansion: boolean;
  testing: boolean;
}

export interface CapabilitiesResponse extends BaseResponse {
  capabilities: {
    ops: OperationCapability[];
    features: ServerFeatures;
  };
}

/**
 * Version operation - get version information
 */
export interface VersionRequest extends BaseRequest {
  op: "version";
}

export interface VersionResponse extends BaseResponse {
  versions: {
    xrepl: string;
    lfe: string;
    erlang: string;
    protocol: string;
  };
}

/**
 * Loaded-modules operation - list loaded modules
 */
export interface LoadedModulesRequest extends BaseRequest {
  op: "loaded_modules" | "loaded-modules";
  session: string;
}

export interface LoadedModule {
  name: string;
  path: string;
  exports: number;
}

export interface LoadedModulesResponse extends BaseResponse {
  modules: LoadedModule[];
}

// ============================================================================
// Phase 10: SHOULD HAVE - Enhanced Features
// ============================================================================

/**
 * Complete-context operation - context-aware completion
 */
export interface CompleteContextRequest extends BaseRequest {
  op: "complete_context" | "complete-context";
  session: string;
  buffer: string;
  cursor_line: number;
  cursor_column: number;
  parse_tree?: any;
}

export interface CompleteContextResponse extends BaseResponse {
  candidates: any[]; // Same format as complete
  context: {
    in_function_call: boolean;
    function_name?: string;
    argument_position?: number;
    expected_type?: string;
  };
}

/**
 * Eldoc-batch operation - batch eldoc queries
 */
export interface EldocBatchRequest extends BaseRequest {
  op: "eldoc_batch" | "eldoc-batch";
  session: string;
  symbols: string[];
}

export interface EldocBatchResponse extends BaseResponse {
  results: Record<string, {
    signature: string;
    arglists: string[];
  }>;
}

/**
 * Indent-info operation - get indentation information
 */
export interface IndentInfoRequest extends BaseRequest {
  op: "indent_info" | "indent-info";
  session: string;
  file: string;
  line: number;
  contents: string;
}

export interface IndentInfoResponse extends BaseResponse {
  indent: {
    column: number;
    reason: string;
  };
}

/**
 * Highlight-regions operation - semantic highlighting
 */
export interface HighlightRegionsRequest extends BaseRequest {
  op: "highlight_regions" | "highlight-regions";
  session: string;
  file: string;
  contents: string;
}

export interface HighlightRegion {
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
  type: string;
  face: string;
}

export interface HighlightRegionsResponse extends BaseResponse {
  regions: HighlightRegion[];
}

/**
 * Eval-at-point operation - context-aware evaluation
 */
export interface EvalAtPointRequest extends BaseRequest {
  op: "eval_at_point" | "eval-at-point";
  session: string;
  code: string;
  file: string;
  line: number;
  column: number;
  context?: {
    buffer_contents?: string;
    surrounding_forms?: any[];
  };
}

export interface EvalAtPointResponse extends BaseResponse {
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
 * Stream-eval operation - streaming evaluation
 */
export interface StreamEvalRequest extends BaseRequest {
  op: "stream_eval" | "eval_stream" | "stream-eval" | "eval-stream";
  session: string;
  code: string;
}

export interface StreamEvalResponse extends BaseResponse {
  value?: string;
  output?: string;
  stream?: "stdout" | "stderr";
}

/**
 * Module-doc operation - module documentation
 */
export interface ModuleDocRequest extends BaseRequest {
  op: "module_doc" | "module-doc";
  session: string;
  module: string;
}

export interface ModuleFunctionDoc {
  name: string;
  arity: number;
  doc: string;
}

export interface ModuleDocResponse extends BaseResponse {
  module: string;
  doc: string;
  exports: ModuleFunctionDoc[];
  types?: any[];
  source_url?: string;
}

/**
 * Search-docs operation - search documentation
 */
export interface SearchDocsRequest extends BaseRequest {
  op: "search_docs" | "search-docs";
  session: string;
  query: string;
}

export interface DocSearchResult {
  symbol: string;
  module: string;
  doc_snippet: string;
  relevance: number;
}

export interface SearchDocsResponse extends BaseResponse {
  results: DocSearchResult[];
}

/**
 * History operation - get evaluation history
 */
export interface HistoryRequest extends BaseRequest {
  op: "history";
  session: string;
  limit?: number;
  offset?: number;
}

export interface HistoryEntry {
  index: number;
  code: string;
  result: string;
  timestamp: string;
}

export interface HistoryResponse extends BaseResponse {
  history: HistoryEntry[];
}

/**
 * Clear-session operation - clear session state
 */
export interface ClearSessionRequest extends BaseRequest {
  op: "clear_session" | "clear-session";
  session: string;
}

export interface ClearSessionResponse extends BaseResponse {
  cleared: boolean;
}

/**
 * Module-info operation - detailed module information
 */
export interface ModuleInfoRequest extends BaseRequest {
  op: "module_info" | "module-info";
  session: string;
  module: string;
}

export interface ModuleExport {
  name: string;
  arity: number;
}

export interface ModuleInfoResponse extends BaseResponse {
  module: {
    name: string;
    path: string;
    exports: ModuleExport[];
    attributes: Record<string, any>;
    compile_options: any[];
    md5: string;
  };
}
