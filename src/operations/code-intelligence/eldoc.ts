import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { EldocRequest, EldocResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eldoc operation
 */
export interface EldocParams {
  /** Symbol to get documentation for */
  symbol: string;
  /** Optional context code */
  context?: string;
}

/**
 * Get expression documentation (eldoc-style) for a symbol
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Eldoc parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing eldoc information or error
 *
 * @example
 * ```typescript
 * const result = await eldoc(connection, sessionId, {
 *   symbol: "map"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Name:", response.name);
 *     console.log("Arglists:", response.arglists);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function eldoc(
  connection: ConnectionManager,
  sessionId: string,
  params: EldocParams,
  token?: string
): Promise<Result<EldocResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("eldoc");

  // Build request
  const request: EldocRequest = {
    id: requestId,
    op: "eldoc",
    session: sessionId,
    symbol: params.symbol,
    ...(params.context && { context: params.context }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<EldocRequest, EldocResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eldoc",
    message: error.message,
  }));
}
