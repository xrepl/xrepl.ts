import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  EvalInFrameRequest,
  EvalInFrameResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eval-in-frame operation
 */
export interface EvalInFrameParams {
  /** Code to evaluate */
  code: string;
  /** Optional frame ID to evaluate in (default: current frame) */
  frame_id?: number;
}

/**
 * Evaluate expression in specific stack frame
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Evaluation parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing evaluation result or error
 *
 * @example
 * ```typescript
 * // Eval in current frame
 * const result = await evalInFrame(connection, sessionId, {
 *   code: "x"
 * });
 *
 * // Eval in specific frame
 * const result = await evalInFrame(connection, sessionId, {
 *   code: "(+ x 10)",
 *   frame_id: 2
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.value) {
 *       console.log(`Result: ${response.value}`);
 *     } else if (response.error) {
 *       console.log(`Error: ${response.error}`);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function evalInFrame(
  connection: ConnectionManager,
  sessionId: string,
  params: EvalInFrameParams,
  token?: string
): Promise<Result<EvalInFrameResponse, OperationError>> {
  // Validate code parameter
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "eval-in-frame",
      message: "code parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("eval-in-frame");

  // Build request
  const request: EvalInFrameRequest = {
    id: requestId,
    op: "eval-in-frame",
    session: sessionId,
    code: params.code,
    ...(params.frame_id !== undefined && { frame_id: params.frame_id }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    EvalInFrameRequest,
    EvalInFrameResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eval-in-frame",
    message: error.message,
  }));
}
