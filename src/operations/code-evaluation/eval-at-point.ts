import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  EvalAtPointRequest,
  EvalAtPointResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eval-at-point operation
 */
export interface EvalAtPointParams {
  /** Code to evaluate */
  code: string;
  /** File path */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** Optional context information */
  context?: {
    buffer_contents?: string;
    surrounding_forms?: unknown[];
  };
}

/**
 * Evaluate with additional context for better error reporting and IDE integration
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Eval at point parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing evaluation result with enhanced location info or error
 *
 * @example
 * ```typescript
 * const result = await evalAtPoint(connection, sessionId, {
 *   code: "(+ 1 2)",
 *   file: "/path/to/file.lfe",
 *   line: 10,
 *   column: 5
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Result:", response.value);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function evalAtPoint(
  connection: ConnectionManager,
  sessionId: string,
  params: EvalAtPointParams,
  token?: string
): Promise<Result<EvalAtPointResponse, OperationError>> {
  // Validate required parameters
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "eval-at-point",
      message: "code parameter must be a non-empty string",
    });
  }

  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "eval-at-point",
      message: "file parameter must be a non-empty string",
    });
  }

  if (typeof params.line !== "number" || params.line < 1) {
    return err({
      type: "validation_error",
      operation: "eval-at-point",
      message: "line parameter must be a positive number",
    });
  }

  if (typeof params.column !== "number" || params.column < 1) {
    return err({
      type: "validation_error",
      operation: "eval-at-point",
      message: "column parameter must be a positive number",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("eval-at-point");

  // Build request
  const request: EvalAtPointRequest = {
    id: requestId,
    op: "eval_at_point",
    session: sessionId,
    code: params.code,
    file: params.file,
    line: params.line,
    column: params.column,
    ...(params.context && { context: params.context }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    EvalAtPointRequest,
    EvalAtPointResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eval-at-point",
    message: error.message,
  }));
}
