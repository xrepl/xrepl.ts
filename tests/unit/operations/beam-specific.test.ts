import { describe, it, expect, beforeEach } from "@jest/globals";
import { resetRequestCounter } from "../../../src/utils/id-generator";
import type { HotReloadParams } from "../../../src/operations/beam-specific/hot-reload";
import type { ListProcessesParams } from "../../../src/operations/beam-specific/list-processes";
import type { InspectProcessParams } from "../../../src/operations/beam-specific/inspect-process";
import type { TraceCallsParams } from "../../../src/operations/beam-specific/trace-calls";
import type { SystemInfoParams } from "../../../src/operations/beam-specific/system-info";
import type { ObserverDataParams } from "../../../src/operations/beam-specific/observer-data";

describe("BEAM-Specific Operations", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("hotReload", () => {
    it("should accept empty params", () => {
      const params: HotReloadParams = {};
      expect(params).toBeDefined();
    });

    it("should accept modules parameter", () => {
      const params: HotReloadParams = {
        modules: ["my-module", "another-module"],
      };
      expect(params.modules).toHaveLength(2);
    });

    it("should accept purge parameter", () => {
      const params: HotReloadParams = {
        purge: true,
      };
      expect(params.purge).toBe(true);
    });
  });

  describe("listProcesses", () => {
    it("should accept empty params", () => {
      const params: ListProcessesParams = {};
      expect(params).toBeDefined();
    });

    it("should accept filter parameter", () => {
      const params: ListProcessesParams = {
        filter: {
          min_message_queue_len: 100,
          min_heap_size: 1000,
          status: "running",
        },
      };
      expect(params.filter?.min_message_queue_len).toBe(100);
    });
  });

  describe("inspectProcess", () => {
    it("should accept required pid parameter", () => {
      const params: InspectProcessParams = {
        pid: "<0.123.0>",
      };
      expect(params.pid).toBe("<0.123.0>");
    });

    it("should accept options parameter", () => {
      const params: InspectProcessParams = {
        pid: "<0.123.0>",
        options: {
          include_messages: true,
          include_backtrace: true,
          include_dictionary: false,
        },
      };
      expect(params.options?.include_messages).toBe(true);
    });
  });

  describe("traceCalls", () => {
    it("should accept start action", () => {
      const params: TraceCallsParams = {
        action: "start",
      };
      expect(params.action).toBe("start");
    });

    it("should accept stop action", () => {
      const params: TraceCallsParams = {
        action: "stop",
      };
      expect(params.action).toBe("stop");
    });

    it("should accept status action", () => {
      const params: TraceCallsParams = {
        action: "status",
      };
      expect(params.action).toBe("status");
    });

    it("should accept module/function/arity parameters", () => {
      const params: TraceCallsParams = {
        action: "start",
        module: "my-module",
        function: "my-function",
        arity: 2,
      };
      expect(params.module).toBe("my-module");
      expect(params.function).toBe("my-function");
      expect(params.arity).toBe(2);
    });

    it("should accept options", () => {
      const params: TraceCallsParams = {
        action: "start",
        options: {
          max_traces: 1000,
          timeout: 5000,
        },
      };
      expect(params.options?.max_traces).toBe(1000);
    });
  });

  describe("systemInfo", () => {
    it("should accept empty params", () => {
      const params: SystemInfoParams = {};
      expect(params).toBeDefined();
    });

    it("should accept categories parameter", () => {
      const params: SystemInfoParams = {
        categories: ["memory", "statistics", "scheduler_info"],
      };
      expect(params.categories).toHaveLength(3);
    });
  });

  describe("observerData", () => {
    it("should accept applications data type", () => {
      const params: ObserverDataParams = {
        data_type: "applications",
      };
      expect(params.data_type).toBe("applications");
    });

    it("should accept processes data type", () => {
      const params: ObserverDataParams = {
        data_type: "processes",
      };
      expect(params.data_type).toBe("processes");
    });

    it("should accept ports data type", () => {
      const params: ObserverDataParams = {
        data_type: "ports",
      };
      expect(params.data_type).toBe("ports");
    });

    it("should accept ets data type", () => {
      const params: ObserverDataParams = {
        data_type: "ets",
      };
      expect(params.data_type).toBe("ets");
    });

    it("should accept mnesia data type", () => {
      const params: ObserverDataParams = {
        data_type: "mnesia",
      };
      expect(params.data_type).toBe("mnesia");
    });

    it("should accept options", () => {
      const params: ObserverDataParams = {
        data_type: "processes",
        options: {
          sort_by: "memory",
          limit: 50,
        },
      };
      expect(params.options?.sort_by).toBe("memory");
      expect(params.options?.limit).toBe(50);
    });
  });
});
