import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SearchDocsRequest,
  SearchDocsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the search-docs operation
 */
export interface SearchDocsParams {
  /** Search query */
  query: string;
}

/**
 * Search through documentation
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Search docs parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing search results or error
 *
 * @example
 * ```typescript
 * const result = await searchDocs(connection, sessionId, {
 *   query: "map function"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.results.forEach(result => {
 *       console.log(`${result.module}:${result.symbol} (${result.relevance})`);
 *       console.log(result.doc_snippet);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function searchDocs(
  connection: ConnectionManager,
  sessionId: string,
  params: SearchDocsParams,
  token?: string
): Promise<Result<SearchDocsResponse, OperationError>> {
  // Validate required parameters
  if (!params.query || typeof params.query !== "string") {
    return err({
      type: "validation_error",
      operation: "search-docs",
      message: "query parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("search-docs");

  // Build request
  const request: SearchDocsRequest = {
    id: requestId,
    op: "search_docs",
    session: sessionId,
    query: params.query,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SearchDocsRequest,
    SearchDocsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "search-docs",
    message: error.message,
  }));
}
