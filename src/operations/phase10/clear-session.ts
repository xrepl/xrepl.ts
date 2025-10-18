import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ClearSessionRequest,
  ClearSessionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the clear-session operation
 */
export interface ClearSessionParams {
  // No additional parameters beyond session
}

/**
 * Clear all bindings and state in a session, returning it to initial state
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Clear session parameters (empty)
 * @param token - Optional auth token for TCP connections
 * @returns Result containing clear confirmation or error
 *
 * @example
 * ```typescript
 * const result = await clearSession(connection, sessionId, {});
 *
 * result.match(
 *   (response) => {
 *     if (response.cleared) {
 *       console.log("Session cleared successfully");
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function clearSession(
  connection: ConnectionManager,
  sessionId: string,
  _params: ClearSessionParams,
  token?: string
): Promise<Result<ClearSessionResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("clear-session");

  // Build request
  const request: ClearSessionRequest = {
    id: requestId,
    op: "clear_session",
    session: sessionId,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ClearSessionRequest,
    ClearSessionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "clear-session",
    message: error.message,
  }));
}
