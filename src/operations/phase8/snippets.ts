import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SnippetsRequest,
  SnippetsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the snippets operation
 */
export interface SnippetsParams {
  /** Query or category for snippet search */
  query?: string;
  /** Filter by snippet category */
  category?: string;
  /** Filter by snippet tags */
  tags?: string[];
  /** Maximum number of snippets to return */
  limit?: number;
}

/**
 * Retrieve code snippets and templates
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Snippets parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing code snippets or error
 *
 * @example
 * ```typescript
 * const result = await snippets(connection, sessionId, {
 *   query: "gen_server",
 *   category: "OTP",
 *   limit: 10
 * });
 *
 * result.match(
 *   (response) => {
 *     response.snippets.forEach(s => {
 *       console.log(`${s.name}: ${s.description}`);
 *       console.log(s.code);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function snippets(
  connection: ConnectionManager,
  sessionId: string,
  params: SnippetsParams,
  token?: string
): Promise<Result<SnippetsResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("snippets");

  // Build request
  const request: SnippetsRequest = {
    id: requestId,
    op: "snippets",
    session: sessionId,
    ...(params.query && { query: params.query }),
    ...(params.category && { category: params.category }),
    ...(params.tags && { tags: params.tags }),
    ...(params.limit !== undefined && { limit: params.limit }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SnippetsRequest,
    SnippetsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "snippets",
    message: error.message,
  }));
}
