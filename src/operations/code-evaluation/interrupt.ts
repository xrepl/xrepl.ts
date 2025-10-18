import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { InterruptRequest, InterruptResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Interrupt a running evaluation
 *
 * @param connection - Active connection manager
 * @param sessionId - Session ID containing the running evaluation
 * @param interruptId - Optional specific evaluation ID to interrupt
 * @param token - Optional auth token for TCP connections
 * @returns Result containing interrupt response or error
 *
 * @example
 * ```typescript
 * const result = await interrupt(connection, sessionId);
 * ```
 */
export async function interrupt(
  connection: ConnectionManager,
  sessionId: string,
  interruptId?: string,
  token?: string
): Promise<Result<InterruptResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("interrupt");

  // Build request
  const request: InterruptRequest = {
    id: requestId,
    op: "interrupt",
    session: sessionId,
    ...(interruptId && { interrupt_id: interruptId }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    InterruptRequest,
    InterruptResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "interrupt",
    message: error.message,
  }));
}
