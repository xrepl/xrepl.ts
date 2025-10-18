import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SetBreakpointRequest,
  SetBreakpointResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the set-breakpoint operation
 */
export interface SetBreakpointParams {
  /** File path where breakpoint should be set */
  file: string;
  /** Line number for breakpoint */
  line: number;
  /** Optional column number */
  column?: number;
  /** Optional condition - break only if this expression evaluates to true */
  condition?: string;
}

/**
 * Set a breakpoint in code
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Breakpoint parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing breakpoint info or error
 *
 * @example
 * ```typescript
 * const result = await setBreakpoint(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   line: 42,
 *   condition: "(> x 100)"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Breakpoint set: ${response.breakpoint_id}`);
 *     console.log(`Location: ${response.breakpoint.file}:${response.breakpoint.line}`);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function setBreakpoint(
  connection: ConnectionManager,
  sessionId: string,
  params: SetBreakpointParams,
  token?: string
): Promise<Result<SetBreakpointResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("set-breakpoint");

  // Build request
  const request: SetBreakpointRequest = {
    id: requestId,
    op: "set-breakpoint",
    session: sessionId,
    file: params.file,
    line: params.line,
    ...(params.column !== undefined && { column: params.column }),
    ...(params.condition && { condition: params.condition }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SetBreakpointRequest,
    SetBreakpointResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "set-breakpoint",
    message: error.message,
  }));
}
