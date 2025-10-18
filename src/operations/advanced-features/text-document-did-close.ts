import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TextDocumentDidCloseRequest,
  TextDocumentDidCloseResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the text_document_did_close operation
 */
export interface TextDocumentDidCloseParams {
  /** Document URI */
  uri: string;
}

/**
 * Notify server that a document was closed (LSP-style)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Document close parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing success response or error
 *
 * @example
 * ```typescript
 * const result = await textDocumentDidClose(connection, sessionId, {
 *   uri: "file:///path/to/file.lfe"
 * });
 *
 * result.match(
 *   (response) => console.log("Document closed successfully"),
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function textDocumentDidClose(
  connection: ConnectionManager,
  sessionId: string,
  params: TextDocumentDidCloseParams,
  token?: string
): Promise<Result<TextDocumentDidCloseResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("text-document-did-close");

  // Build request
  const request: TextDocumentDidCloseRequest = {
    id: requestId,
    op: "text_document_did_close",
    session: sessionId,
    uri: params.uri,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TextDocumentDidCloseRequest,
    TextDocumentDidCloseResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "text_document_did_close",
    message: error.message,
  }));
}
