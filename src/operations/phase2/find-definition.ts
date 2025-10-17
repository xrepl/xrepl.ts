import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  FindDefinitionRequest,
  FindDefinitionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the find-definition operation
 */
export interface FindDefinitionParams {
  /** Symbol to find definition for */
  symbol: string;
  /** Optional context code */
  context?: string;
}

/**
 * Find the definition location(s) for a symbol (go-to-definition)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Find definition parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing definition locations or error
 *
 * @example
 * ```typescript
 * const result = await findDefinition(connection, sessionId, {
 *   symbol: "my-function"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.definitions.forEach(def => {
 *       console.log(`${def.file}:${def.line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function findDefinition(
  connection: ConnectionManager,
  sessionId: string,
  params: FindDefinitionParams,
  token?: string
): Promise<Result<FindDefinitionResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("find-definition");

  // Build request
  const request: FindDefinitionRequest = {
    id: requestId,
    op: "find-definition",
    session: sessionId,
    symbol: params.symbol,
    ...(params.context && { context: params.context }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    FindDefinitionRequest,
    FindDefinitionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "find-definition",
    message: error.message,
  }));
}
