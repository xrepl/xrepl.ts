import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ExtractFunctionRequest,
  ExtractFunctionResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the extract-function operation
 */
export interface ExtractFunctionParams {
  /** File containing the code to extract */
  file: string;
  /** Start line of selection */
  start_line: number;
  /** Start column of selection */
  start_column: number;
  /** End line of selection */
  end_line: number;
  /** End column of selection */
  end_column: number;
  /** Name for the new function */
  function_name: string;
}

/**
 * Extract code into a new function
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Extract function parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing text edits or error
 *
 * @example
 * ```typescript
 * const result = await extractFunction(connection, sessionId, {
 *   file: "/path/to/file.lfe",
 *   start_line: 10,
 *   start_column: 3,
 *   end_line: 15,
 *   end_column: 20,
 *   function_name: "extracted-helper"
 * });
 *
 * result.match(
 *   (response) => {
 *     console.log("New function:");
 *     console.log(response.new_function);
 *     console.log(`Edits: ${response.edits.length}`);
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function extractFunction(
  connection: ConnectionManager,
  sessionId: string,
  params: ExtractFunctionParams,
  token?: string
): Promise<Result<ExtractFunctionResponse, OperationError>> {
  // Validate required parameters
  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "extract-function",
      message: "file parameter must be a non-empty string",
    });
  }

  if (!params.function_name || typeof params.function_name !== "string") {
    return err({
      type: "validation_error",
      operation: "extract-function",
      message: "function_name parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("extract-function");

  // Build request
  const request: ExtractFunctionRequest = {
    id: requestId,
    op: "extract-function",
    session: sessionId,
    file: params.file,
    start_line: params.start_line,
    start_column: params.start_column,
    end_line: params.end_line,
    end_column: params.end_column,
    function_name: params.function_name,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    ExtractFunctionRequest,
    ExtractFunctionResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "extract-function",
    message: error.message,
  }));
}
