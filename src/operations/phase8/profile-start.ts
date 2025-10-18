import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ProfileStartRequest,
  ProfileStartResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

export interface ProfileStartParams {
  options?: {
    modules?: string[];
    functions?: string[];
    sample_rate?: number;
  };
}

export async function profileStart(
  connection: ConnectionManager,
  sessionId: string,
  params: ProfileStartParams,
  token?: string
): Promise<Result<ProfileStartResponse, OperationError>> {
  const requestId = generateRequestId("profile-start");

  const request: ProfileStartRequest = {
    id: requestId,
    op: "profile-start",
    session: sessionId,
    ...(params.options && { options: params.options }),
    ...(token && { token }),
  };

  const result = await connection.sendRequest<
    ProfileStartRequest,
    ProfileStartResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "profile-start",
    message: error.message,
  }));
}
