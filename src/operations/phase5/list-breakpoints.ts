import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ListBreakpointsRequest,
  ListBreakpointsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * List all active breakpoints
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param token - Optional auth token for TCP connections
 * @returns Result containing list of breakpoints or error
 *
 * @example
 * ```typescript
 * const result = await listBreakpoints(connection, sessionId);
 *
 * result.match(
 *   (response) => {
 *     console.log(`Active breakpoints: ${response.breakpoints.length}`);
 *     response.breakpoints.forEach(bp => {
 *       console.log(`  ${bp.id}: ${bp.file}:${bp.line}${bp.condition ? ` [${bp.condition}]` : ''}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function listBreakpoints(
  connection: ConnectionManager,
  sessionId: string,
  token?: string
): Promise<Result<ListBreakpointsResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("list-breakpoints");

  // Build request
  const request: ListBreakpointsRequest = {
    id: requestId,
    op: "list-breakpoints",
    session: sessionId,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ListBreakpointsRequest,
    ListBreakpointsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "list-breakpoints",
    message: error.message,
  }));
}
