import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { LintRequest, LintResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateLintRequest } from "../../utils/validation";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the lint operation
 */
export interface LintParams {
  /** File path to lint */
  file?: string;
  /** File content to lint */
  content?: string;
  /** Code to lint (alternative to content) */
  code?: string;
  /** Linting options */
  options?: {
    rules?: string[];
    severity?: "error" | "warning" | "info";
  };
}

/**
 * Lint LFE code without compilation
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Linting parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing lint diagnostics or error
 *
 * @example
 * ```typescript
 * // Lint a file
 * const result = await lint(connection, sessionId, {
 *   file: "/path/to/file.lfe"
 * });
 *
 * // Lint code content
 * const result = await lint(connection, sessionId, {
 *   code: "(defun hello () 'world)",
 *   options: { severity: "warning" }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Found ${response.diagnostics.length} issues`);
 *     response.diagnostics.forEach(d => {
 *       console.log(`${d.severity}: ${d.message} at ${d.file}:${d.line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function lint(
  connection: ConnectionManager,
  sessionId: string,
  params: LintParams,
  token?: string
): Promise<Result<LintResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateLintRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("lint");

  // Build request
  const request: LintRequest = {
    id: requestId,
    op: "lint",
    session: sessionId,
    ...(params.file && { file: params.file }),
    ...(params.content && { content: params.content }),
    ...(params.code && { code: params.code }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<LintRequest, LintResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "lint",
    message: error.message,
  }));
}
