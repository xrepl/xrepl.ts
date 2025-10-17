import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { EvalRequest, EvalResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateEvalRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eval operation
 */
export interface EvalParams {
  /** LFE code to evaluate */
  code: string;
  /** File path for error reporting */
  file?: string;
  /** Starting line number */
  line?: number;
  /** Starting column */
  column?: number;
}

/**
 * Evaluate LFE code in a session context
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Evaluation parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing evaluation response or error
 *
 * @example
 * ```typescript
 * const result = await evalCode(connection, sessionId, {
 *   code: "(+ 1 2)"
 * });
 *
 * result.match(
 *   (response) => console.log(`Result: ${response.value}`),
 *   (error) => console.error(`Error: ${error.message}`)
 * );
 * ```
 */
export async function evalCode(
  connection: ConnectionManager,
  sessionId: string,
  params: EvalParams,
  token?: string
): Promise<Result<EvalResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateEvalRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("eval");

  // Build request
  const request: EvalRequest = {
    id: requestId,
    op: "eval",
    session: sessionId,
    code: params.code,
    ...(params.file && { file: params.file }),
    ...(params.line && { line: params.line }),
    ...(params.column && { column: params.column }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<EvalRequest, EvalResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eval",
    message: error.message,
  }));
}
