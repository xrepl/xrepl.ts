import {
  generateRequestId,
  resetRequestCounter,
} from "../../../src/utils/id-generator";

describe("ID Generator", () => {
  beforeEach(() => {
    resetRequestCounter();
  });

  describe("generateRequestId", () => {
    it("should generate IDs with correct format", () => {
      const id = generateRequestId("eval");
      expect(id).toMatch(/^eval-\d{3}$/);
    });

    it("should increment counter", () => {
      const id1 = generateRequestId("eval");
      const id2 = generateRequestId("eval");
      const id3 = generateRequestId("eval");

      expect(id1).toBe("eval-000");
      expect(id2).toBe("eval-001");
      expect(id3).toBe("eval-002");
    });

    it("should work with different operation names", () => {
      const evalId = generateRequestId("eval");
      const cloneId = generateRequestId("clone");
      const pingId = generateRequestId("ping");

      expect(evalId).toBe("eval-000");
      expect(cloneId).toBe("clone-001");
      expect(pingId).toBe("ping-002");
    });

    it("should pad numbers correctly", () => {
      resetRequestCounter();

      const ids = Array.from({ length: 15 }, () =>
        generateRequestId("test")
      );

      expect(ids[0]).toBe("test-000");
      expect(ids[9]).toBe("test-009");
      expect(ids[10]).toBe("test-010");
      expect(ids[14]).toBe("test-014");
    });
  });

  describe("resetRequestCounter", () => {
    it("should reset counter to zero", () => {
      generateRequestId("eval");
      generateRequestId("eval");
      generateRequestId("eval");

      resetRequestCounter();

      const id = generateRequestId("eval");
      expect(id).toBe("eval-000");
    });
  });
});
