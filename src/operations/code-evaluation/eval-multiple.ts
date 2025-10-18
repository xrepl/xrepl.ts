import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  EvalMultipleRequest,
  EvalMultipleResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eval-multiple operation
 */
export interface EvalMultipleParams {
  /** Array of code strings to evaluate */
  forms: string[];
}

/**
 * Evaluate multiple top-level forms in sequence
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Eval multiple parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing evaluation results or error
 *
 * @example
 * ```typescript
 * const result = await evalMultiple(connection, sessionId, {
 *   forms: [
 *     "(defun square (x) (* x x))",
 *     "(square 5)",
 *     "(+ 1 2 3)"
 *   ]
 * });
 *
 * result.match(
 *   (response) => {
 *     response.results.forEach((r, i) => {
 *       if (r.status === "ok") {
 *         console.log(`Form ${i + 1}: ${r.value}`);
 *       } else {
 *         console.error(`Form ${i + 1} error: ${r.error}`);
 *       }
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function evalMultiple(
  connection: ConnectionManager,
  sessionId: string,
  params: EvalMultipleParams,
  token?: string
): Promise<Result<EvalMultipleResponse, OperationError>> {
  // Validate required parameters
  if (!params.forms || !Array.isArray(params.forms) || params.forms.length === 0) {
    return err({
      type: "validation_error",
      operation: "eval-multiple",
      message: "forms parameter must be a non-empty array of strings",
    });
  }

  // Validate all forms are strings
  if (!params.forms.every(form => typeof form === "string")) {
    return err({
      type: "validation_error",
      operation: "eval-multiple",
      message: "all forms must be strings",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("eval-multiple");

  // Build request
  const request: EvalMultipleRequest = {
    id: requestId,
    op: "eval_multiple",
    session: sessionId,
    forms: params.forms,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    EvalMultipleRequest,
    EvalMultipleResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eval-multiple",
    message: error.message,
  }));
}
