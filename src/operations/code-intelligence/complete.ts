import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { CompleteRequest, CompleteResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateCompleteRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the complete operation
 */
export interface CompleteParams {
  /** Prefix to complete */
  prefix: string;
  /** Optional context code */
  context?: string;
  /** Line number in context */
  line?: number;
  /** Column number in context */
  column?: number;
}

/**
 * Get code completions for a given prefix
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Completion parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing completion suggestions or error
 *
 * @example
 * ```typescript
 * const result = await complete(connection, sessionId, {
 *   prefix: "def",
 *   context: "(defun hello () ",
 *   line: 1,
 *   column: 15
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Completions:", response.completions);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function complete(
  connection: ConnectionManager,
  sessionId: string,
  params: CompleteParams,
  token?: string
): Promise<Result<CompleteResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateCompleteRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("complete");

  // Build request
  const request: CompleteRequest = {
    id: requestId,
    op: "complete",
    session: sessionId,
    prefix: params.prefix,
    ...(params.context && { context: params.context }),
    ...(params.line && { line: params.line }),
    ...(params.column && { column: params.column }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    CompleteRequest,
    CompleteResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "complete",
    message: error.message,
  }));
}
