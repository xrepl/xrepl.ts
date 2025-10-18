import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { LoadFileRequest, LoadFileResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateLoadFileRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the load-file operation
 */
export interface LoadFileParams {
  /** File path to load */
  file: string;
  /** Optional file contents (if not provided, server reads from disk) */
  content?: string;
}

/**
 * Load and evaluate an entire file
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Load file parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing load file response or error
 *
 * @example
 * ```typescript
 * // Load file from disk
 * const result = await loadFile(connection, sessionId, {
 *   file: "/path/to/file.lfe"
 * });
 *
 * // Load file with provided content
 * const result = await loadFile(connection, sessionId, {
 *   file: "buffer.lfe",
 *   content: "(defun hello () 'world)"
 * });
 * ```
 */
export async function loadFile(
  connection: ConnectionManager,
  sessionId: string,
  params: LoadFileParams,
  token?: string
): Promise<Result<LoadFileResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateLoadFileRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("load-file");

  // Build request
  const request: LoadFileRequest = {
    id: requestId,
    op: "load-file",
    session: sessionId,
    file: params.file,
    ...(params.content && { content: params.content }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    LoadFileRequest,
    LoadFileResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "load-file",
    message: error.message,
  }));
}
