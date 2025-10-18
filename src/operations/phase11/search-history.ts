import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SearchHistoryRequest,
  SearchHistoryResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the search_history operation
 */
export interface SearchHistoryParams {
  /** Search query string */
  query: string;
  /** Whether to search in code (default: true) */
  search_code?: boolean;
  /** Whether to search in results (default: true) */
  search_results?: boolean;
}

/**
 * Search through evaluation history
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Search history parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing matching history entries or error
 *
 * @example
 * ```typescript
 * const result = await searchHistory(connection, sessionId, {
 *   query: "defun",
 *   search_code: true,
 *   search_results: false
 * });
 *
 * result.match(
 *   (response) => {
 *     response.matches.forEach(match => {
 *       console.log(`[${match.index}] ${match.code}`);
 *       console.log(`  => ${match.result}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function searchHistory(
  connection: ConnectionManager,
  sessionId: string,
  params: SearchHistoryParams,
  token?: string
): Promise<Result<SearchHistoryResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("search-history");

  // Build request
  const request: SearchHistoryRequest = {
    id: requestId,
    op: "search_history",
    session: sessionId,
    query: params.query,
    ...(params.search_code !== undefined && { search_code: params.search_code }),
    ...(params.search_results !== undefined && { search_results: params.search_results }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SearchHistoryRequest,
    SearchHistoryResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "search_history",
    message: error.message,
  }));
}
