import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  CompleteContextRequest,
  CompleteContextResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the complete-context operation
 */
export interface CompleteContextParams {
  /** Full buffer contents */
  buffer: string;
  /** Cursor line number (1-based) */
  cursor_line: number;
  /** Cursor column number (1-based) */
  cursor_column: number;
  /** Optional parse tree for enhanced completion */
  parse_tree?: unknown;
}

/**
 * Get completions with rich context awareness
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Complete context parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing context-aware completions or error
 *
 * @example
 * ```typescript
 * const result = await completeContext(connection, sessionId, {
 *   buffer: "(defun foo (x) (lists:ma",
 *   cursor_line: 1,
 *   cursor_column: 25
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Candidates:", response.candidates);
 *     console.log("Context:", response.context);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function completeContext(
  connection: ConnectionManager,
  sessionId: string,
  params: CompleteContextParams,
  token?: string
): Promise<Result<CompleteContextResponse, OperationError>> {
  // Validate required parameters
  if (!params.buffer || typeof params.buffer !== "string") {
    return err({
      type: "validation_error",
      operation: "complete-context",
      message: "buffer parameter must be a non-empty string",
    });
  }

  if (typeof params.cursor_line !== "number" || params.cursor_line < 1) {
    return err({
      type: "validation_error",
      operation: "complete-context",
      message: "cursor_line parameter must be a positive number",
    });
  }

  if (typeof params.cursor_column !== "number" || params.cursor_column < 1) {
    return err({
      type: "validation_error",
      operation: "complete-context",
      message: "cursor_column parameter must be a positive number",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("complete-context");

  // Build request
  const request: CompleteContextRequest = {
    id: requestId,
    op: "complete_context",
    session: sessionId,
    buffer: params.buffer,
    cursor_line: params.cursor_line,
    cursor_column: params.cursor_column,
    ...(token && { token }),
  };

  if (params.parse_tree !== undefined) {
    request.parse_tree = params.parse_tree;
  }

  // Send request and await response
  const result = await connection.sendRequest<
    CompleteContextRequest,
    CompleteContextResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "complete-context",
    message: error.message,
  }));
}
