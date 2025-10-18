import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  DependenciesRequest,
  DependenciesResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the dependencies operation
 */
export interface DependenciesParams {
  /** Project root directory path */
  project_root: string;
}

/**
 * Get project dependencies information
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Dependencies parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing project dependencies or error
 *
 * @example
 * ```typescript
 * const result = await dependencies(connection, sessionId, {
 *   project_root: "/path/to/project"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.dependencies.forEach(dep => {
 *       console.log(`${dep.name} ${dep.version} (${dep.type})`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function dependencies(
  connection: ConnectionManager,
  sessionId: string,
  params: DependenciesParams,
  token?: string
): Promise<Result<DependenciesResponse, OperationError>> {
  // Validate required parameters
  if (!params.project_root || typeof params.project_root !== "string") {
    return err({
      type: "validation_error",
      operation: "dependencies",
      message: "project_root parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("dependencies");

  // Build request
  const request: DependenciesRequest = {
    id: requestId,
    op: "dependencies",
    session: sessionId,
    project_root: params.project_root,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    DependenciesRequest,
    DependenciesResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "dependencies",
    message: error.message,
  }));
}
