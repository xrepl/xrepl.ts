import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { DescribeRequest, DescribeResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Get server capabilities and version information
 *
 * @param connection - Active connection manager
 * @param token - Optional auth token for TCP connections
 * @returns Result containing server description or error
 *
 * @example
 * ```typescript
 * const result = await describe(connection);
 * result.match(
 *   (response) => {
 *     console.log(`xREPL version: ${response.versions?.xrepl}`);
 *     console.log(`Supported operations: ${response.ops?.join(", ")}`);
 *   },
 *   (error) => console.error(`Error: ${error.message}`)
 * );
 * ```
 */
export async function describe(
  connection: ConnectionManager,
  token?: string
): Promise<Result<DescribeResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("describe");

  // Build request
  const request: DescribeRequest = {
    id: requestId,
    op: "describe",
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    DescribeRequest,
    DescribeResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "describe",
    message: error.message,
  }));
}
