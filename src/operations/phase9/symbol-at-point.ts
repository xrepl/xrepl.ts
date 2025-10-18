import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  SymbolAtPointRequest,
  SymbolAtPointResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the symbol-at-point operation
 */
export interface SymbolAtPointParams {
  /** File path */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** Optional buffer contents for unsaved changes */
  contents?: string;
}

/**
 * Get detailed information about symbol at a specific location
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Symbol at point parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing symbol information or error
 *
 * @example
 * ```typescript
 * const result = await symbolAtPoint(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   line: 10,
 *   column: 5
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Symbol:", response.symbol);
 *     console.log("Type:", response.type);
 *     console.log("Module:", response.module);
 *     if (response.definition_location) {
 *       console.log("Defined at:", response.definition_location);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function symbolAtPoint(
  connection: ConnectionManager,
  sessionId: string,
  params: SymbolAtPointParams,
  token?: string
): Promise<Result<SymbolAtPointResponse, OperationError>> {
  // Validate required parameters
  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "symbol-at-point",
      message: "file parameter must be a non-empty string",
    });
  }

  if (typeof params.line !== "number" || params.line < 1) {
    return err({
      type: "validation_error",
      operation: "symbol-at-point",
      message: "line parameter must be a positive number",
    });
  }

  if (typeof params.column !== "number" || params.column < 1) {
    return err({
      type: "validation_error",
      operation: "symbol-at-point",
      message: "column parameter must be a positive number",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("symbol-at-point");

  // Build request
  const request: SymbolAtPointRequest = {
    id: requestId,
    op: "symbol_at_point",
    session: sessionId,
    file: params.file,
    line: params.line,
    column: params.column,
    ...(params.contents && { contents: params.contents }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    SymbolAtPointRequest,
    SymbolAtPointResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "symbol-at-point",
    message: error.message,
  }));
}
