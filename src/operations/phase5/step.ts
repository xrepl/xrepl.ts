import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { StepRequest, StepResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the step operation
 */
export interface StepParams {
  /** Type of step: "into" (step into), "over" (step over), "out" (step out) */
  type: "into" | "over" | "out";
  /** Number of steps to execute (default: 1) */
  count?: number;
}

/**
 * Step through code execution
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Step parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing current frame after step or error
 *
 * @example
 * ```typescript
 * // Step into function
 * const result = await step(connection, sessionId, {
 *   type: "into"
 * });
 *
 * // Step over 3 lines
 * const result = await step(connection, sessionId, {
 *   type: "over",
 *   count: 3
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.current_frame) {
 *       console.log(`Now at: ${response.current_frame.module}:${response.current_frame.function}`);
 *     }
 *     if (response.stopped_at) {
 *       console.log(`Location: ${response.stopped_at.file}:${response.stopped_at.line}`);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function step(
  connection: ConnectionManager,
  sessionId: string,
  params: StepParams,
  token?: string
): Promise<Result<StepResponse, OperationError>> {
  // Validate step type
  if (!["into", "over", "out"].includes(params.type)) {
    return err({
      type: "validation_error",
      operation: "step",
      message: 'type must be one of: "into", "over", "out"',
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("step");

  // Build request
  const request: StepRequest = {
    id: requestId,
    op: "step",
    session: sessionId,
    type: params.type,
    ...(params.count !== undefined && { count: params.count }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<StepRequest, StepResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "step",
    message: error.message,
  }));
}
