import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { HotReloadRequest, HotReloadResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the hot-reload operation
 */
export interface HotReloadParams {
  /** Optional: specific modules to reload (default: all changed) */
  modules?: string[];
  /** Purge old code */
  purge?: boolean;
}

/**
 * Hot reload code modules
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Hot reload parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing reload results or error
 *
 * @example
 * ```typescript
 * // Reload all changed modules
 * const result = await hotReload(connection, sessionId, {});
 *
 * // Reload specific modules with purge
 * const result = await hotReload(connection, sessionId, {
 *   modules: ["my-module", "another-module"],
 *   purge: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Reloaded: ${response.reloaded_modules.join(", ")}`);
 *     if (response.errors) {
 *       response.errors.forEach(err => {
 *         console.error(`${err.module}: ${err.error}`);
 *       });
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function hotReload(
  connection: ConnectionManager,
  sessionId: string,
  params: HotReloadParams,
  token?: string
): Promise<Result<HotReloadResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("hot-reload");

  // Build request
  const request: HotReloadRequest = {
    id: requestId,
    op: "hot-reload",
    session: sessionId,
    ...(params.modules && { modules: params.modules }),
    ...(params.purge !== undefined && { purge: params.purge }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    HotReloadRequest,
    HotReloadResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "hot-reload",
    message: error.message,
  }));
}
