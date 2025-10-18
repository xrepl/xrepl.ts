import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  LoadedModulesRequest,
  LoadedModulesResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the loaded-modules operation
 */
export interface LoadedModulesParams {
  // No additional parameters beyond session
}

/**
 * Get list of modules currently loaded in the session
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Loaded modules parameters (empty)
 * @param token - Optional auth token for TCP connections
 * @returns Result containing loaded modules or error
 *
 * @example
 * ```typescript
 * const result = await loadedModules(connection, sessionId, {});
 *
 * result.match(
 *   (response) => {
 *     response.modules.forEach(mod => {
 *       console.log(`${mod.name} (${mod.exports} exports) - ${mod.path}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function loadedModules(
  connection: ConnectionManager,
  sessionId: string,
  _params: LoadedModulesParams,
  token?: string
): Promise<Result<LoadedModulesResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("loaded-modules");

  // Build request
  const request: LoadedModulesRequest = {
    id: requestId,
    op: "loaded_modules",
    session: sessionId,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    LoadedModulesRequest,
    LoadedModulesResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "loaded-modules",
    message: error.message,
  }));
}
