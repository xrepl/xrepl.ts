import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  GenerateTestsRequest,
  GenerateTestsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the generate-tests operation
 */
export interface GenerateTestsParams {
  /** Function code to generate tests for */
  code: string;
  /** Optional function name */
  function_name?: string;
  /** Optional test framework preference */
  framework?: string;
  /** Number of test cases to generate */
  count?: number;
  /** Include edge cases */
  include_edge_cases?: boolean;
}

/**
 * Generate test cases for a function using AI/LLM
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Generate tests parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing generated test code or error
 *
 * @example
 * ```typescript
 * const result = await generateTests(connection, sessionId, {
 *   code: "(defun factorial (n) ...)",
 *   function_name: "factorial",
 *   count: 5,
 *   include_edge_cases: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Test count:", response.test_count);
 *     console.log("Tests:", response.tests);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function generateTests(
  connection: ConnectionManager,
  sessionId: string,
  params: GenerateTestsParams,
  token?: string
): Promise<Result<GenerateTestsResponse, OperationError>> {
  // Validate required parameters
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "generate-tests",
      message: "code parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("generate-tests");

  // Build request
  const request: GenerateTestsRequest = {
    id: requestId,
    op: "generate-tests",
    session: sessionId,
    code: params.code,
    ...(params.function_name && { function_name: params.function_name }),
    ...(params.framework && { framework: params.framework }),
    ...(params.count !== undefined && { count: params.count }),
    ...(params.include_edge_cases !== undefined && {
      include_edge_cases: params.include_edge_cases,
    }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    GenerateTestsRequest,
    GenerateTestsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "generate-tests",
    message: error.message,
  }));
}
