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

// Additional operation types will be added for phases 3-7 as needed
