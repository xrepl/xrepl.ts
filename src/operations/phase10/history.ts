import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  HistoryRequest,
  HistoryResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the history operation
 */
export interface HistoryParams {
  /** Maximum number of history entries to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Retrieve evaluation history for a session
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - History parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing evaluation history or error
 *
 * @example
 * ```typescript
 * const result = await history(connection, sessionId, {
 *   limit: 10,
 *   offset: 0
 * });
 *
 * result.match(
 *   (response) => {
 *     response.history.forEach(entry => {
 *       console.log(`[${entry.index}] ${entry.code} => ${entry.result}`);
 *       console.log(`  at ${entry.timestamp}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function history(
  connection: ConnectionManager,
  sessionId: string,
  params: HistoryParams,
  token?: string
): Promise<Result<HistoryResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("history");

  // Build request
  const request: HistoryRequest = {
    id: requestId,
    op: "history",
    session: sessionId,
    ...(params.limit !== undefined && { limit: params.limit }),
    ...(params.offset !== undefined && { offset: params.offset }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    HistoryRequest,
    HistoryResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "history",
    message: error.message,
  }));
}
