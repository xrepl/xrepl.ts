import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { SignatureRequest, SignatureResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the signature operation
 */
export interface SignatureParams {
  /** Symbol to get signature for */
  symbol: string;
  /** Optional context code */
  context?: string;
}

/**
 * Get function signature help for a symbol
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Signature parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing signature information or error
 *
 * @example
 * ```typescript
 * const result = await signature(connection, sessionId, {
 *   symbol: "map",
 *   context: "(map "
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Signatures:", response.signatures);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function signature(
  connection: ConnectionManager,
  sessionId: string,
  params: SignatureParams,
  token?: string
): Promise<Result<SignatureResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("signature");

  // Build request
  const request: SignatureRequest = {
    id: requestId,
    op: "signature",
    session: sessionId,
    symbol: params.symbol,
    ...(params.context && { context: params.context }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SignatureRequest,
    SignatureResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "signature",
    message: error.message,
  }));
}
