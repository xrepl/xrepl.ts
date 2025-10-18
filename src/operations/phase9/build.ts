import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  BuildRequest,
  BuildResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the build operation
 */
export interface BuildParams {
  /** Project root directory path */
  project_root: string;
  /** Build target: compile, test, release, or custom target */
  target: "compile" | "test" | "release" | string;
}

/**
 * Execute project build
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Build parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing build results or error
 *
 * @example
 * ```typescript
 * const result = await build(connection, sessionId, {
 *   project_root: "/path/to/project",
 *   target: "compile"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Build success:", response.success);
 *     console.log("Duration:", response.duration_ms, "ms");
 *     console.log("Output:", response.output);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function build(
  connection: ConnectionManager,
  sessionId: string,
  params: BuildParams,
  token?: string
): Promise<Result<BuildResponse, OperationError>> {
  // Validate required parameters
  if (!params.project_root || typeof params.project_root !== "string") {
    return err({
      type: "validation_error",
      operation: "build",
      message: "project_root parameter must be a non-empty string",
    });
  }

  if (!params.target || typeof params.target !== "string") {
    return err({
      type: "validation_error",
      operation: "build",
      message: "target parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("build");

  // Build request
  const request: BuildRequest = {
    id: requestId,
    op: "build",
    session: sessionId,
    project_root: params.project_root,
    target: params.target,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    BuildRequest,
    BuildResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "build",
    message: error.message,
  }));
}
