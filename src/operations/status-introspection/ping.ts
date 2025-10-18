import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { PingRequest, PingResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Ping the server (health check)
 *
 * @param connection - Active connection manager
 * @param token - Optional auth token for TCP connections
 * @returns Result containing ping response or error
 *
 * @example
 * ```typescript
 * const result = await ping(connection);
 * result.match(
 *   (response) => console.log("Server is alive"),
 *   (error) => console.error(`Error: ${error.message}`)
 * );
 * ```
 */
export async function ping(
  connection: ConnectionManager,
  token?: string
): Promise<Result<PingResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("ping");

  // Build request
  const request: PingRequest = {
    id: requestId,
    op: "ping",
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<PingRequest, PingResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "ping",
    message: error.message,
  }));
}
