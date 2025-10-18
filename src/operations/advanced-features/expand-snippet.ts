import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ExpandSnippetRequest,
  ExpandSnippetResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the expand_snippet operation
 */
export interface ExpandSnippetParams {
  /** Snippet template to expand */
  snippet: string;
  /** Context for snippet expansion */
  context?: {
    /** Module context */
    module?: string;
    /** Surrounding code for context-aware expansion */
    surrounding_code?: string;
  };
}

/**
 * Expand a snippet with context-aware defaults
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Expand snippet parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing expanded snippet or error
 *
 * @example
 * ```typescript
 * const result = await expandSnippet(connection, sessionId, {
 *   snippet: "defun $name ($args) $body",
 *   context: {
 *     module: "my-module"
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Expanded:", response.expanded);
 *     console.log("Placeholders:");
 *     response.placeholders.forEach(ph => {
 *       console.log(`  ${ph.name} at position ${ph.position}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function expandSnippet(
  connection: ConnectionManager,
  sessionId: string,
  params: ExpandSnippetParams,
  token?: string
): Promise<Result<ExpandSnippetResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("expand-snippet");

  // Build request
  const request: ExpandSnippetRequest = {
    id: requestId,
    op: "expand_snippet",
    session: sessionId,
    snippet: params.snippet,
    ...(params.context !== undefined && { context: params.context }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ExpandSnippetRequest,
    ExpandSnippetResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "expand_snippet",
    message: error.message,
  }));
}
