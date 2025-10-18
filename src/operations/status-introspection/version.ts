import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  VersionRequest,
  VersionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the version operation
 */
export interface VersionParams {
  // No parameters needed - version is a global query
}

/**
 * Get version information for xrepl and related components
 *
 * @param connection - Active connection manager
 * @param params - Version parameters (empty)
 * @param token - Optional auth token for TCP connections
 * @returns Result containing version information or error
 *
 * @example
 * ```typescript
 * const result = await version(connection, {});
 *
 * result.match(
 *   (response) => {
 *     console.log("xREPL version:", response.versions.xrepl);
 *     console.log("LFE version:", response.versions.lfe);
 *     console.log("Erlang version:", response.versions.erlang);
 *     console.log("Protocol version:", response.versions.protocol);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function version(
  connection: ConnectionManager,
  _params: VersionParams,
  token?: string
): Promise<Result<VersionResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("version");

  // Build request
  const request: VersionRequest = {
    id: requestId,
    op: "version",
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    VersionRequest,
    VersionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "version",
    message: error.message,
  }));
}
