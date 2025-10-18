import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ListProcessesRequest,
  ListProcessesResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the list-processes operation
 */
export interface ListProcessesParams {
  /** Optional filter criteria */
  filter?: {
    min_message_queue_len?: number;
    min_heap_size?: number;
    status?: string;
  };
}

/**
 * List all BEAM processes
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - List processes parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing process list or error
 *
 * @example
 * ```typescript
 * // List all processes
 * const result = await listProcesses(connection, sessionId, {});
 *
 * // List processes with large message queues
 * const result = await listProcesses(connection, sessionId, {
 *   filter: {
 *     min_message_queue_len: 100
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Total processes: ${response.total_processes}`);
 *     response.processes.forEach(proc => {
 *       console.log(`  ${proc.pid}: ${proc.name || 'unnamed'} (${proc.status})`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function listProcesses(
  connection: ConnectionManager,
  sessionId: string,
  params: ListProcessesParams,
  token?: string
): Promise<Result<ListProcessesResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("list-processes");

  // Build request
  const request: ListProcessesRequest = {
    id: requestId,
    op: "list-processes",
    session: sessionId,
    ...(params.filter && { filter: params.filter }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ListProcessesRequest,
    ListProcessesResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "list-processes",
    message: error.message,
  }));
}
