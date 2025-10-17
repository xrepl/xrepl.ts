import {
  encodeMessage,
  decodeMessage,
  addLengthPrefix,
  readLengthPrefix,
  encodePacket,
} from "../../../src/codec/msgpack";

describe("MessagePack Codec", () => {
  describe("encodeMessage", () => {
    it("should encode a simple object", () => {
      const result = encodeMessage({ op: "ping", id: "test-001" });

      expect(result.isOk()).toBe(true);
      result.map((data) => {
        expect(data).toBeInstanceOf(Uint8Array);
        expect(data.length).toBeGreaterThan(0);
      });
    });

    it("should encode an eval request", () => {
      const request = {
        id: "eval-001",
        op: "eval",
        session: "session-1",
        code: "(+ 1 2)",
      };

      const result = encodeMessage(request);
      expect(result.isOk()).toBe(true);
    });

    it("should handle empty objects", () => {
      const result = encodeMessage({});
      expect(result.isOk()).toBe(true);
    });
  });

  describe("decodeMessage", () => {
    it("should decode a previously encoded object", () => {
      const original = { op: "ping", id: "test-001" };
      const encoded = encodeMessage(original);

      expect(encoded.isOk()).toBe(true);

      encoded.map((data) => {
        const decoded = decodeMessage<typeof original>(data);
        expect(decoded.isOk()).toBe(true);

        decoded.map((obj) => {
          expect(obj).toEqual(original);
        });
      });
    });

    it("should handle complex nested objects", () => {
      const original = {
        id: "test-001",
        data: {
          nested: {
            value: 42,
            array: [1, 2, 3],
          },
        },
      };

      const encoded = encodeMessage(original);
      expect(encoded.isOk()).toBe(true);

      encoded.map((data) => {
        const decoded = decodeMessage<typeof original>(data);
        expect(decoded.isOk()).toBe(true);

        decoded.map((obj) => {
          expect(obj).toEqual(original);
        });
      });
    });

    it("should return error for invalid data", () => {
      const invalidData = new Uint8Array([0xff, 0xff, 0xff]);
      const result = decodeMessage(invalidData);

      expect(result.isErr()).toBe(true);
      result.mapErr((error) => {
        expect(error.type).toBe("decoding_error");
      });
    });
  });

  describe("addLengthPrefix", () => {
    it("should add correct 4-byte big-endian prefix", () => {
      const data = new Uint8Array([0x01, 0x02, 0x03]);
      const prefixed = addLengthPrefix(data);

      expect(prefixed.length).toBe(7); // 4 + 3
      expect(prefixed[0]).toBe(0);
      expect(prefixed[1]).toBe(0);
      expect(prefixed[2]).toBe(0);
      expect(prefixed[3]).toBe(3);
      expect(prefixed[4]).toBe(0x01);
      expect(prefixed[5]).toBe(0x02);
      expect(prefixed[6]).toBe(0x03);
    });

    it("should handle large messages", () => {
      const data = new Uint8Array(1000);
      const prefixed = addLengthPrefix(data);

      expect(prefixed.length).toBe(1004);
      const length = readLengthPrefix(prefixed);
      expect(length).toBe(1000);
    });

    it("should handle empty data", () => {
      const data = new Uint8Array(0);
      const prefixed = addLengthPrefix(data);

      expect(prefixed.length).toBe(4);
      expect(prefixed[0]).toBe(0);
      expect(prefixed[1]).toBe(0);
      expect(prefixed[2]).toBe(0);
      expect(prefixed[3]).toBe(0);
    });
  });

  describe("readLengthPrefix", () => {
    it("should read correct length from prefix", () => {
      const prefixed = new Uint8Array([0x00, 0x00, 0x01, 0x00]);
      const length = readLengthPrefix(prefixed);
      expect(length).toBe(256);
    });

    it("should throw error for insufficient data", () => {
      const insufficientData = new Uint8Array([0x00, 0x00]);
      expect(() => readLengthPrefix(insufficientData)).toThrow();
    });

    it("should handle large length values", () => {
      // Test with 16MB (realistic maximum for xREPL messages)
      const prefixed = new Uint8Array([0x01, 0x00, 0x00, 0x00]);
      const length = readLengthPrefix(prefixed);
      expect(length).toBe(16777216);
    });
  });

  describe("encodePacket", () => {
    it("should encode message with length prefix", () => {
      const message = { op: "ping", id: "test-001" };
      const result = encodePacket(message);

      expect(result.isOk()).toBe(true);

      result.map((packet) => {
        expect(packet.length).toBeGreaterThan(4);

        // Read length prefix
        const length = readLengthPrefix(packet);
        expect(length).toBe(packet.length - 4);

        // Decode message part (skip length prefix)
        const messageData = packet.subarray(4);
        const decoded = decodeMessage<typeof message>(messageData);

        expect(decoded.isOk()).toBe(true);
        decoded.map((obj) => {
          expect(obj).toEqual(message);
        });
      });
    });
  });
});
