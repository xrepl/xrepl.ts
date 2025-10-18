import { encode, decode } from "@msgpack/msgpack";
import { Result, ok, err } from "neverthrow";
import { CodecError } from "../types/errors";

/**
 * Encode a JavaScript object to MessagePack format
 */
export function encodeMessage<T>(message: T): Result<Uint8Array, CodecError> {
  try {
    const encoded = encode(message);
    return ok(new Uint8Array(encoded));
  } catch (error) {
    return err({
      type: "encoding_error",
      message: `Failed to encode message: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/**
 * Decode MessagePack data to JavaScript object
 */
export function decodeMessage<T>(data: Uint8Array): Result<T, CodecError> {
  try {
    const decoded = decode(data) as T;
    return ok(decoded);
  } catch (error) {
    return err({
      type: "decoding_error",
      message: `Failed to decode message: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/**
 * Add 4-byte big-endian length prefix to MessagePack data
 */
export function addLengthPrefix(data: Uint8Array): Uint8Array {
  const length = data.length;
  const prefixed = new Uint8Array(4 + length);

  // Write big-endian 32-bit length
  prefixed[0] = (length >>> 24) & 0xff;
  prefixed[1] = (length >>> 16) & 0xff;
  prefixed[2] = (length >>> 8) & 0xff;
  prefixed[3] = length & 0xff;

  prefixed.set(data, 4);
  return prefixed;
}

/**
 * Read 4-byte big-endian length prefix
 */
export function readLengthPrefix(data: Uint8Array): number {
  if (data.length < 4) {
    throw new Error("Insufficient data for length prefix");
  }

  // Use unsigned right shift (>>>) to ensure unsigned 32-bit integer
  return (
    ((data[0]! << 24) >>> 0) |
    (data[1]! << 16) |
    (data[2]! << 8) |
    data[3]!
  );
}

/**
 * Encode message with length prefix (complete packet format)
 */
export function encodePacket<T>(message: T): Result<Uint8Array, CodecError> {
  const encodedResult = encodeMessage(message);
  if (encodedResult.isErr()) {
    return encodedResult;
  }

  const encoded = encodedResult.value;
  const packet = addLengthPrefix(encoded);
  return ok(packet);
}
