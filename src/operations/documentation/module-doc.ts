import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ModuleDocRequest,
  ModuleDocResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the module-doc operation
 */
export interface ModuleDocParams {
  /** Module name to get documentation for */
  module: string;
}

/**
 * Get documentation for an entire module
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Module doc parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing module documentation or error
 *
 * @example
 * ```typescript
 * const result = await moduleDoc(connection, sessionId, {
 *   module: "lists"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Module:", response.module);
 *     console.log("Documentation:", response.doc);
 *     response.exports.forEach(exp => {
 *       console.log(`${exp.name}/${exp.arity}: ${exp.doc}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function moduleDoc(
  connection: ConnectionManager,
  sessionId: string,
  params: ModuleDocParams,
  token?: string
): Promise<Result<ModuleDocResponse, OperationError>> {
  // Validate required parameters
  if (!params.module || typeof params.module !== "string") {
    return err({
      type: "validation_error",
      operation: "module-doc",
      message: "module parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("module-doc");

  // Build request
  const request: ModuleDocRequest = {
    id: requestId,
    op: "module_doc",
    session: sessionId,
    module: params.module,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ModuleDocRequest,
    ModuleDocResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "module-doc",
    message: error.message,
  }));
}
