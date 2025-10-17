import {
  validateEvalRequest,
  validateLoadFileRequest,
  validateCompleteRequest,
  validateFormatRequest,
} from "../../../src/utils/validation";

describe("Validation Utilities", () => {
  describe("validateEvalRequest", () => {
    it("should accept valid eval parameters", () => {
      const result = validateEvalRequest({
        code: "(+ 1 2)",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should accept eval parameters with optional fields", () => {
      const result = validateEvalRequest({
        code: "(+ 1 2)",
        file: "test.lfe",
        line: 10,
        column: 5,
      });

      expect(result.isOk()).toBe(true);
    });

    it("should reject empty code", () => {
      const result = validateEvalRequest({
        code: "",
      });

      expect(result.isErr()).toBe(true);
      result.mapErr((error) => {
        expect(error.type).toBe("validation_error");
        expect(error.operation).toBe("eval");
      });
    });

    it("should reject non-string code", () => {
      const result = validateEvalRequest({
        code: 123 as unknown as string,
      });

      expect(result.isErr()).toBe(true);
    });

    it("should reject invalid line number", () => {
      const result = validateEvalRequest({
        code: "(+ 1 2)",
        line: "10" as unknown as number,
      });

      expect(result.isErr()).toBe(true);
      result.mapErr((error) => {
        expect(error.message).toContain("line");
      });
    });

    it("should reject invalid column number", () => {
      const result = validateEvalRequest({
        code: "(+ 1 2)",
        column: "5" as unknown as number,
      });

      expect(result.isErr()).toBe(true);
      result.mapErr((error) => {
        expect(error.message).toContain("column");
      });
    });
  });

  describe("validateLoadFileRequest", () => {
    it("should accept valid load-file parameters", () => {
      const result = validateLoadFileRequest({
        file: "/path/to/file.lfe",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should accept parameters with content", () => {
      const result = validateLoadFileRequest({
        file: "buffer.lfe",
        content: "(defun hello () 'world)",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should reject empty file path", () => {
      const result = validateLoadFileRequest({
        file: "",
      });

      expect(result.isErr()).toBe(true);
      result.mapErr((error) => {
        expect(error.operation).toBe("load-file");
      });
    });

    it("should reject non-string file path", () => {
      const result = validateLoadFileRequest({
        file: 123 as unknown as string,
      });

      expect(result.isErr()).toBe(true);
    });

    it("should reject non-string content", () => {
      const result = validateLoadFileRequest({
        file: "test.lfe",
        content: 123 as unknown as string,
      });

      expect(result.isErr()).toBe(true);
    });
  });

  describe("validateCompleteRequest", () => {
    it("should accept valid complete parameters", () => {
      const result = validateCompleteRequest({
        prefix: "def",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should accept empty prefix", () => {
      const result = validateCompleteRequest({
        prefix: "",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should accept parameters with optional fields", () => {
      const result = validateCompleteRequest({
        prefix: "def",
        context: "(defun hello () ",
        line: 10,
        column: 15,
      });

      expect(result.isOk()).toBe(true);
    });

    it("should reject non-string prefix", () => {
      const result = validateCompleteRequest({
        prefix: 123 as unknown as string,
      });

      expect(result.isErr()).toBe(true);
    });
  });

  describe("validateFormatRequest", () => {
    it("should accept valid format parameters", () => {
      const result = validateFormatRequest({
        code: "(defun hello () 'world)",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should accept parameters with file", () => {
      const result = validateFormatRequest({
        code: "(defun hello () 'world)",
        file: "test.lfe",
      });

      expect(result.isOk()).toBe(true);
    });

    it("should reject empty code", () => {
      const result = validateFormatRequest({
        code: "",
      });

      expect(result.isErr()).toBe(true);
    });

    it("should reject non-string code", () => {
      const result = validateFormatRequest({
        code: 123 as unknown as string,
      });

      expect(result.isErr()).toBe(true);
    });
  });
});
