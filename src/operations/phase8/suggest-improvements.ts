import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SuggestImprovementsRequest,
  SuggestImprovementsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the suggest-improvements operation
 */
export interface SuggestImprovementsParams {
  /** Code to analyze for improvements */
  code: string;
  /** Optional file path for context */
  file?: string;
  /** Focus areas for suggestions */
  focus?: ("performance" | "readability" | "style" | "security" | "best-practices")[];
  /** Maximum number of suggestions */
  max_suggestions?: number;
}

/**
 * Get AI-powered suggestions for code improvements
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Suggest improvements parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing improvement suggestions or error
 *
 * @example
 * ```typescript
 * const result = await suggestImprovements(connection, sessionId, {
 *   code: "(defun my-func (x) (if (> x 0) x (* x -1)))",
 *   focus: ["readability", "best-practices"],
 *   max_suggestions: 5
 * });
 *
 * result.match(
 *   (response) => {
 *     response.suggestions.forEach(s => {
 *       console.log(`${s.category}: ${s.description}`);
 *       console.log(`Suggested: ${s.suggested_code}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function suggestImprovements(
  connection: ConnectionManager,
  sessionId: string,
  params: SuggestImprovementsParams,
  token?: string
): Promise<Result<SuggestImprovementsResponse, OperationError>> {
  // Validate required parameters
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "suggest-improvements",
      message: "code parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("suggest-improvements");

  // Build request
  const request: SuggestImprovementsRequest = {
    id: requestId,
    op: "suggest-improvements",
    session: sessionId,
    code: params.code,
    ...(params.file && { file: params.file }),
    ...(params.focus && { focus: params.focus }),
    ...(params.max_suggestions !== undefined && {
      max_suggestions: params.max_suggestions,
    }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SuggestImprovementsRequest,
    SuggestImprovementsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "suggest-improvements",
    message: error.message,
  }));
}
