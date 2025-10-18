import { Result, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { BenchmarkRequest, BenchmarkResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { generateRequestId } from "../../utils/id-generator";

export interface BenchmarkParams {
  code: string;
  iterations?: number;
  warmup?: number;
}

export async function benchmark(
  connection: ConnectionManager,
  sessionId: string,
  params: BenchmarkParams,
  token?: string
): Promise<Result<BenchmarkResponse, OperationError>> {
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "benchmark",
      message: "code parameter must be a non-empty string",
    });
  }

  const requestId = generateRequestId("benchmark");

  const request: BenchmarkRequest = {
    id: requestId,
    op: "benchmark",
    session: sessionId,
    code: params.code,
    ...(params.iterations !== undefined && { iterations: params.iterations }),
    ...(params.warmup !== undefined && { warmup: params.warmup }),
    ...(token && { token }),
  };

  const result = await connection.sendRequest<
    BenchmarkRequest,
    BenchmarkResponse
  >(request);

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "benchmark",
    message: error.message,
  }));
}
