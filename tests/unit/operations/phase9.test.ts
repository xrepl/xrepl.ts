import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { SwitchNamespaceParams } from "../../../src/operations/phase9/switch-namespace";
import type { SessionInfoParams } from "../../../src/operations/phase9/session-info";
import type { UploadHistoryParams } from "../../../src/operations/phase9/upload-history";
import type { TypeInfoParams } from "../../../src/operations/phase9/type-info";
import type { AproposParams } from "../../../src/operations/phase9/apropos";
import type { SymbolAtPointParams } from "../../../src/operations/phase9/symbol-at-point";
import type { DependenciesParams } from "../../../src/operations/phase9/dependencies";
import type { BuildParams } from "../../../src/operations/phase9/build";
import type { EvalMultipleParams } from "../../../src/operations/phase9/eval-multiple";
import type { CancelParams } from "../../../src/operations/phase9/cancel";
import type { CapabilitiesParams } from "../../../src/operations/phase9/capabilities";
import type { VersionParams } from "../../../src/operations/phase9/version";
import type { LoadedModulesParams } from "../../../src/operations/phase9/loaded-modules";

describe("Phase 9: MUST HAVE - Essential Operations", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("switchNamespace", () => {
    it("should accept required namespace parameter", () => {
      const params: SwitchNamespaceParams = {
        namespace: "my-module",
      };
      expect(params.namespace).toBe("my-module");
    });
  });

  describe("sessionInfo", () => {
    it("should accept empty params", () => {
      const params: SessionInfoParams = {};
      expect(params).toBeDefined();
    });

    it("should accept optional session_id parameter", () => {
      const params: SessionInfoParams = {
        session_id: "session-123",
      };
      expect(params.session_id).toBe("session-123");
    });
  });

  describe("uploadHistory", () => {
    it("should accept history parameter (Emacs style)", () => {
      const params: UploadHistoryParams = {
        history: ["(+ 1 2)", "(defun foo () ...)", "(foo)"],
      };
      expect(params.history).toHaveLength(3);
    });

    it("should accept commands parameter (VSCode style)", () => {
      const params: UploadHistoryParams = {
        commands: ["(* 3 4)", "(list 1 2 3)"],
      };
      expect(params.commands).toHaveLength(2);
    });

    it("should accept both history and commands", () => {
      const params: UploadHistoryParams = {
        history: ["(foo)"],
        commands: ["(bar)"],
      };
      expect(params.history).toHaveLength(1);
      expect(params.commands).toHaveLength(1);
    });
  });

  describe("typeInfo", () => {
    it("should accept required symbol parameter", () => {
      const params: TypeInfoParams = {
        symbol: "lists:map",
      };
      expect(params.symbol).toBe("lists:map");
    });
  });

  describe("apropos", () => {
    it("should accept required query parameter", () => {
      const params: AproposParams = {
        query: "map",
      };
      expect(params.query).toBe("map");
    });

    it("should accept optional parameters", () => {
      const params: AproposParams = {
        query: "fold",
        search_docs: true,
        search_private: false,
      };
      expect(params.query).toBe("fold");
      expect(params.search_docs).toBe(true);
      expect(params.search_private).toBe(false);
    });
  });

  describe("symbolAtPoint", () => {
    it("should accept required file, line, and column parameters", () => {
      const params: SymbolAtPointParams = {
        file: "/path/to/file.lfe",
        line: 10,
        column: 5,
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(10);
      expect(params.column).toBe(5);
    });

    it("should accept optional contents parameter", () => {
      const params: SymbolAtPointParams = {
        file: "/path/to/file.lfe",
        line: 15,
        column: 8,
        contents: "(defun my-func () ...)",
      };
      expect(params.contents).toBe("(defun my-func () ...)");
    });
  });

  describe("dependencies", () => {
    it("should accept required project_root parameter", () => {
      const params: DependenciesParams = {
        project_root: "/path/to/project",
      };
      expect(params.project_root).toBe("/path/to/project");
    });
  });

  describe("build", () => {
    it("should accept required project_root and target parameters", () => {
      const params: BuildParams = {
        project_root: "/path/to/project",
        target: "compile",
      };
      expect(params.project_root).toBe("/path/to/project");
      expect(params.target).toBe("compile");
    });

    it("should accept standard build targets", () => {
      const targets: Array<BuildParams["target"]> = [
        "compile",
        "test",
        "release",
      ];
      targets.forEach((target) => {
        const params: BuildParams = {
          project_root: "/path",
          target,
        };
        expect(params.target).toBe(target);
      });
    });

    it("should accept custom build targets", () => {
      const params: BuildParams = {
        project_root: "/path/to/project",
        target: "custom-target",
      };
      expect(params.target).toBe("custom-target");
    });
  });

  describe("evalMultiple", () => {
    it("should accept required forms parameter", () => {
      const params: EvalMultipleParams = {
        forms: ["(+ 1 2)", "(* 3 4)", "(- 10 5)"],
      };
      expect(params.forms).toHaveLength(3);
    });

    it("should handle single form", () => {
      const params: EvalMultipleParams = {
        forms: ["(list 1 2 3)"],
      };
      expect(params.forms).toHaveLength(1);
    });

    it("should handle many forms", () => {
      const params: EvalMultipleParams = {
        forms: Array.from({ length: 10 }, (_, i) => `(form-${i})`),
      };
      expect(params.forms).toHaveLength(10);
    });
  });

  describe("cancel", () => {
    it("should accept required cancel_id parameter", () => {
      const params: CancelParams = {
        cancel_id: "eval-123",
      };
      expect(params.cancel_id).toBe("eval-123");
    });
  });

  describe("capabilities", () => {
    it("should accept empty params", () => {
      const params: CapabilitiesParams = {};
      expect(params).toBeDefined();
    });
  });

  describe("version", () => {
    it("should accept empty params", () => {
      const params: VersionParams = {};
      expect(params).toBeDefined();
    });
  });

  describe("loadedModules", () => {
    it("should accept empty params", () => {
      const params: LoadedModulesParams = {};
      expect(params).toBeDefined();
    });
  });
});
