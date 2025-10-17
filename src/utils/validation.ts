import { Result, ok, err } from "neverthrow";
import { OperationError } from "../types/errors";

/**
 * Validate eval operation parameters
 */
export function validateEvalRequest(params: {
  code: string;
  file?: string;
  line?: number;
  column?: number;
}): Result<void, OperationError> {
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "code parameter must be a non-empty string",
    });
  }

  if (params.line !== undefined && typeof params.line !== "number") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "line parameter must be a number",
    });
  }

  if (params.column !== undefined && typeof params.column !== "number") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "column parameter must be a number",
    });
  }

  return ok(undefined);
}

/**
 * Validate load-file operation parameters
 */
export function validateLoadFileRequest(params: {
  file: string;
  content?: string;
}): Result<void, OperationError> {
  if (!params.file || typeof params.file !== "string") {
    return err({
      type: "validation_error",
      operation: "load-file",
      message: "file parameter must be a non-empty string",
    });
  }

  if (params.content !== undefined && typeof params.content !== "string") {
    return err({
      type: "validation_error",
      operation: "load-file",
      message: "content parameter must be a string",
    });
  }

  return ok(undefined);
}

/**
 * Validate complete operation parameters
 */
export function validateCompleteRequest(params: {
  prefix: string;
  context?: string;
  line?: number;
  column?: number;
}): Result<void, OperationError> {
  if (typeof params.prefix !== "string") {
    return err({
      type: "validation_error",
      operation: "complete",
      message: "prefix parameter must be a string",
    });
  }

  if (params.line !== undefined && typeof params.line !== "number") {
    return err({
      type: "validation_error",
      operation: "complete",
      message: "line parameter must be a number",
    });
  }

  if (params.column !== undefined && typeof params.column !== "number") {
    return err({
      type: "validation_error",
      operation: "complete",
      message: "column parameter must be a number",
    });
  }

  return ok(undefined);
}

/**
 * Validate format operation parameters
 */
export function validateFormatRequest(params: {
  code: string;
  file?: string;
}): Result<void, OperationError> {
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "format",
      message: "code parameter must be a non-empty string",
    });
  }

  return ok(undefined);
}
