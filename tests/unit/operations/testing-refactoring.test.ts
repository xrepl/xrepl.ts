import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { TestRunParams } from "../../../src/operations/testing/test-run";
import type { TestCoverageParams } from "../../../src/operations/testing/test-coverage";
import type { TestRerunFailuresParams } from "../../../src/operations/testing/test-rerun-failures";
import type { RenameSymbolParams } from "../../../src/operations/refactoring/rename-symbol";
import type { ExtractFunctionParams } from "../../../src/operations/refactoring/extract-function";
import type { InlineFunctionParams } from "../../../src/operations/refactoring/inline-function";

describe("Testing & Refactoring Operations", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("testRun", () => {
    it("should accept empty params", () => {
      const params: TestRunParams = {};
      expect(params).toBeDefined();
    });

    it("should accept namespace parameter", () => {
      const params: TestRunParams = {
        namespace: "my-module",
      };
      expect(params.namespace).toBe("my-module");
    });

    it("should accept test parameter", () => {
      const params: TestRunParams = {
        test: "my-test",
      };
      expect(params.test).toBe("my-test");
    });

    it("should accept options", () => {
      const params: TestRunParams = {
        options: {
          parallel: true,
          verbose: true,
        },
      };
      expect(params.options?.parallel).toBe(true);
      expect(params.options?.verbose).toBe(true);
    });
  });

  describe("testCoverage", () => {
    it("should accept empty params", () => {
      const params: TestCoverageParams = {};
      expect(params).toBeDefined();
    });

    it("should accept namespace parameter", () => {
      const params: TestCoverageParams = {
        namespace: "my-module",
      };
      expect(params.namespace).toBe("my-module");
    });

    it("should accept options", () => {
      const params: TestCoverageParams = {
        options: {
          include_source: true,
        },
      };
      expect(params.options?.include_source).toBe(true);
    });
  });

  describe("testRerunFailures", () => {
    it("should accept empty params", () => {
      const params: TestRerunFailuresParams = {};
      expect(params).toBeDefined();
    });

    it("should accept options", () => {
      const params: TestRerunFailuresParams = {
        options: {
          parallel: true,
          verbose: false,
        },
      };
      expect(params.options?.parallel).toBe(true);
      expect(params.options?.verbose).toBe(false);
    });
  });

  describe("renameSymbol", () => {
    it("should accept required parameters", () => {
      const params: RenameSymbolParams = {
        symbol: "old-name",
        new_name: "new-name",
      };
      expect(params.symbol).toBe("old-name");
      expect(params.new_name).toBe("new-name");
    });

    it("should accept optional context parameters", () => {
      const params: RenameSymbolParams = {
        symbol: "old-name",
        new_name: "new-name",
        file: "/path/to/file.lfe",
        line: 42,
        column: 10,
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(42);
      expect(params.column).toBe(10);
    });
  });

  describe("extractFunction", () => {
    it("should accept all required parameters", () => {
      const params: ExtractFunctionParams = {
        file: "/path/to/file.lfe",
        start_line: 10,
        start_column: 5,
        end_line: 15,
        end_column: 20,
        function_name: "extracted-helper",
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.start_line).toBe(10);
      expect(params.start_column).toBe(5);
      expect(params.end_line).toBe(15);
      expect(params.end_column).toBe(20);
      expect(params.function_name).toBe("extracted-helper");
    });
  });

  describe("inlineFunction", () => {
    it("should accept required symbol parameter", () => {
      const params: InlineFunctionParams = {
        symbol: "helper-function",
      };
      expect(params.symbol).toBe("helper-function");
    });

    it("should accept optional context parameters", () => {
      const params: InlineFunctionParams = {
        symbol: "helper-function",
        file: "/path/to/file.lfe",
        line: 42,
        column: 10,
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(42);
      expect(params.column).toBe(10);
    });

    it("should accept inline_all parameter", () => {
      const params: InlineFunctionParams = {
        symbol: "helper-function",
        inline_all: true,
      };
      expect(params.inline_all).toBe(true);
    });
  });
});
