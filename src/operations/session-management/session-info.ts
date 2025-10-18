import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SessionInfoRequest,
  SessionInfoResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the session-info operation
 */
export interface SessionInfoParams {
  /** Optional specific session ID (defaults to current session) */
  session_id?: string;
}

/**
 * Get detailed information about a session's state
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Session info parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing session information or error
 *
 * @example
 * ```typescript
 * const result = await sessionInfo(connection, sessionId, {});
 *
 * result.match(
 *   (response) => {
 *     console.log("Session ID:", response.session.id);
 *     console.log("Namespace:", response.session.namespace);
 *     console.log("Loaded modules:", response.session.loaded_modules);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function sessionInfo(
  connection: ConnectionManager,
  sessionId: string,
  params: SessionInfoParams,
  token?: string
): Promise<Result<SessionInfoResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("session-info");

  // Build request
  const request: SessionInfoRequest = {
    id: requestId,
    op: "session_info",
    session: params.session_id || sessionId,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SessionInfoRequest,
    SessionInfoResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "session-info",
    message: error.message,
  }));
}
