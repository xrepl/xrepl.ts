import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  InspectProcessRequest,
  InspectProcessResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the inspect-process operation
 */
export interface InspectProcessParams {
  /** Process ID to inspect */
  pid: string;
  /** Inspection options */
  options?: {
    include_messages?: boolean;
    include_backtrace?: boolean;
    include_dictionary?: boolean;
  };
}

/**
 * Inspect a specific BEAM process
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Inspect process parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing process details or error
 *
 * @example
 * ```typescript
 * const result = await inspectProcess(connection, sessionId, {
 *   pid: "<0.123.0>",
 *   options: {
 *     include_messages: true,
 *     include_backtrace: true
 *   }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Process: ${response.process.pid}`);
 *     console.log(`Status: ${response.process.status}`);
 *     console.log(`Message queue: ${response.process.message_queue_len}`);
 *     if (response.messages) {
 *       console.log(`Messages: ${response.messages.length}`);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function inspectProcess(
  connection: ConnectionManager,
  sessionId: string,
  params: InspectProcessParams,
  token?: string
): Promise<Result<InspectProcessResponse, OperationError>> {
  // Validate required parameters
  if (!params.pid || typeof params.pid !== "string") {
    return err({
      type: "validation_error",
      operation: "inspect-process",
      message: "pid parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("inspect-process");

  // Build request
  const request: InspectProcessRequest = {
    id: requestId,
    op: "inspect-process",
    session: sessionId,
    pid: params.pid,
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    InspectProcessRequest,
    InspectProcessResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "inspect-process",
    message: error.message,
  }));
}
