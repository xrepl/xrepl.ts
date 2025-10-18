import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { CompleteContextParams } from "../../../src/operations/code-intelligence/complete-context";
import type { EldocBatchParams } from "../../../src/operations/code-intelligence/eldoc-batch";
import type { IndentInfoParams } from "../../../src/operations/code-intelligence/indent-info";
import type { HighlightRegionsParams } from "../../../src/operations/code-intelligence/highlight-regions";
import type { EvalAtPointParams } from "../../../src/operations/code-evaluation/eval-at-point";
import type { StreamEvalParams } from "../../../src/operations/code-evaluation/stream-eval";
import type { ModuleDocParams } from "../../../src/operations/documentation/module-doc";
import type { SearchDocsParams } from "../../../src/operations/documentation/search-docs";
import type { HistoryParams } from "../../../src/operations/advanced-features/history";
import type { ClearSessionParams } from "../../../src/operations/session-management/clear-session";
import type { ModuleInfoParams } from "../../../src/operations/status-introspection/module-info";

describe("Multi-Category Operations (Phase 10)", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("completeContext", () => {
    it("should accept required buffer, cursor_line, and cursor_column parameters", () => {
      const params: CompleteContextParams = {
        buffer: "(defun foo (x) (lists:ma",
        cursor_line: 1,
        cursor_column: 25,
      };
      expect(params.buffer).toBeDefined();
      expect(params.cursor_line).toBe(1);
      expect(params.cursor_column).toBe(25);
    });

    it("should accept optional parse_tree parameter", () => {
      const params: CompleteContextParams = {
        buffer: "(defun foo (x) (lists:ma",
        cursor_line: 1,
        cursor_column: 25,
        parse_tree: { type: "application", children: [] },
      };
      expect(params.parse_tree).toBeDefined();
    });
  });

  describe("eldocBatch", () => {
    it("should accept required symbols parameter", () => {
      const params: EldocBatchParams = {
        symbols: ["lists:map", "lists:foldl", "lists:filter"],
      };
      expect(params.symbols).toHaveLength(3);
    });

    it("should handle single symbol", () => {
      const params: EldocBatchParams = {
        symbols: ["lists:map"],
      };
      expect(params.symbols).toHaveLength(1);
    });
  });

  describe("indentInfo", () => {
    it("should accept required file, line, and contents parameters", () => {
      const params: IndentInfoParams = {
        file: "/path/to/file.lfe",
        line: 5,
        contents: "(defun foo ()\\n  (let ((x 1))\\n    x))",
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(5);
      expect(params.contents).toBeDefined();
    });
  });

  describe("highlightRegions", () => {
    it("should accept required file and contents parameters", () => {
      const params: HighlightRegionsParams = {
        file: "/path/to/file.lfe",
        contents: "(defun factorial (n) (if (< n 2) 1 (* n (factorial (- n 1)))))",
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.contents).toBeDefined();
    });
  });

  describe("evalAtPoint", () => {
    it("should accept required code, file, line, and column parameters", () => {
      const params: EvalAtPointParams = {
        code: "(+ 1 2)",
        file: "/path/to/file.lfe",
        line: 10,
        column: 5,
      };
      expect(params.code).toBe("(+ 1 2)");
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(10);
      expect(params.column).toBe(5);
    });

    it("should accept optional context parameter", () => {
      const params: EvalAtPointParams = {
        code: "(+ 1 2)",
        file: "/path/to/file.lfe",
        line: 10,
        column: 5,
        context: {
          buffer_contents: "(defun foo () (+ 1 2))",
          surrounding_forms: [],
        },
      };
      expect(params.context).toBeDefined();
      expect(params.context?.buffer_contents).toBeDefined();
    });
  });

  describe("streamEval", () => {
    it("should accept required code parameter", () => {
      const params: StreamEvalParams = {
        code: "(io:format \"Processing...~n\") (heavy-computation)",
      };
      expect(params.code).toBeDefined();
    });
  });

  describe("moduleDoc", () => {
    it("should accept required module parameter", () => {
      const params: ModuleDocParams = {
        module: "lists",
      };
      expect(params.module).toBe("lists");
    });
  });

  describe("searchDocs", () => {
    it("should accept required query parameter", () => {
      const params: SearchDocsParams = {
        query: "map function",
      };
      expect(params.query).toBe("map function");
    });
  });

  describe("history", () => {
    it("should accept empty params", () => {
      const params: HistoryParams = {};
      expect(params).toBeDefined();
    });

    it("should accept optional limit parameter", () => {
      const params: HistoryParams = {
        limit: 10,
      };
      expect(params.limit).toBe(10);
    });

    it("should accept optional offset parameter", () => {
      const params: HistoryParams = {
        offset: 5,
      };
      expect(params.offset).toBe(5);
    });

    it("should accept both limit and offset", () => {
      const params: HistoryParams = {
        limit: 10,
        offset: 5,
      };
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(5);
    });
  });

  describe("clearSession", () => {
    it("should accept empty params", () => {
      const params: ClearSessionParams = {};
      expect(params).toBeDefined();
    });
  });

  describe("moduleInfo", () => {
    it("should accept required module parameter", () => {
      const params: ModuleInfoParams = {
        module: "lists",
      };
      expect(params.module).toBe("lists");
    });
  });
});
