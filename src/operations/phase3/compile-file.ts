import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  CompileFileRequest,
  CompileFileResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateCompileFileRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the compile-file operation
 */
export interface CompileFileParams {
  /** File path to compile */
  file: string;
  /** Optional file contents (if not provided, server reads from disk) */
  content?: string;
  /** Compilation options */
  options?: {
    warnings_as_errors?: boolean;
    output_dir?: string;
    include_paths?: string[];
  };
}

/**
 * Compile a single LFE file
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Compilation parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing compilation result or error
 *
 * @example
 * ```typescript
 * const result = await compileFile(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   options: {
 *     warnings_as_errors: false,
 *     output_dir: "./ebin"
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.success) {
 *       console.log(`Compiled: ${response.output_file}`);
 *     } else {
 *       console.log(`Errors: ${response.errors}, Warnings: ${response.warnings}`);
 *       response.diagnostics?.forEach(d => console.log(d.message));
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function compileFile(
  connection: ConnectionManager,
  sessionId: string,
  params: CompileFileParams,
  token?: string
): Promise<Result<CompileFileResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateCompileFileRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("compile-file");

  // Build request
  const request: CompileFileRequest = {
    id: requestId,
    op: "compile-file",
    session: sessionId,
    file: params.file,
    ...(params.content && { content: params.content }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    CompileFileRequest,
    CompileFileResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "compile-file",
    message: error.message,
  }));
}
