import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  StacktraceRequest,
  StacktraceResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the stacktrace operation
 */
export interface StacktraceParams {
  /** Optional thread ID to get stacktrace for */
  thread_id?: string;
}

/**
 * Get current stack trace
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Stacktrace parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing stack frames or error
 *
 * @example
 * ```typescript
 * const result = await stacktrace(connection, sessionId, {});
 *
 * result.match(
 *   (response) => {
 *     console.log("Stack trace:");
 *     response.frames.forEach((frame, i) => {
 *       console.log(`  ${i}: ${frame.module}:${frame.function}/${frame.arity}`);
 *       console.log(`     ${frame.file}:${frame.line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function stacktrace(
  connection: ConnectionManager,
  sessionId: string,
  params: StacktraceParams,
  token?: string
): Promise<Result<StacktraceResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("stacktrace");

  // Build request
  const request: StacktraceRequest = {
    id: requestId,
    op: "stacktrace",
    session: sessionId,
    ...(params.thread_id && { thread_id: params.thread_id }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    StacktraceRequest,
    StacktraceResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "stacktrace",
    message: error.message,
  }));
}
