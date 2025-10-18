import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  InspectLocalsRequest,
  InspectLocalsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the inspect-locals operation
 */
export interface InspectLocalsParams {
  /** Optional frame ID to inspect (default: current frame) */
  frame_id?: number;
}

/**
 * Inspect local variables in current or specific stack frame
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Inspect parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing local variables or error
 *
 * @example
 * ```typescript
 * // Inspect current frame
 * const result = await inspectLocals(connection, sessionId, {});
 *
 * // Inspect specific frame
 * const result = await inspectLocals(connection, sessionId, {
 *   frame_id: 2
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Local variables (frame ${response.frame_id || 'current'}):`);
 *     response.locals.forEach(local => {
 *       console.log(`  ${local.name} = ${local.value}${local.type ? ` (${local.type})` : ''}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function inspectLocals(
  connection: ConnectionManager,
  sessionId: string,
  params: InspectLocalsParams,
  token?: string
): Promise<Result<InspectLocalsResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("inspect-locals");

  // Build request
  const request: InspectLocalsRequest = {
    id: requestId,
    op: "inspect-locals",
    session: sessionId,
    ...(params.frame_id !== undefined && { frame_id: params.frame_id }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    InspectLocalsRequest,
    InspectLocalsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "inspect-locals",
    message: error.message,
  }));
}
