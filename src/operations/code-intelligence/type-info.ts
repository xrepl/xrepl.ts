import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TypeInfoRequest,
  TypeInfoResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the type-info operation
 */
export interface TypeInfoParams {
  /** Symbol name to get type information for */
  symbol: string;
}

/**
 * Get type information for a symbol (specs/dialyzer)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Type info parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing type information or error
 *
 * @example
 * ```typescript
 * const result = await typeInfo(connection, sessionId, {
 *   symbol: "lists:map"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Type spec:", response.type_spec);
 *     console.log("Arguments:", response.argument_types);
 *     console.log("Returns:", response.return_type);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function typeInfo(
  connection: ConnectionManager,
  sessionId: string,
  params: TypeInfoParams,
  token?: string
): Promise<Result<TypeInfoResponse, OperationError>> {
  // Validate required parameters
  if (!params.symbol || typeof params.symbol !== "string") {
    return err({
      type: "validation_error",
      operation: "type-info",
      message: "symbol parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("type-info");

  // Build request
  const request: TypeInfoRequest = {
    id: requestId,
    op: "type_info",
    session: sessionId,
    symbol: params.symbol,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TypeInfoRequest,
    TypeInfoResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "type-info",
    message: error.message,
  }));
}
