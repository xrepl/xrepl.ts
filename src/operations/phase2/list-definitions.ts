import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ListDefinitionsRequest,
  ListDefinitionsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the list-definitions operation
 */
export interface ListDefinitionsParams {
  /** Optional file path to list definitions from */
  file?: string;
  /** Optional namespace to list definitions from */
  namespace?: string;
}

/**
 * List all definitions in a file or namespace (document symbols)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - List definitions parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing definitions list or error
 *
 * @example
 * ```typescript
 * // List definitions in a file
 * const result = await listDefinitions(connection, sessionId, {
 *   file: "/path/to/file.lfe"
 * });
 *
 * // List definitions in a namespace
 * const result = await listDefinitions(connection, sessionId, {
 *   namespace: "my-module"
 * });
 *
 * result.match(
 *   (response) => {
 *     response.definitions.forEach(def => {
 *       console.log(`${def.type}: ${def.name}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function listDefinitions(
  connection: ConnectionManager,
  sessionId: string,
  params: ListDefinitionsParams,
  token?: string
): Promise<Result<ListDefinitionsResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("list-definitions");

  // Build request
  const request: ListDefinitionsRequest = {
    id: requestId,
    op: "list-definitions",
    session: sessionId,
    ...(params.file && { file: params.file }),
    ...(params.namespace && { namespace: params.namespace }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ListDefinitionsRequest,
    ListDefinitionsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "list-definitions",
    message: error.message,
  }));
}
