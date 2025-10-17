import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { DocRequest, DocResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the doc operation
 */
export interface DocParams {
  /** Symbol to get documentation for */
  symbol: string;
}

/**
 * Get full documentation for a symbol
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Doc parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing documentation or error
 *
 * @example
 * ```typescript
 * const result = await doc(connection, sessionId, {
 *   symbol: "lists:map"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Documentation:", response.doc);
 *     console.log("Arglists:", response.arglists);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function doc(
  connection: ConnectionManager,
  sessionId: string,
  params: DocParams,
  token?: string
): Promise<Result<DocResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("doc");

  // Build request
  const request: DocRequest = {
    id: requestId,
    op: "doc",
    session: sessionId,
    symbol: params.symbol,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<DocRequest, DocResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "doc",
    message: error.message,
  }));
}
