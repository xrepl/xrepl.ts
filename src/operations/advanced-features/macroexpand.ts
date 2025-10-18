import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  MacroexpandRequest,
  MacroexpandResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the macroexpand operation
 */
export interface MacroexpandParams {
  /** Code containing macros to expand */
  code: string;
  /** Expand all levels or just one */
  expand_all?: boolean;
}

/**
 * Expand macros in code
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Macroexpand parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing expanded code or error
 *
 * @example
 * ```typescript
 * const result = await macroexpand(connection, sessionId, {
 *   code: "(defmacro foo () '(bar baz))",
 *   expand_all: false
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Original:", response.original);
 *     console.log("Expanded:", response.expanded);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function macroexpand(
  connection: ConnectionManager,
  sessionId: string,
  params: MacroexpandParams,
  token?: string
): Promise<Result<MacroexpandResponse, OperationError>> {
  // Validate required parameters
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "macroexpand",
      message: "code parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("macroexpand");

  // Build request
  const request: MacroexpandRequest = {
    id: requestId,
    op: "macroexpand",
    session: sessionId,
    code: params.code,
    ...(params.expand_all !== undefined && { expand_all: params.expand_all }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    MacroexpandRequest,
    MacroexpandResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "macroexpand",
    message: error.message,
  }));
}
