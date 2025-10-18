import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  InlineFunctionRequest,
  InlineFunctionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the inline-function operation
 */
export interface InlineFunctionParams {
  /** Symbol (function) to inline */
  symbol: string;
  /** Optional file context */
  file?: string;
  /** Optional line context */
  line?: number;
  /** Optional column context */
  column?: number;
  /** Inline all occurrences or just one */
  inline_all?: boolean;
}

/**
 * Inline a function call
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Inline function parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing text edits or error
 *
 * @example
 * ```typescript
 * // Inline single occurrence
 * const result = await inlineFunction(connection, sessionId, {
 *   symbol: "helper-function",
 *   file: "/path/to/file.lfe",
 *   line: 42,
 *   inline_all: false
 * });
 *
 * // Inline all occurrences
 * const result = await inlineFunction(connection, sessionId, {
 *   symbol: "helper-function",
 *   inline_all: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Inlined ${response.occurrences_inlined} occurrences`);
 *     response.edits.forEach(edit => {
 *       console.log(`  ${edit.file}:${edit.start_line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function inlineFunction(
  connection: ConnectionManager,
  sessionId: string,
  params: InlineFunctionParams,
  token?: string
): Promise<Result<InlineFunctionResponse, OperationError>> {
  // Validate required parameters
  if (!params.symbol || typeof params.symbol !== "string") {
    return err({
      type: "validation_error",
      operation: "inline-function",
      message: "symbol parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("inline-function");

  // Build request
  const request: InlineFunctionRequest = {
    id: requestId,
    op: "inline-function",
    session: sessionId,
    symbol: params.symbol,
    ...(params.file && { file: params.file }),
    ...(params.line !== undefined && { line: params.line }),
    ...(params.column !== undefined && { column: params.column }),
    ...(params.inline_all !== undefined && { inline_all: params.inline_all }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    InlineFunctionRequest,
    InlineFunctionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "inline-function",
    message: error.message,
  }));
}
