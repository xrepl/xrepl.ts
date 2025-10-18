import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  RestoreSessionRequest,
  RestoreSessionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the restore-session operation
 */
export interface RestoreSessionParams {
  /** Share ID to restore from */
  share_id: string;
  /** Optional access token if required */
  access_token?: string;
  /** Create a new session ID (true) or use original (false) */
  new_session?: boolean;
}

/**
 * Restore a previously shared session
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID (ignored if new_session is true)
 * @param params - Restore session parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing restored session information or error
 *
 * @example
 * ```typescript
 * const result = await restoreSession(connection, sessionId, {
 *   share_id: "share-abc123",
 *   access_token: "token-xyz",
 *   new_session: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Restored session:", response.session);
 *     console.log("History entries:", response.history?.length);
 *     console.log("Bindings restored:", response.bindings_count);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function restoreSession(
  connection: ConnectionManager,
  sessionId: string,
  params: RestoreSessionParams,
  token?: string
): Promise<Result<RestoreSessionResponse, OperationError>> {
  // Validate required parameters
  if (!params.share_id || typeof params.share_id !== "string") {
    return err({
      type: "validation_error",
      operation: "restore-session",
      message: "share_id parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("restore-session");

  // Build request
  const request: RestoreSessionRequest = {
    id: requestId,
    op: "restore-session",
    session: sessionId,
    share_id: params.share_id,
    ...(params.access_token && { access_token: params.access_token }),
    ...(params.new_session !== undefined && {
      new_session: params.new_session,
    }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    RestoreSessionRequest,
    RestoreSessionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "restore-session",
    message: error.message,
  }));
}
