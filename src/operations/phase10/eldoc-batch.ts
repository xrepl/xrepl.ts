import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  EldocBatchRequest,
  EldocBatchResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the eldoc-batch operation
 */
export interface EldocBatchParams {
  /** Array of symbols to query */
  symbols: string[];
}

/**
 * Get eldoc information for multiple symbols at once (optimization)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Eldoc batch parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing batch eldoc results or error
 *
 * @example
 * ```typescript
 * const result = await eldocBatch(connection, sessionId, {
 *   symbols: ["lists:map", "lists:foldl", "lists:filter"]
 * });
 *
 * result.match(
 *   (response) => {
 *     Object.entries(response.results).forEach(([symbol, info]) => {
 *       console.log(`${symbol}: ${info.signature}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function eldocBatch(
  connection: ConnectionManager,
  sessionId: string,
  params: EldocBatchParams,
  token?: string
): Promise<Result<EldocBatchResponse, OperationError>> {
  // Validate required parameters
  if (!params.symbols || !Array.isArray(params.symbols) || params.symbols.length === 0) {
    return err({
      type: "validation_error",
      operation: "eldoc-batch",
      message: "symbols parameter must be a non-empty array of strings",
    });
  }

  // Validate all symbols are strings
  if (!params.symbols.every(symbol => typeof symbol === "string")) {
    return err({
      type: "validation_error",
      operation: "eldoc-batch",
      message: "all symbols must be strings",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("eldoc-batch");

  // Build request
  const request: EldocBatchRequest = {
    id: requestId,
    op: "eldoc_batch",
    session: sessionId,
    symbols: params.symbols,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    EldocBatchRequest,
    EldocBatchResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eldoc-batch",
    message: error.message,
  }));
}
