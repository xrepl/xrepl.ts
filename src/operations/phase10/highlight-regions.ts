import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  HighlightRegionsRequest,
  HighlightRegionsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the highlight-regions operation
 */
export interface HighlightRegionsParams {
  /** File path */
  file: string;
  /** Buffer contents */
  contents: string;
}

/**
 * Get semantic highlighting information for a buffer
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Highlight regions parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing semantic regions or error
 *
 * @example
 * ```typescript
 * const result = await highlightRegions(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   contents: "(defun factorial (n) (if (< n 2) 1 (* n (factorial (- n 1)))))"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.regions.forEach(region => {
 *       console.log(`${region.type} at ${region.start_line}:${region.start_column}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function highlightRegions(
  connection: ConnectionManager,
  sessionId: string,
  params: HighlightRegionsParams,
  token?: string
): Promise<Result<HighlightRegionsResponse, OperationError>> {
  // Validate required parameters
  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "highlight-regions",
      message: "file parameter must be a non-empty string",
    });
  }

  if (!params.contents || typeof params.contents !== "string") {
    return err({
      type: "validation_error",
      operation: "highlight-regions",
      message: "contents parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("highlight-regions");

  // Build request
  const request: HighlightRegionsRequest = {
    id: requestId,
    op: "highlight_regions",
    session: sessionId,
    file: params.file,
    contents: params.contents,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    HighlightRegionsRequest,
    HighlightRegionsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "highlight-regions",
    message: error.message,
  }));
}
