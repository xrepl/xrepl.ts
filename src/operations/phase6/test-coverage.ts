import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TestCoverageRequest,
  TestCoverageResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the test-coverage operation
 */
export interface TestCoverageParams {
  /** Optional: specific namespace to get coverage for */
  namespace?: string;
  /** Coverage options */
  options?: {
    include_source?: boolean;
  };
}

/**
 * Get test coverage information
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Test coverage parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing coverage information or error
 *
 * @example
 * ```typescript
 * const result = await testCoverage(connection, sessionId, {
 *   namespace: "my-module",
 *   options: { include_source: true }
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Overall coverage: ${response.summary.coverage_percent}%`);
 *     response.coverage.forEach(file => {
 *       console.log(`  ${file.file}: ${file.coverage_percent}%`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function testCoverage(
  connection: ConnectionManager,
  sessionId: string,
  params: TestCoverageParams,
  token?: string
): Promise<Result<TestCoverageResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("test-coverage");

  // Build request
  const request: TestCoverageRequest = {
    id: requestId,
    op: "test-coverage",
    session: sessionId,
    ...(params.namespace && { namespace: params.namespace }),
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TestCoverageRequest,
    TestCoverageResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "test-coverage",
    message: error.message,
  }));
}
