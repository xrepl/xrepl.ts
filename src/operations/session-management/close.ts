import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { CloseRequest, CloseResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Close a session
 *
 * @param connection - Active connection manager
 * @param sessionId - Session ID to close
 * @param token - Optional auth token for TCP connections
 * @returns Result containing close response or error
 *
 * @example
 * ```typescript
 * const result = await closeSession(connection, sessionId);
 * ```
 */
export async function closeSession(
  connection: ConnectionManager,
  sessionId: string,
  token?: string
): Promise<Result<CloseResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("close");

  // Build request
  const request: CloseRequest = {
    id: requestId,
    op: "close",
    session: sessionId,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<CloseRequest, CloseResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "close",
    message: error.message,
  }));
}
