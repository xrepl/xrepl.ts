import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { ListMacrosParams } from "../../../src/operations/phase11/list-macros";
import type { SearchHistoryParams } from "../../../src/operations/phase11/search-history";
import type { GenerateDocParams } from "../../../src/operations/phase11/generate-doc";
import type { ModuleSummaryParams } from "../../../src/operations/phase11/module-summary";
import type { ExpandSnippetParams } from "../../../src/operations/phase11/expand-snippet";
import type { TextDocumentDidOpenParams } from "../../../src/operations/phase11/text-document-did-open";
import type { TextDocumentDidChangeParams } from "../../../src/operations/phase11/text-document-did-change";
import type { TextDocumentDidCloseParams } from "../../../src/operations/phase11/text-document-did-close";

describe("Phase 11: NICE TO HAVE - Additional Features", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("listMacros", () => {
    it("should accept no required parameters (only session)", () => {
      const params: ListMacrosParams = {};
      expect(params).toBeDefined();
    });

    it("should accept optional module parameter", () => {
      const params: ListMacrosParams = {
        module: "my-module",
      };
      expect(params.module).toBe("my-module");
    });
  });

  describe("searchHistory", () => {
    it("should accept required query parameter", () => {
      const params: SearchHistoryParams = {
        query: "defun",
      };
      expect(params.query).toBe("defun");
    });

    it("should accept optional search_code parameter", () => {
      const params: SearchHistoryParams = {
        query: "defun",
        search_code: true,
      };
      expect(params.search_code).toBe(true);
    });

    it("should accept optional search_results parameter", () => {
      const params: SearchHistoryParams = {
        query: "defun",
        search_results: false,
      };
      expect(params.search_results).toBe(false);
    });

    it("should accept both optional parameters", () => {
      const params: SearchHistoryParams = {
        query: "defun",
        search_code: true,
        search_results: true,
      };
      expect(params.search_code).toBe(true);
      expect(params.search_results).toBe(true);
    });
  });

  describe("generateDoc", () => {
    it("should accept required symbol parameter", () => {
      const params: GenerateDocParams = {
        symbol: "my-function",
      };
      expect(params.symbol).toBe("my-function");
    });

    it("should accept optional include_examples parameter", () => {
      const params: GenerateDocParams = {
        symbol: "my-function",
        include_examples: true,
      };
      expect(params.include_examples).toBe(true);
    });
  });

  describe("moduleSummary", () => {
    it("should accept required module parameter", () => {
      const params: ModuleSummaryParams = {
        module: "my-module",
      };
      expect(params.module).toBe("my-module");
    });
  });

  describe("expandSnippet", () => {
    it("should accept required snippet parameter", () => {
      const params: ExpandSnippetParams = {
        snippet: "defun $name ($args) $body",
      };
      expect(params.snippet).toBe("defun $name ($args) $body");
    });

    it("should accept optional context parameter with module", () => {
      const params: ExpandSnippetParams = {
        snippet: "defun $name ($args) $body",
        context: {
          module: "my-module",
        },
      };
      expect(params.context?.module).toBe("my-module");
    });

    it("should accept optional context parameter with surrounding_code", () => {
      const params: ExpandSnippetParams = {
        snippet: "defun $name ($args) $body",
        context: {
          surrounding_code: "(defmodule my-module ...)",
        },
      };
      expect(params.context?.surrounding_code).toBeDefined();
    });

    it("should accept context with both module and surrounding_code", () => {
      const params: ExpandSnippetParams = {
        snippet: "defun $name ($args) $body",
        context: {
          module: "my-module",
          surrounding_code: "(defmodule my-module ...)",
        },
      };
      expect(params.context?.module).toBe("my-module");
      expect(params.context?.surrounding_code).toBeDefined();
    });
  });

  describe("textDocumentDidOpen", () => {
    it("should accept all required parameters", () => {
      const params: TextDocumentDidOpenParams = {
        uri: "file:///path/to/file.lfe",
        language_id: "lfe",
        version: 1,
        text: "(defun hello () 'world)",
      };
      expect(params.uri).toBe("file:///path/to/file.lfe");
      expect(params.language_id).toBe("lfe");
      expect(params.version).toBe(1);
      expect(params.text).toBeDefined();
    });

    it("should handle different language_id values", () => {
      const params: TextDocumentDidOpenParams = {
        uri: "file:///path/to/file.erl",
        language_id: "erlang",
        version: 1,
        text: "-module(test).",
      };
      expect(params.language_id).toBe("erlang");
    });
  });

  describe("textDocumentDidChange", () => {
    it("should accept all required parameters", () => {
      const params: TextDocumentDidChangeParams = {
        uri: "file:///path/to/file.lfe",
        version: 2,
        changes: [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 5 },
            },
            text: "(defmodule",
          },
        ],
      };
      expect(params.uri).toBe("file:///path/to/file.lfe");
      expect(params.version).toBe(2);
      expect(params.changes).toHaveLength(1);
    });

    it("should accept multiple changes", () => {
      const params: TextDocumentDidChangeParams = {
        uri: "file:///path/to/file.lfe",
        version: 3,
        changes: [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 5 },
            },
            text: "(defmodule",
          },
          {
            range: {
              start: { line: 1, character: 0 },
              end: { line: 1, character: 10 },
            },
            text: "(export all)",
          },
        ],
      };
      expect(params.changes).toHaveLength(2);
    });
  });

  describe("textDocumentDidClose", () => {
    it("should accept required uri parameter", () => {
      const params: TextDocumentDidCloseParams = {
        uri: "file:///path/to/file.lfe",
      };
      expect(params.uri).toBe("file:///path/to/file.lfe");
    });
  });
});
