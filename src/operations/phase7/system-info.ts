import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { SystemInfoRequest, SystemInfoResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the system-info operation
 */
export interface SystemInfoParams {
  /** Optional: specific categories to retrieve */
  categories?: string[];
}

/**
 * Get BEAM system information
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - System info parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing system information or error
 *
 * @example
 * ```typescript
 * // Get all system info
 * const result = await systemInfo(connection, sessionId, {});
 *
 * // Get specific categories
 * const result = await systemInfo(connection, sessionId, {
 *   categories: ["memory", "statistics"]
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Erlang: ${response.system.erlang_version}`);
 *     console.log(`OTP: ${response.system.otp_release}`);
 *     if (response.memory) {
 *       console.log(`Total memory: ${response.memory.total} bytes`);
 *     }
 *     if (response.statistics) {
 *       console.log(`Processes: ${response.statistics.process_count}`);
 *       console.log(`Uptime: ${response.statistics.uptime}s`);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function systemInfo(
  connection: ConnectionManager,
  sessionId: string,
  params: SystemInfoParams,
  token?: string
): Promise<Result<SystemInfoResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("system-info");

  // Build request
  const request: SystemInfoRequest = {
    id: requestId,
    op: "system-info",
    session: sessionId,
    ...(params.categories && { categories: params.categories }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SystemInfoRequest,
    SystemInfoResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "system-info",
    message: error.message,
  }));
}
