import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { FormatRequest, FormatResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateFormatRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the format operation
 */
export interface FormatParams {
  /** Code to format */
  code: string;
  /** Optional file path for context */
  file?: string;
}

/**
 * Format LFE code
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Format parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing formatted code or error
 *
 * @example
 * ```typescript
 * const result = await format(connection, sessionId, {
 *   code: "(defun hello()    'world)",
 *   file: "buffer.lfe"
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.formatted) {
 *       console.log("Formatted:", response.formatted);
 *     } else if (response.error) {
 *       console.log("Format error:", response.error);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function format(
  connection: ConnectionManager,
  sessionId: string,
  params: FormatParams,
  token?: string
): Promise<Result<FormatResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateFormatRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("format");

  // Build request
  const request: FormatRequest = {
    id: requestId,
    op: "format",
    session: sessionId,
    code: params.code,
    ...(params.file && { file: params.file }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<FormatRequest, FormatResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "format",
    message: error.message,
  }));
}
