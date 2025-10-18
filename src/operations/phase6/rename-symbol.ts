import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  RenameSymbolRequest,
  RenameSymbolResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the rename-symbol operation
 */
export interface RenameSymbolParams {
  /** Symbol to rename */
  symbol: string;
  /** New name for the symbol */
  new_name: string;
  /** Optional file context */
  file?: string;
  /** Optional line context */
  line?: number;
  /** Optional column context */
  column?: number;
}

/**
 * Rename a symbol across the codebase
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Rename parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing text edits or error
 *
 * @example
 * ```typescript
 * const result = await renameSymbol(connection, sessionId, {
 *   symbol: "old-function-name",
 *   new_name: "new-function-name",
 *   file: "/path/to/file.lfe",
 *   line: 42
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Renamed in ${response.files_affected} files`);
 *     response.edits.forEach(edit => {
 *       console.log(`  ${edit.file}:${edit.start_line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function renameSymbol(
  connection: ConnectionManager,
  sessionId: string,
  params: RenameSymbolParams,
  token?: string
): Promise<Result<RenameSymbolResponse, OperationError>> {
  // Validate required parameters
  if (!params.symbol || typeof params.symbol !== "string") {
    return err({
      type: "validation_error",
      operation: "rename-symbol",
      message: "symbol parameter must be a non-empty string",
    });
  }

  if (!params.new_name || typeof params.new_name !== "string") {
    return err({
      type: "validation_error",
      operation: "rename-symbol",
      message: "new_name parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("rename-symbol");

  // Build request
  const request: RenameSymbolRequest = {
    id: requestId,
    op: "rename-symbol",
    session: sessionId,
    symbol: params.symbol,
    new_name: params.new_name,
    ...(params.file && { file: params.file }),
    ...(params.line !== undefined && { line: params.line }),
    ...(params.column !== undefined && { column: params.column }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    RenameSymbolRequest,
    RenameSymbolResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "rename-symbol",
    message: error.message,
  }));
}
