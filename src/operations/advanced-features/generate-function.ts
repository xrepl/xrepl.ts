import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  GenerateFunctionRequest,
  GenerateFunctionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the generate-function operation
 */
export interface GenerateFunctionParams {
  /** Description of the function to generate */
  description: string;
  /** Optional function name suggestion */
  name?: string;
  /** Optional parameter specifications */
  params?: Array<{ name: string; type?: string; description?: string }>;
  /** Optional return type specification */
  return_type?: string;
  /** Optional examples or test cases */
  examples?: string[];
}

/**
 * Generate a function based on a description using AI/LLM
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Generate function parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing generated function code or error
 *
 * @example
 * ```typescript
 * const result = await generateFunction(connection, sessionId, {
 *   description: "Calculate the factorial of a number",
 *   name: "factorial",
 *   params: [{ name: "n", type: "integer" }],
 *   return_type: "integer"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Generated:", response.code);
 *     console.log("Documentation:", response.documentation);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function generateFunction(
  connection: ConnectionManager,
  sessionId: string,
  params: GenerateFunctionParams,
  token?: string
): Promise<Result<GenerateFunctionResponse, OperationError>> {
  // Validate required parameters
  if (!params.description || typeof params.description !== "string") {
    return err({
      type: "validation_error",
      operation: "generate-function",
      message: "description parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("generate-function");

  // Build request
  const request: GenerateFunctionRequest = {
    id: requestId,
    op: "generate-function",
    session: sessionId,
    description: params.description,
    ...(params.name && { name: params.name }),
    ...(params.params && { params: params.params }),
    ...(params.return_type && { return_type: params.return_type }),
    ...(params.examples && { examples: params.examples }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    GenerateFunctionRequest,
    GenerateFunctionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "generate-function",
    message: error.message,
  }));
}
