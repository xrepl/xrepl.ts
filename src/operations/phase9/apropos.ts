import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  AproposRequest,
  AproposResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the apropos operation
 */
export interface AproposParams {
  /** Search query/pattern */
  query: string;
  /** Also search in documentation */
  search_docs?: boolean;
  /** Include private/unexported functions */
  search_private?: boolean;
}

/**
 * Search for functions/modules by name pattern
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Apropos search parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing search results or error
 *
 * @example
 * ```typescript
 * const result = await apropos(connection, sessionId, {
 *   query: "map",
 *   search_docs: true
 * });
 *
 * result.match(
 *   (response) => {
 *     response.results.forEach(r => {
 *       console.log(`${r.module}:${r.name}/${r.arity} - ${r.doc}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function apropos(
  connection: ConnectionManager,
  sessionId: string,
  params: AproposParams,
  token?: string
): Promise<Result<AproposResponse, OperationError>> {
  // Validate required parameters
  if (!params.query || typeof params.query !== "string") {
    return err({
      type: "validation_error",
      operation: "apropos",
      message: "query parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("apropos");

  // Build request
  const request: AproposRequest = {
    id: requestId,
    op: "apropos",
    session: sessionId,
    query: params.query,
    ...(params.search_docs !== undefined && {
      search_docs: params.search_docs,
    }),
    ...(params.search_private !== undefined && {
      search_private: params.search_private,
    }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    AproposRequest,
    AproposResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "apropos",
    message: error.message,
  }));
}
