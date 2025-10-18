import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  StreamEvalRequest,
  StreamEvalResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

/**
 * Parameters for the stream-eval operation
 */
export interface StreamEvalParams {
  /** Code to evaluate with streaming output */
  code: string;
}

/**
 * Evaluate code with real-time streaming output
 *
 * Note: This operation may send multiple responses (streaming + final).
 * The client should handle intermediate responses with status ["streaming"]
 * and the final response with status ["done"].
 *
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Stream eval parameters
 * @param token - Optional auth token for TCP connections
 * @returns Result containing final evaluation result or error
 *
 * @example
 * ```typescript
 * const result = await streamEval(connection, sessionId, {
 *   code: "(io:format \"Processing...~n\") (heavy-computation)"
 * });
 *
 * result.match(
 *   (response) => {
 *     if (response.status.includes("streaming")) {
 *       console.log(`[${response.stream}]:`, response.output);
 *     } else {
 *       console.log("Final result:", response.value);
 *     }
 *   },
 *   (error) => console.error("Error:", error.message)
 * );
 * ```
 */
export async function streamEval(
  connection: ConnectionManager,
  sessionId: string,
  params: StreamEvalParams,
  token?: string
): Promise<Result<StreamEvalResponse, OperationError>> {
  // Validate required parameters
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "stream-eval",
      message: "code parameter must be a non-empty string",
    });
  }

  // Generate unique request ID
  const requestId = generateRequestId("stream-eval");

  // Build request
  const request: StreamEvalRequest = {
    id: requestId,
    op: "stream_eval",
    session: sessionId,
    code: params.code,
    ...(token && { token }),
  };

  // Send request and await response
  const result = await connection.sendRequest<
    StreamEvalRequest,
    StreamEvalResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "stream-eval",
    message: error.message,
  }));
}
