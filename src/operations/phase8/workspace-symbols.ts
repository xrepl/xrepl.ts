import { Result } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import {
  WorkspaceSymbolsRequest,
  WorkspaceSymbolsResponse,
} from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

export interface WorkspaceSymbolsParams {
  query?: string;
  kind?: string;
}

export async function workspaceSymbols(
  connection: ConnectionManager,
  sessionId: string,
  params: WorkspaceSymbolsParams,
  token?: string
): Promise<Result<WorkspaceSymbolsResponse, OperationError>> {
  const requestId = generateRequestId("workspace-symbols");

  const request: WorkspaceSymbolsRequest = {
    id: requestId,
    op: "workspace-symbols",
    session: sessionId,
    ...(params.query && { query: params.query }),
    ...(params.kind && { kind: params.kind }),
    ...(token && { token }),
  };

  const result = await connection.sendRequest<
    WorkspaceSymbolsRequest,
    WorkspaceSymbolsResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "workspace-symbols",
    message: error.message,
  }));
}
