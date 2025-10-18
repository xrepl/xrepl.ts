import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TextDocumentDidOpenRequest,
  TextDocumentDidOpenResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the text_document_did_open operation
 */
export interface TextDocumentDidOpenParams {
  /** Document URI */
  uri: string;
  /** Language identifier (e.g., "lfe", "erlang") */
  language_id: string;
  /** Document version number */
  version: number;
  /** Full text content of the document */
  text: string;
}

/**
 * Notify server that a document was opened (LSP-style)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Document open parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing success response or error
 *
 * @example
 * ```typescript
 * const result = await textDocumentDidOpen(connection, sessionId, {
 *   uri: "file:///path/to/file.lfe",
 *   language_id: "lfe",
 *   version: 1,
 *   text: "(defun hello () 'world)"
 * });
 *
 * result.match(
 *   (response) => console.log("Document opened successfully"),
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function textDocumentDidOpen(
  connection: ConnectionManager,
  sessionId: string,
  params: TextDocumentDidOpenParams,
  token?: string
): Promise<Result<TextDocumentDidOpenResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("text-document-did-open");

  // Build request
  const request: TextDocumentDidOpenRequest = {
    id: requestId,
    op: "text_document_did_open",
    session: sessionId,
    uri: params.uri,
    language_id: params.language_id,
    version: params.version,
    text: params.text,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TextDocumentDidOpenRequest,
    TextDocumentDidOpenResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "text_document_did_open",
    message: error.message,
  }));
}
