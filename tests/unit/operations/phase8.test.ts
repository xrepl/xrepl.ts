import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { MacroexpandParams } from "../../../src/operations/phase8/macroexpand";
import type { MacroexpandAllParams } from "../../../src/operations/phase8/macroexpand-all";
import type { ProfileStartParams } from "../../../src/operations/phase8/profile-start";
import type { ProfileStopParams } from "../../../src/operations/phase8/profile-stop";
import type { BenchmarkParams } from "../../../src/operations/phase8/benchmark";
import type { WorkspaceSymbolsParams } from "../../../src/operations/phase8/workspace-symbols";
import type { GenerateFunctionParams } from "../../../src/operations/phase8/generate-function";
import type { GenerateTestsParams } from "../../../src/operations/phase8/generate-tests";
import type { SuggestImprovementsParams } from "../../../src/operations/phase8/suggest-improvements";
import type { SnippetsParams } from "../../../src/operations/phase8/snippets";
import type { ShareSessionParams } from "../../../src/operations/phase8/share-session";
import type { RestoreSessionParams } from "../../../src/operations/phase8/restore-session";

describe("Phase 8: Advanced Features", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("macroexpand", () => {
    it("should accept required code parameter", () => {
      const params: MacroexpandParams = {
        code: "(defmacro foo () '(bar baz))",
      };
      expect(params.code).toBeDefined();
    });

    it("should accept expand_all parameter", () => {
      const params: MacroexpandParams = {
        code: "(some-macro)",
        expand_all: true,
      };
      expect(params.expand_all).toBe(true);
    });
  });

  describe("macroexpandAll", () => {
    it("should accept required code parameter", () => {
      const params: MacroexpandAllParams = {
        code: "(nested-macros)",
      };
      expect(params.code).toBeDefined();
    });
  });

  describe("profileStart", () => {
    it("should accept empty params", () => {
      const params: ProfileStartParams = {};
      expect(params).toBeDefined();
    });

    it("should accept options parameter", () => {
      const params: ProfileStartParams = {
        options: {
          modules: ["module1", "module2"],
          functions: ["func1"],
          sample_rate: 100,
        },
      };
      expect(params.options?.modules).toHaveLength(2);
    });
  });

  describe("profileStop", () => {
    it("should accept empty params", () => {
      const params: ProfileStopParams = {};
      expect(params).toBeDefined();
    });

    it("should accept profile_id parameter", () => {
      const params: ProfileStopParams = {
        profile_id: "profile-123",
      };
      expect(params.profile_id).toBe("profile-123");
    });
  });

  describe("benchmark", () => {
    it("should accept required code parameter", () => {
      const params: BenchmarkParams = {
        code: "(+ 1 2)",
      };
      expect(params.code).toBeDefined();
    });

    it("should accept iterations parameter", () => {
      const params: BenchmarkParams = {
        code: "(fib 20)",
        iterations: 1000,
      };
      expect(params.iterations).toBe(1000);
    });

    it("should accept warmup parameter", () => {
      const params: BenchmarkParams = {
        code: "(heavy-computation)",
        warmup: 10,
      };
      expect(params.warmup).toBe(10);
    });
  });

  describe("workspaceSymbols", () => {
    it("should accept empty params", () => {
      const params: WorkspaceSymbolsParams = {};
      expect(params).toBeDefined();
    });

    it("should accept query parameter", () => {
      const params: WorkspaceSymbolsParams = {
        query: "my-function",
      };
      expect(params.query).toBe("my-function");
    });

    it("should accept kind parameter", () => {
      const params: WorkspaceSymbolsParams = {
        kind: "function",
      };
      expect(params.kind).toBe("function");
    });
  });

  describe("generateFunction", () => {
    it("should accept required description parameter", () => {
      const params: GenerateFunctionParams = {
        description: "Calculate factorial of a number",
      };
      expect(params.description).toBeDefined();
    });

    it("should accept optional parameters", () => {
      const params: GenerateFunctionParams = {
        description: "Calculate factorial",
        name: "factorial",
        params: [{ name: "n", type: "integer" }],
        return_type: "integer",
        examples: ["(factorial 5) => 120"],
      };
      expect(params.name).toBe("factorial");
      expect(params.params).toHaveLength(1);
      expect(params.return_type).toBe("integer");
      expect(params.examples).toHaveLength(1);
    });
  });

  describe("generateTests", () => {
    it("should accept required code parameter", () => {
      const params: GenerateTestsParams = {
        code: "(defun factorial (n) ...)",
      };
      expect(params.code).toBeDefined();
    });

    it("should accept optional parameters", () => {
      const params: GenerateTestsParams = {
        code: "(defun factorial (n) ...)",
        function_name: "factorial",
        framework: "eunit",
        count: 5,
        include_edge_cases: true,
      };
      expect(params.function_name).toBe("factorial");
      expect(params.framework).toBe("eunit");
      expect(params.count).toBe(5);
      expect(params.include_edge_cases).toBe(true);
    });
  });

  describe("suggestImprovements", () => {
    it("should accept required code parameter", () => {
      const params: SuggestImprovementsParams = {
        code: "(defun my-func (x) ...)",
      };
      expect(params.code).toBeDefined();
    });

    it("should accept optional parameters", () => {
      const params: SuggestImprovementsParams = {
        code: "(defun my-func (x) ...)",
        file: "src/my-module.lfe",
        focus: ["performance", "readability"],
        max_suggestions: 10,
      };
      expect(params.file).toBe("src/my-module.lfe");
      expect(params.focus).toHaveLength(2);
      expect(params.max_suggestions).toBe(10);
    });
  });

  describe("snippets", () => {
    it("should accept empty params", () => {
      const params: SnippetsParams = {};
      expect(params).toBeDefined();
    });

    it("should accept optional parameters", () => {
      const params: SnippetsParams = {
        query: "gen_server",
        category: "OTP",
        tags: ["behavior", "template"],
        limit: 20,
      };
      expect(params.query).toBe("gen_server");
      expect(params.category).toBe("OTP");
      expect(params.tags).toHaveLength(2);
      expect(params.limit).toBe(20);
    });
  });

  describe("shareSession", () => {
    it("should accept empty params", () => {
      const params: ShareSessionParams = {};
      expect(params).toBeDefined();
    });

    it("should accept optional parameters", () => {
      const params: ShareSessionParams = {
        session_id: "session-123",
        include_history: true,
        include_bindings: true,
        expiration: 3600,
        label: "Debug session",
      };
      expect(params.session_id).toBe("session-123");
      expect(params.include_history).toBe(true);
      expect(params.include_bindings).toBe(true);
      expect(params.expiration).toBe(3600);
      expect(params.label).toBe("Debug session");
    });
  });

  describe("restoreSession", () => {
    it("should accept required share_id parameter", () => {
      const params: RestoreSessionParams = {
        share_id: "share-abc123",
      };
      expect(params.share_id).toBe("share-abc123");
    });

    it("should accept optional parameters", () => {
      const params: RestoreSessionParams = {
        share_id: "share-abc123",
        access_token: "token-xyz",
        new_session: true,
      };
      expect(params.access_token).toBe("token-xyz");
      expect(params.new_session).toBe(true);
    });
  });
});
