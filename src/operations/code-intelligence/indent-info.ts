import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  IndentInfoRequest,
  IndentInfoResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the indent-info operation
 */
export interface IndentInfoParams {
  /** File path */
  file: string;
  /** Line number to get indentation for (1-based) */
  line: number;
  /** Buffer contents */
  contents: string;
}

/**
 * Get proper indentation for a line
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Indent info parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing indentation information or error
 *
 * @example
 * ```typescript
 * const result = await indentInfo(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   line: 5,
 *   contents: "(defun foo ()\\n  (let ((x 1))\\n    x))"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Indent column:", response.indent.column);
 *     console.log("Reason:", response.indent.reason);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function indentInfo(
  connection: ConnectionManager,
  sessionId: string,
  params: IndentInfoParams,
  token?: string
): Promise<Result<IndentInfoResponse, OperationError>> {
  // Validate required parameters
  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "indent-info",
      message: "file parameter must be a non-empty string",
    });
  }

  if (typeof params.line !== "number" || params.line < 1) {
    return err({
      type: "validation_error",
      operation: "indent-info",
      message: "line parameter must be a positive number",
    });
  }

  if (!params.contents || typeof params.contents !== "string") {
    return err({
      type: "validation_error",
      operation: "indent-info",
      message: "contents parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("indent-info");

  // Build request
  const request: IndentInfoRequest = {
    id: requestId,
    op: "indent_info",
    session: sessionId,
    file: params.file,
    line: params.line,
    contents: params.contents,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    IndentInfoRequest,
    IndentInfoResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "indent-info",
    message: error.message,
  }));
}
