import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  GenerateDocRequest,
  GenerateDocResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the generate_doc operation
 */
export interface GenerateDocParams {
  /** Symbol to generate documentation for */
  symbol: string;
  /** Whether to include examples in generated documentation */
  include_examples?: boolean;
}

/**
 * Generate documentation for a function/module
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Generate doc parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing generated documentation or error
 *
 * @example
 * ```typescript
 * const result = await generateDoc(connection, sessionId, {
 *   symbol: "my-function",
 *   include_examples: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Generated documentation:");
 *     console.log(response.doc);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function generateDoc(
  connection: ConnectionManager,
  sessionId: string,
  params: GenerateDocParams,
  token?: string
): Promise<Result<GenerateDocResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("generate-doc");

  // Build request
  const request: GenerateDocRequest = {
    id: requestId,
    op: "generate_doc",
    session: sessionId,
    symbol: params.symbol,
    ...(params.include_examples !== undefined && { include_examples: params.include_examples }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    GenerateDocRequest,
    GenerateDocResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "generate_doc",
    message: error.message,
  }));
}
