import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  CancelRequest,
  CancelResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the cancel operation
 */
export interface CancelParams {
  /** ID of the operation to cancel */
  cancel_id: string;
}

/**
 * Cancel a specific running operation by its request ID
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Cancel parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing cancellation status or error
 *
 * @example
 * ```typescript
 * const result = await cancel(connection, sessionId, {
 *   cancel_id: "eval-123"
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.cancelled) {
 *       console.log("Cancelled operation:", response.target_id);
 *     } else {
 *       console.log("Operation could not be cancelled");
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function cancel(
  connection: ConnectionManager,
  _sessionId: string,
  params: CancelParams,
  token?: string
): Promise<Result<CancelResponse, OperationError>> {
  // Validate required parameters
  if (!params.cancel_id || typeof params.cancel_id !== "string") {
    return err({
      type: "validation_error",
      operation: "cancel",
      message: "cancel_id parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("cancel");

  // Build request
  const request: CancelRequest = {
    id: requestId,
    op: "cancel",
    cancel_id: params.cancel_id,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    CancelRequest,
    CancelResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "cancel",
    message: error.message,
  }));
}
