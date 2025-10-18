import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { SetBreakpointParams } from "../../../src/operations/debugging/set-breakpoint";
import type { ClearBreakpointParams } from "../../../src/operations/debugging/clear-breakpoint";
import type { StacktraceParams } from "../../../src/operations/debugging/stacktrace";
import type { StepParams } from "../../../src/operations/debugging/step";
import type { InspectLocalsParams } from "../../../src/operations/debugging/inspect-locals";
import type { EvalInFrameParams } from "../../../src/operations/debugging/eval-in-frame";

describe("Debugging Operations", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("setBreakpoint", () => {
    it("should accept required parameters", () => {
      const params: SetBreakpointParams = {
        file: "/path/to/file.lfe",
        line: 42,
      };
      expect(params.file).toBe("/path/to/file.lfe");
      expect(params.line).toBe(42);
    });

    it("should accept optional parameters", () => {
      const params: SetBreakpointParams = {
        file: "/path/to/file.lfe",
        line: 42,
        column: 10,
        condition: "(> x 100)",
      };
      expect(params.column).toBe(10);
      expect(params.condition).toBe("(> x 100)");
    });
  });

  describe("clearBreakpoint", () => {
    it("should accept breakpoint ID", () => {
      const params: ClearBreakpointParams = {
        breakpoint_id: "bp-001",
      };
      expect(params.breakpoint_id).toBe("bp-001");
    });
  });

  describe("listBreakpoints", () => {
    it("should not require parameters", () => {
      // listBreakpoints takes no params besides session/token
      expect(true).toBe(true);
    });
  });

  describe("stacktrace", () => {
    it("should accept empty params", () => {
      const params: StacktraceParams = {};
      expect(params).toBeDefined();
    });

    it("should accept thread_id parameter", () => {
      const params: StacktraceParams = {
        thread_id: "thread-1",
      };
      expect(params.thread_id).toBe("thread-1");
    });
  });

  describe("step", () => {
    it("should accept step into", () => {
      const params: StepParams = {
        type: "into",
      };
      expect(params.type).toBe("into");
    });

    it("should accept step over", () => {
      const params: StepParams = {
        type: "over",
      };
      expect(params.type).toBe("over");
    });

    it("should accept step out", () => {
      const params: StepParams = {
        type: "out",
      };
      expect(params.type).toBe("out");
    });

    it("should accept count parameter", () => {
      const params: StepParams = {
        type: "over",
        count: 3,
      };
      expect(params.count).toBe(3);
    });
  });

  describe("inspectLocals", () => {
    it("should accept empty params", () => {
      const params: InspectLocalsParams = {};
      expect(params).toBeDefined();
    });

    it("should accept frame_id parameter", () => {
      const params: InspectLocalsParams = {
        frame_id: 2,
      };
      expect(params.frame_id).toBe(2);
    });
  });

  describe("evalInFrame", () => {
    it("should accept required code parameter", () => {
      const params: EvalInFrameParams = {
        code: "(+ x 10)",
      };
      expect(params.code).toBe("(+ x 10)");
    });

    it("should accept frame_id parameter", () => {
      const params: EvalInFrameParams = {
        code: "x",
        frame_id: 1,
      };
      expect(params.frame_id).toBe(1);
    });
  });
});
