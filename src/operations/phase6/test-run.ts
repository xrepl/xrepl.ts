import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { TestRunRequest, TestRunResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the test-run operation
 */
export interface TestRunParams {
  /** Optional: specific namespace to test */
  namespace?: string;
  /** Optional: specific test to run */
  test?: string;
  /** Test run options */
  options?: {
    parallel?: boolean;
    verbose?: boolean;
  };
}

/**
 * Run tests
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Test run parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing test results or error
 *
 * @example
 * ```typescript
 * // Run all tests
 * const result = await testRun(connection, sessionId, {});
 *
 * // Run specific namespace tests
 * const result = await testRun(connection, sessionId, {
 *   namespace: "my-module",
 *   options: { parallel: true, verbose: true }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Tests: ${response.summary.total}`);
 *     console.log(`Passed: ${response.summary.passed}`);
 *     console.log(`Failed: ${response.summary.failed}`);
 *     response.results.forEach(test => {
 *       console.log(`  ${test.name}: ${test.status}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function testRun(
  connection: ConnectionManager,
  sessionId: string,
  params: TestRunParams,
  token?: string
): Promise<Result<TestRunResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("test-run");

  // Build request
  const request: TestRunRequest = {
    id: requestId,
    op: "test-run",
    session: sessionId,
    ...(params.namespace && { namespace: params.namespace }),
    ...(params.test && { test: params.test }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TestRunRequest,
    TestRunResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "test-run",
    message: error.message,
  }));
}
