import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ObserverDataRequest,
  ObserverDataResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the observer-data operation
 */
export interface ObserverDataParams {
  /** Type of data to retrieve */
  data_type: "applications" | "processes" | "ports" | "ets" | "mnesia";
  /** Optional data options */
  options?: {
    sort_by?: string;
    limit?: number;
  };
}

/**
 * Get data for observer/monitoring tools
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Observer data parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing observer data or error
 *
 * @example
 * ```typescript
 * // Get process data
 * const result = await observerData(connection, sessionId, {
 *   data_type: "processes",
 *   options: {
 *     sort_by: "memory",
 *     limit: 50
 *   }
 * });
 *
 * // Get ETS table data
 * const result = await observerData(connection, sessionId, {
 *   data_type: "ets"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Data type: ${response.data_type}`);
 *     console.log(`Timestamp: ${response.timestamp}`);
 *     console.log(`Items: ${response.data.length}`);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function observerData(
  connection: ConnectionManager,
  sessionId: string,
  params: ObserverDataParams,
  token?: string
): Promise<Result<ObserverDataResponse, OperationError>> {
  // Validate data_type parameter
  const validTypes = ["applications", "processes", "ports", "ets", "mnesia"];
  if (!validTypes.includes(params.data_type)) {
    return err({
      type: "validation_error",
      operation: "observer-data",
      message: `data_type must be one of: ${validTypes.join(", ")}`,
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("observer-data");

  // Build request
  const request: ObserverDataRequest = {
    id: requestId,
    op: "observer-data",
    session: sessionId,
    data_type: params.data_type,
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ObserverDataRequest,
    ObserverDataResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "observer-data",
    message: error.message,
  }));
}
