import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  CompileProjectRequest,
  CompileProjectResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the compile-project operation
 */
export interface CompileProjectParams {
  /** Project root directory */
  projectRoot?: string;
  /** Compilation options */
  options?: {
    warnings_as_errors?: boolean;
    parallel?: boolean;
    clean?: boolean;
    output_dir?: string;
  };
}

/**
 * Compile an entire LFE project
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Compilation parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing compilation result or error
 *
 * @example
 * ```typescript
 * const result = await compileProject(connection, sessionId, {
 *   projectRoot: "/path/to/project",
 *   options: {
 *     parallel: true,
 *     clean: false
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Compiled ${response.files_compiled} files`);
 *     console.log(`Errors: ${response.errors}, Warnings: ${response.warnings}`);
 *     console.log(`Compile time: ${response.compile_time}ms`);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function compileProject(
  connection: ConnectionManager,
  sessionId: string,
  params: CompileProjectParams,
  token?: string
): Promise<Result<CompileProjectResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("compile-project");

  // Build request
  const request: CompileProjectRequest = {
    id: requestId,
    op: "compile-project",
    session: sessionId,
    ...(params.projectRoot && { project_root: params.projectRoot }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    CompileProjectRequest,
    CompileProjectResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "compile-project",
    message: error.message,
  }));
}
