import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ModuleInfoRequest,
  ModuleInfoResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the module-info operation
 */
export interface ModuleInfoParams {
  /** Module name to get information for */
  module: string;
}

/**
 * Get detailed information about a specific module
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Module info parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing detailed module information or error
 *
 * @example
 * ```typescript
 * const result = await moduleInfo(connection, sessionId, {
 *   module: "lists"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Module:", response.module.name);
 *     console.log("Path:", response.module.path);
 *     console.log("Exports:", response.module.exports.length);
 *     console.log("MD5:", response.module.md5);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function moduleInfo(
  connection: ConnectionManager,
  sessionId: string,
  params: ModuleInfoParams,
  token?: string
): Promise<Result<ModuleInfoResponse, OperationError>> {
  // Validate required parameters
  if (!params.module || typeof params.module !== "string") {
    return err({
      type: "validation_error",
      operation: "module-info",
      message: "module parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("module-info");

  // Build request
  const request: ModuleInfoRequest = {
    id: requestId,
    op: "module_info",
    session: sessionId,
    module: params.module,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ModuleInfoRequest,
    ModuleInfoResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "module-info",
    message: error.message,
  }));
}
