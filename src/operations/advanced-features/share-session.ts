import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ShareSessionRequest,
  ShareSessionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the share-session operation
 */
export interface ShareSessionParams {
  /** Session ID to share (defaults to active session) */
  session_id?: string;
  /** Include session history */
  include_history?: boolean;
  /** Include session bindings/variables */
  include_bindings?: boolean;
  /** Optional expiration time in seconds */
  expiration?: number;
  /** Optional share label/description */
  label?: string;
}

/**
 * Share a session for collaboration or persistence
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Share session parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing share information or error
 *
 * @example
 * ```typescript
 * const result = await shareSession(connection, sessionId, {
 *   include_history: true,
 *   include_bindings: true,
 *   expiration: 3600, // 1 hour
 *   label: "Debug session 2024-10-17"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Share ID:", response.share_id);
 *     console.log("Access token:", response.access_token);
 *     console.log("Expires at:", response.expires_at);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function shareSession(
  connection: ConnectionManager,
  sessionId: string,
  params: ShareSessionParams,
  token?: string
): Promise<Result<ShareSessionResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("share-session");

  // Build request
  const request: ShareSessionRequest = {
    id: requestId,
    op: "share-session",
    session: params.session_id || sessionId,
    ...(params.include_history !== undefined && {
      include_history: params.include_history,
    }),
    ...(params.include_bindings !== undefined && {
      include_bindings: params.include_bindings,
    }),
    ...(params.expiration !== undefined && { expiration: params.expiration }),
    ...(params.label && { label: params.label }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ShareSessionRequest,
    ShareSessionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "share-session",
    message: error.message,
  }));
}
