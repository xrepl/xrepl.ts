import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  TextDocumentDidChangeRequest,
  TextDocumentDidChangeResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the text_document_did_change operation
 */
export interface TextDocumentDidChangeParams {
  /** Document URI */
  uri: string;
  /** Document version number */
  version: number;
  /** Array of text changes */
  changes: Array<{
    /** Range of the text change */
    range: {
      /** Start position */
      start: { line: number; character: number };
      /** End position */
      end: { line: number; character: number };
    };
    /** New text for the range */
    text: string;
  }>;
}

/**
 * Notify server of document changes (LSP-style)
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Document change parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing success response with optional diagnostics or error
 *
 * @example
 * ```typescript
 * const result = await textDocumentDidChange(connection, sessionId, {
 *   uri: "file:///path/to/file.lfe",
 *   version: 2,
 *   changes: [{
 *     range: {
 *       start: { line: 0, character: 0 },
 *       end: { line: 0, character: 5 }
 *     },
 *     text: "(defmodule"
 *   }]
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("Document updated successfully");
 *     if (response.diagnostics) {
 *       console.log("Diagnostics:", response.diagnostics);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function textDocumentDidChange(
  connection: ConnectionManager,
  sessionId: string,
  params: TextDocumentDidChangeParams,
  token?: string
): Promise<Result<TextDocumentDidChangeResponse, OperationError>> {
  // Generate unique request ID
  const requestId = generateRequestId("text-document-did-change");

  // Build request
  const request: TextDocumentDidChangeRequest = {
    id: requestId,
    op: "text_document_did_change",
    session: sessionId,
    uri: params.uri,
    version: params.version,
    changes: params.changes,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    TextDocumentDidChangeRequest,
    TextDocumentDidChangeResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "text_document_did_change",
    message: error.message,
  }));
}
