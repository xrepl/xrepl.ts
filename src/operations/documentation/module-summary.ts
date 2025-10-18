import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ModuleSummaryRequest,
  ModuleSummaryResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the module_summary operation
 */
export interface ModuleSummaryParams {
  /** Module name to generate summary for */
  module: string;
}

/**
 * Generate a summary of a module's functionality
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Module summary parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing module summary or error
 *
 * @example
 * ```typescript
 * const result = await moduleSummary(connection, sessionId, {
 *   module: "my-module"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Overview:", response.summary.overview);
 *     console.log("\nMain Functions:");
 *     response.summary.main_functions.forEach(fn => {
 *       console.log(`  ${fn.name}: ${fn.purpose}`);
 *     });
 *     console.log("\nDependencies:", response.summary.dependencies.join(", "));
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function moduleSummary(
  connection: ConnectionManager,
  sessionId: string,
  params: ModuleSummaryParams,
  token?: string
): Promise<Result<ModuleSummaryResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("module-summary");

  // Build request
  const request: ModuleSummaryRequest = {
    id: requestId,
    op: "module_summary",
    session: sessionId,
    module: params.module,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ModuleSummaryRequest,
    ModuleSummaryResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "module_summary",
    message: error.message,
  }));
}
