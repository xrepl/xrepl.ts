import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  MacroexpandAllRequest,
  MacroexpandAllResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

export interface MacroexpandAllParams {
  code: string;
}

export async function macroexpandAll(
  connection: ConnectionManager,
  sessionId: string,
  params: MacroexpandAllParams,
  token?: string
): Promise<Result<MacroexpandAllResponse, OperationError>> {
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "macroexpand-all",
      message: "code parameter must be a non-empty string",
    });
  }

  const requestId = generateRequestId("macroexpand-all");

  const request: MacroexpandAllRequest = {
    id: requestId,
    op: "macroexpand-all",
    session: sessionId,
    code: params.code,
    ...(token && { token }),
  };

  const result = await connection.sendRequest<
    MacroexpandAllRequest,
    MacroexpandAllResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "macroexpand-all",
    message: error.message,
  }));
}
