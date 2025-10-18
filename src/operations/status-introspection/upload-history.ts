import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  UploadHistoryRequest,
  UploadHistoryResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the upload-history operation
 */
export interface UploadHistoryParams {
  /** Command history to upload (Emacs style) */
  history?: string[];
  /** Command history to upload (VSCode style alias) */
  commands?: string[];
}

/**
 * Sync command history from client to server
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Upload history parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing upload confirmation or error
 *
 * @example
 * ```typescript
 * const result = await uploadHistory(connection, sessionId, {
 *   history: [
 *     "(defun factorial (n) ...)",
 *     "(factorial 5)",
 *     "(+ 1 2 3)"
 *   ]
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Uploaded commands:", response.uploaded);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function uploadHistory(
  connection: ConnectionManager,
  sessionId: string,
  params: UploadHistoryParams,
  token?: string
): Promise<Result<UploadHistoryResponse, OperationError>> {
  // Validate that at least one history array is provided
  if (!params.history && !params.commands) {
    return err({
      type: "validation_error",
      operation: "upload-history",
      message: "either history or commands parameter must be provided",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("upload-history");

  // Build request
  const request: UploadHistoryRequest = {
    id: requestId,
    op: "upload_history",
    session: sessionId,
    ...(params.history && { history: params.history }),
    ...(params.commands && { commands: params.commands }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    UploadHistoryRequest,
    UploadHistoryResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "upload-history",
    message: error.message,
  }));
}
