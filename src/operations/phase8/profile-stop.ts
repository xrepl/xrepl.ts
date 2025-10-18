import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  ProfileStopRequest,
  ProfileStopResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

export interface ProfileStopParams {
  profile_id?: string;
}

export async function profileStop(
  connection: ConnectionManager,
  sessionId: string,
  params: ProfileStopParams,
  token?: string
): Promise<Result<ProfileStopResponse, OperationError>> {
  const requestId = generateRequestId("profile-stop");

  const request: ProfileStopRequest = {
    id: requestId,
    op: "profile-stop",
    session: sessionId,
    ...(params.profile_id && { profile_id: params.profile_id }),
    ...(token && { token }),
  };

  const result = await connection.sendRequest<
    ProfileStopRequest,
    ProfileStopResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "profile-stop",
    message: error.message,
  }));
}
