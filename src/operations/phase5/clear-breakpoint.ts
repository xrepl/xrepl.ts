import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ClearBreakpointRequest,
  ClearBreakpointResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the clear-breakpoint operation
 */
export interface ClearBreakpointParams {
  /** ID of the breakpoint to clear */
  breakpoint_id: string;
}

/**
 * Clear/remove a breakpoint
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Breakpoint clear parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing clear status or error
 *
 * @example
 * ```typescript
 * const result = await clearBreakpoint(connection, sessionId, {
 *   breakpoint_id: "bp-001"
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.cleared) {
 *       console.log("Breakpoint cleared successfully");
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function clearBreakpoint(
  connection: ConnectionManager,
  sessionId: string,
  params: ClearBreakpointParams,
  token?: string
): Promise<Result<ClearBreakpointResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("clear-breakpoint");

  // Build request
  const request: ClearBreakpointRequest = {
    id: requestId,
    op: "clear-breakpoint",
    session: sessionId,
    breakpoint_id: params.breakpoint_id,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ClearBreakpointRequest,
    ClearBreakpointResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "clear-breakpoint",
    message: error.message,
  }));
}
