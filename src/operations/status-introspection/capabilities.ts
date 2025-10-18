import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  CapabilitiesRequest,
  CapabilitiesResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the capabilities operation
 */
export interface CapabilitiesParams {
  // No parameters needed - capabilities is a global query
}

/**
 * Get detailed information about what operations the server supports
 *
 * @param connection - Active connection manager
 * @param params - Capabilities parameters (empty)
 * @param token - Optional auth token for TCP connections
 * @returns Result containing server capabilities or error
 *
 * @example
 * ```typescript
 * const result = await capabilities(connection, {});
 *
 * result.match(
 *   (response) => {
 *     console.log("Supported operations:", response.capabilities.ops.length);
 *     console.log("Hot reload:", response.capabilities.features.hot_reload);
 *     console.log("Debugging:", response.capabilities.features.debugging);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function capabilities(
  connection: ConnectionManager,
  _params: CapabilitiesParams,
  token?: string
): Promise<Result<CapabilitiesResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("capabilities");

  // Build request
  const request: CapabilitiesRequest = {
    id: requestId,
    op: "capabilities",
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    CapabilitiesRequest,
    CapabilitiesResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "capabilities",
    message: error.message,
  }));
}
