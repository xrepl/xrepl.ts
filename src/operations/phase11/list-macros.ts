import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ListMacrosRequest,
  ListMacrosResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the list_macros operation
 */
export interface ListMacrosParams {
  /** Module to list macros from (optional) */
  module?: string;
}

/**
 * List all macros available in current context
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - List macros parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing available macros or error
 *
 * @example
 * ```typescript
 * const result = await listMacros(connection, sessionId, {
 *   module: "my-module"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.macros.forEach(macro => {
 *       console.log(`${macro.name}/${macro.arity}: ${macro.doc}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function listMacros(
  connection: ConnectionManager,
  sessionId: string,
  params: ListMacrosParams,
  token?: string
): Promise<Result<ListMacrosResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("list-macros");

  // Build request
  const request: ListMacrosRequest = {
    id: requestId,
    op: "list_macros",
    session: sessionId,
    ...(params.module !== undefined && { module: params.module }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ListMacrosRequest,
    ListMacrosResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "list_macros",
    message: error.message,
  }));
}
