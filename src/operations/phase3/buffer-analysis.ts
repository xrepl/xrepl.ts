import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  BufferAnalysisRequest,
  BufferAnalysisResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateBufferAnalysisRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the buffer-analysis operation
 */
export interface BufferAnalysisParams {
  /** Content to analyze */
  content: string;
  /** Optional file path for context */
  file?: string;
  /** Analysis options */
  options?: {
    include_warnings?: boolean;
    include_style?: boolean;
  };
}

/**
 * Analyze code buffer for issues and suggestions
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Analysis parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing analysis results or error
 *
 * @example
 * ```typescript
 * const result = await bufferAnalysis(connection, sessionId, {
 *   content: "(defun hello () 'world)",
 *   file: "buffer.lfe",
 *   options: {
 *     include_warnings: true,
 *     include_style: true
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Diagnostics: ${response.diagnostics.length}`);
 *     console.log(`Suggestions: ${response.suggestions?.length || 0}`);
 *     response.suggestions?.forEach(s => {
 *       console.log(`Suggestion: ${s.message}`);
 *       if (s.fix) {
 *         console.log(`  Fix: ${s.fix}`);
 *       }
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function bufferAnalysis(
  connection: ConnectionManager,
  sessionId: string,
  params: BufferAnalysisParams,
  token?: string
): Promise<Result<BufferAnalysisResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateBufferAnalysisRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("buffer-analysis");

  // Build request
  const request: BufferAnalysisRequest = {
    id: requestId,
    op: "buffer-analysis",
    session: sessionId,
    content: params.content,
    ...(params.file && { file: params.file }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    BufferAnalysisRequest,
    BufferAnalysisResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "buffer-analysis",
    message: error.message,
  }));
}
