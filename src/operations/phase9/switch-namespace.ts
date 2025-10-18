import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SwitchNamespaceRequest,
  SwitchNamespaceResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the switch-namespace operation
 */
export interface SwitchNamespaceParams {
  /** Module/namespace name to switch to */
  namespace: string;
}

/**
 * Switch the current module/namespace for evaluation context
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Switch namespace parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing confirmed namespace or error
 *
 * @example
 * ```typescript
 * const result = await switchNamespace(connection, sessionId, {
 *   namespace: "my-module"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Switched to namespace:", response.namespace);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function switchNamespace(
  connection: ConnectionManager,
  sessionId: string,
  params: SwitchNamespaceParams,
  token?: string
): Promise<Result<SwitchNamespaceResponse, OperationError>> {
  // Validate required parameters
  if (!params.namespace || typeof params.namespace !== "string") {
    return err({
      type: "validation_error",
      operation: "switch-namespace",
      message: "namespace parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("switch-namespace");

  // Build request
  const request: SwitchNamespaceRequest = {
    id: requestId,
    op: "switch_namespace",
    session: sessionId,
    namespace: params.namespace,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SwitchNamespaceRequest,
    SwitchNamespaceResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "switch-namespace",
    message: error.message,
  }));
}
