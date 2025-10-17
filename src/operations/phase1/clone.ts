import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { CloneRequest, CloneResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Clone an existing session or create a new one
 *
 * @param connection - Active connection manager
 * @param sourceSession - Optional session ID to clone from
 * @param token - Optional auth token for TCP connections
 * @returns Result containing new session info or error
 *
 * @example
 * ```typescript
 * // Create a new session
 * const result = await cloneSession(connection);
 *
 * // Clone an existing session
 * const result = await cloneSession(connection, existingSessionId);
 * ```
 */
export async function cloneSession(
  connection: ConnectionManager,
  sourceSession?: string,
  token?: string
): Promise<Result<CloneResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("clone");

  // Build request
  const request: CloneRequest = {
    id: requestId,
    op: "clone",
    ...(sourceSession && { session: sourceSession }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<CloneRequest, CloneResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "clone",
    message: error.message,
  }));
}
