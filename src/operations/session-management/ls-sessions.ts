import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { LsSessionsRequest, LsSessionsResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * List all active sessions
 *
 * @param connection - Active connection manager
 * @param token - Optional auth token for TCP connections
 * @returns Result containing list of sessions or error
 *
 * @example
 * ```typescript
 * const result = await listSessions(connection);
 * result.match(
 *   (response) => console.log(`Active sessions: ${response.sessions.length}`),
 *   (error) => console.error(`Error: ${error.message}`)
 * );
 * ```
 */
export async function listSessions(
  connection: ConnectionManager,
  token?: string
): Promise<Result<LsSessionsResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("ls-sessions");

  // Build request
  const request: LsSessionsRequest = {
    id: requestId,
    op: "ls-sessions",
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    LsSessionsRequest,
    LsSessionsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "ls-sessions",
    message: error.message,
  }));
}
