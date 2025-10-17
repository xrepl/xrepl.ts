import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  FindReferencesRequest,
  FindReferencesResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the find-references operation
 */
export interface FindReferencesParams {
  /** Symbol to find references for */
  symbol: string;
  /** Include the declaration in results */
  includeDeclaration?: boolean;
}

/**
 * Find all references to a symbol across the project
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Find references parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing reference locations or error
 *
 * @example
 * ```typescript
 * const result = await findReferences(connection, sessionId, {
 *   symbol: "my-function",
 *   includeDeclaration: true
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log(`Found ${response.references.length} references`);
 *     response.references.forEach(ref => {
 *       console.log(`${ref.file}:${ref.line}`);
 *     });
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function findReferences(
  connection: ConnectionManager,
  sessionId: string,
  params: FindReferencesParams,
  token?: string
): Promise<Result<FindReferencesResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("find-references");

  // Build request
  const request: FindReferencesRequest = {
    id: requestId,
    op: "find-references",
    session: sessionId,
    symbol: params.symbol,
    ...(params.includeDeclaration !== undefined && {
      include_declaration: params.includeDeclaration,
    }),
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    FindReferencesRequest,
    FindReferencesResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "find-references",
    message: error.message,
  }));
}
