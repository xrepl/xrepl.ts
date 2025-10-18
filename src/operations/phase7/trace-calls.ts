import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { TraceCallsRequest, TraceCallsResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the trace-calls operation
 */
export interface TraceCallsParams {
  /** Action to perform: start, stop, or status */
  action: "start" | "stop" | "status";
  /** Optional module to trace */
  module?: string;
  /** Optional function to trace */
  function?: string;
  /** Optional arity to trace */
  arity?: number;
  /** Trace options */
  options?: {
    max_traces?: number;
    timeout?: number;
  };
}

/**
 * Trace function calls
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Trace calls parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing trace results or error
 *
 * @example
 * ```typescript
 * // Start tracing all calls
 * const result = await traceCalls(connection, sessionId, {
 *   action: "start",
 *   options: { max_traces: 1000 }
 * });
 *
 * // Start tracing specific function
 * const result = await traceCalls(connection, sessionId, {
 *   action: "start",
 *   module: "my-module",
 *   function: "my-function",
 *   arity: 2
 * });
 *
 * // Get status and traces
 * const result = await traceCalls(connection, sessionId, {
 *   action: "status"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Status: ${response.status}`);
 *     if (response.traces) {
 *       response.traces.forEach(trace => {
 *         console.log(`${trace.module}:${trace.function}/${trace.arity}`);
 *       });
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function traceCalls(
  connection: ConnectionManager,
  sessionId: string,
  params: TraceCallsParams,
  token?: string
): Promise<Result<TraceCallsResponse, OperationError>> {
  // Validate action parameter
  if (!["start", "stop", "status"].includes(params.action)) {
    return err({
      type: "validation_error",
      operation: "trace-calls",
      message: 'action must be one of: "start", "stop", "status"',
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("trace-calls");

  // Build request
  const request: TraceCallsRequest = {
    id: requestId,
    op: "trace-calls",
    session: sessionId,
    action: params.action,
    ...(params.module && { module: params.module }),
    ...(params.function && { function: params.function }),
    ...(params.arity !== undefined && { arity: params.arity }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TraceCallsRequest,
    TraceCallsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "trace-calls",
    message: error.message,
  }));
}
