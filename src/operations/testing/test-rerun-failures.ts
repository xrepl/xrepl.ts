import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TestRerunFailuresRequest,
  TestRerunFailuresResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the test-rerun-failures operation
 */
export interface TestRerunFailuresParams {
  /** Test rerun options */
  options?: {
    parallel?: boolean;
    verbose?: boolean;
  };
}

/**
 * Rerun only failed tests
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Test rerun parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing test results or error
 *
 * @example
 * ```typescript
 * const result = await testRerunFailures(connection, sessionId, {
 *   options: { verbose: true }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Reran ${response.summary.total} failed tests`);
 *     console.log(`Now passing: ${response.summary.passed}`);
 *     console.log(`Still failing: ${response.summary.failed}`);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function testRerunFailures(
  connection: ConnectionManager,
  sessionId: string,
  params: TestRerunFailuresParams,
  token?: string
): Promise<Result<TestRerunFailuresResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("test-rerun-failures");

  // Build request
  const request: TestRerunFailuresRequest = {
    id: requestId,
    op: "test-rerun-failures",
    session: sessionId,
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TestRerunFailuresRequest,
    TestRerunFailuresResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "test-rerun-failures",
    message: error.message,
  }));
}
