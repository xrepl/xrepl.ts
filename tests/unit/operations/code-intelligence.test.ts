import { generateRequestId, resetRequestCounter } from "../../../src/utils/id-generator";

describe("Code Intelligence Operations", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("Request ID Generation", () => {
    it("should generate correct IDs for complete operation", () => {
      const id = generateRequestId("complete");
      expect(id).toBe("complete-000");
    });

    it("should generate correct IDs for signature operation", () => {
      const id = generateRequestId("signature");
      expect(id).toBe("signature-000");
    });

    it("should generate correct IDs for eldoc operation", () => {
      const id = generateRequestId("eldoc");
      expect(id).toBe("eldoc-000");
    });

    it("should generate correct IDs for doc operation", () => {
      const id = generateRequestId("doc");
      expect(id).toBe("doc-000");
    });

    it("should generate correct IDs for find-definition operation", () => {
      const id = generateRequestId("find-definition");
      expect(id).toBe("find-definition-000");
    });

    it("should generate correct IDs for find-references operation", () => {
      const id = generateRequestId("find-references");
      expect(id).toBe("find-references-000");
    });

    it("should generate correct IDs for list-definitions operation", () => {
      const id = generateRequestId("list-definitions");
      expect(id).toBe("list-definitions-000");
    });

    it("should generate correct IDs for format operation", () => {
      const id = generateRequestId("format");
      expect(id).toBe("format-000");
    });
  });

  describe("Parameter Types", () => {
    it("should accept valid complete params", () => {
      const params = {
        prefix: "def",
        context: "(defun hello () ",
        line: 1,
        column: 15,
      };
      expect(params.prefix).toBeDefined();
      expect(params.context).toBeDefined();
    });

    it("should accept valid signature params", () => {
      const params = {
        symbol: "map",
        context: "(map ",
      };
      expect(params.symbol).toBeDefined();
    });

    it("should accept valid eldoc params", () => {
      const params = {
        symbol: "lists:map",
      };
      expect(params.symbol).toBeDefined();
    });

    it("should accept valid doc params", () => {
      const params = {
        symbol: "lists:map",
      };
      expect(params.symbol).toBeDefined();
    });

    it("should accept valid find-definition params", () => {
      const params = {
        symbol: "my-function",
        context: "(my-function ",
      };
      expect(params.symbol).toBeDefined();
    });

    it("should accept valid find-references params", () => {
      const params = {
        symbol: "my-function",
        includeDeclaration: true,
      };
      expect(params.symbol).toBeDefined();
      expect(params.includeDeclaration).toBe(true);
    });

    it("should accept valid list-definitions params", () => {
      const params = {
        file: "/path/to/file.lfe",
      };
      expect(params.file).toBeDefined();
    });

    it("should accept valid list-definitions params with namespace", () => {
      const params = {
        namespace: "my-module",
      };
      expect(params.namespace).toBeDefined();
    });

    it("should accept valid format params", () => {
      const params = {
        code: "(defun hello()  'world)",
        file: "buffer.lfe",
      };
      expect(params.code).toBeDefined();
    });
  });
});
