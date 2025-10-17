# xREPL TypeScript Client Library - Implementation Guide

## Project Overview

You are implementing a TypeScript client library for the xREPL protocol, which will be used in a VSCode extension. This library enables communication with an LFE (Lisp Flavored Erlang) language server using MessagePack over TCP or UNIX domain sockets.

**Repository:** https://github.com/xrepl/xrepl.ts  
**Local Path:** ~/lab/lfe/xrepl/xrepl.ts

## Core Requirements

### Technology Stack

- **Language:** TypeScript with strict mode enabled
- **Build Tools:** 
  - `tsc` for compilation
  - `tsup` for bundling
- **Package Manager:** npm
- **Testing:** ts-jest
- **Linting:** ESLint
- **Key Dependencies:**
  - `@msgpack/msgpack` - MessagePack encoding/decoding
  - `neverthrow` - Result type for error handling (no exceptions)

### Architecture Principles

1. **Functional Design:** Prefer functional patterns over class-based OOP
2. **Type Safety:** Full TypeScript strict mode, strongly-typed operations
3. **Error Handling:** Use `neverthrow` Result types - never throw exceptions
4. **Transport Abstraction:** Single user-facing API supporting both TCP and UNIX sockets
5. **Security:** Each operation individually implemented and validated (no generic message passing)

## Project Structure

```
xrepl.ts/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── client.ts                   # Main client factory and coordination
│   ├── types/
│   │   ├── protocol.ts             # Protocol message types
│   │   ├── operations.ts           # Operation-specific types
│   │   └── errors.ts               # Error types
│   ├── transport/
│   │   ├── base.ts                 # Transport interface
│   │   ├── tcp.ts                  # TCP transport implementation
│   │   ├── unix.ts                 # UNIX socket transport implementation
│   │   └── pool.ts                 # Connection pooling
│   ├── codec/
│   │   └── msgpack.ts              # MessagePack encoding/decoding
│   ├── connection/
│   │   ├── manager.ts              # Connection lifecycle management
│   │   └── reconnect.ts            # Reconnection with exponential backoff
│   ├── session/
│   │   └── tracker.ts              # Session management
│   ├── operations/
│   │   ├── phase1/                 # Core REPL operations
│   │   │   ├── eval.ts
│   │   │   ├── clone.ts
│   │   │   ├── close.ts
│   │   │   ├── ls-sessions.ts
│   │   │   ├── ping.ts
│   │   │   ├── describe.ts
│   │   │   ├── interrupt.ts
│   │   │   └── load-file.ts
│   │   ├── phase2/                 # Code Intelligence
│   │   │   ├── complete.ts
│   │   │   ├── signature.ts
│   │   │   ├── eldoc.ts
│   │   │   ├── doc.ts
│   │   │   ├── find-definition.ts
│   │   │   ├── find-references.ts
│   │   │   ├── list-definitions.ts
│   │   │   └── format.ts
│   │   ├── phase3/                 # Compilation & Building
│   │   ├── phase4/                 # Debugging
│   │   ├── phase5/                 # Testing & Refactoring
│   │   ├── phase6/                 # BEAM-Specific
│   │   └── phase7/                 # Advanced Features
│   └── utils/
│       ├── validation.ts           # Input validation utilities
│       └── id-generator.ts         # Request ID generation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   └── design/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .eslintrc.js
└── README.md
```

## Implementation Phases

Implement operations in phases as defined in the protocol specification. Each phase should be completed and tested before moving to the next.

### Phase 1: Core REPL (Critical - Implement First)

**Operations:** eval, clone, close, ls_sessions, ping, describe, interrupt, load_file

**Priority:** These are essential for basic REPL functionality.

### Phase 2: Code Intelligence (High Priority)

**Operations:** complete, signature/signature_help, eldoc, doc, find_definition/definition, find_references/references, list_definitions, format/format_code

### Phase 3: Compilation & Building (High Priority)

**Operations:** compile_file, compile_project, lint, buffer_analysis

### Phase 4: Debugging (Medium Priority)

**Operations:** set_breakpoint, clear_breakpoint, list_breakpoints, stacktrace, step, inspect_locals, eval_in_frame

### Phase 5: Testing & Refactoring (Medium Priority)

**Operations:** test_run, test_coverage, test_rerun_failures, rename_symbol, extract_function, inline_function

### Phase 6: BEAM-Specific (Medium Priority)

**Operations:** hot_reload, list_processes, inspect_process, trace_calls, system_info, observer_data

### Phase 7: Advanced Features (Low Priority)

**Operations:** macroexpand, macroexpand_all, profile_start, profile_stop, benchmark, workspace_symbols, generate_function, generate_tests, suggest_improvements, snippets, share_session, restore_session, and remaining operations

## Detailed Implementation Guidelines

### 1. Type Definitions

Create comprehensive TypeScript types for all protocol messages:

```typescript
// types/protocol.ts

/**
 * Base request structure for all xREPL operations
 */
export interface BaseRequest {
  /** Unique message ID (e.g., "req-123", "msg-0") */
  id: string;
  /** Operation name */
  op: string;
  /** Session ID (optional for most ops) */
  session?: string;
  /** Auth token (TCP only) */
  token?: string;
}

/**
 * Base response structure for all xREPL operations
 */
export interface BaseResponse {
  /** Echoed from request */
  id: string;
  /** Status array: ["done"], ["error", "done"], ["evaluating"], etc. */
  status: string[];
  /** Session ID */
  session?: string;
}

/**
 * Status values that can appear in response.status
 */
export type StatusValue =
  | "done"
  | "error"
  | "evaluating"
  | "streaming"
  | "breakpoint"
  | "session-closed"
  | "ping";

// Define specific request/response types for each operation
export interface EvalRequest extends BaseRequest {
  op: "eval";
  session: string;
  code: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface EvalResponse extends BaseResponse {
  value?: string;
  ns?: string;
  formatted?: string;
  error?: string;
  error_type?: string;
  stacktrace?: StackFrame[];
  out?: string;
  err?: string;
}

// ... Continue for all 83 operations
```

### 2. Transport Layer

Implement abstract transport interface and concrete implementations:

```typescript
// transport/base.ts

import { Result } from "neverthrow";
import { TransportError } from "../types/errors";

/**
 * Configuration for transport connections
 */
export interface TransportConfig {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Enable automatic reconnection */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
}

/**
 * Abstract transport interface for xREPL communication
 */
export interface Transport {
  /**
   * Connect to the xREPL server
   */
  connect(): Promise<Result<void, TransportError>>;

  /**
   * Disconnect from the xREPL server
   */
  disconnect(): Promise<Result<void, TransportError>>;

  /**
   * Send a MessagePack-encoded message
   * @param data - Encoded MessagePack data
   */
  send(data: Uint8Array): Promise<Result<void, TransportError>>;

  /**
   * Receive a MessagePack-encoded message
   * @returns Encoded MessagePack data
   */
  receive(): Promise<Result<Uint8Array, TransportError>>;

  /**
   * Check if transport is currently connected
   */
  isConnected(): boolean;

  /**
   * Register callback for connection events
   */
  onConnectionChange(callback: (connected: boolean) => void): void;
}
```

```typescript
// transport/tcp.ts

import * as net from "net";
import { Result, ok, err } from "neverthrow";
import { Transport, TransportConfig } from "./base";
import { TransportError } from "../types/errors";

export interface TcpConfig extends TransportConfig {
  host: string;
  port: number;
  token: string;
}

/**
 * TCP transport implementation for xREPL
 * Uses 4-byte big-endian length prefix (packet: 4 mode)
 */
export class TcpTransport implements Transport {
  // Implementation with proper packet framing
  // Handle 4-byte big-endian length prefix
  // Implement send/receive with proper buffering
}
```

```typescript
// transport/unix.ts

import * as net from "net";
import { Result } from "neverthrow";
import { Transport, TransportConfig } from "./base";

export interface UnixSocketConfig extends TransportConfig {
  socketPath: string;
}

/**
 * UNIX domain socket transport implementation for xREPL
 * Uses 4-byte big-endian length prefix (packet: 4 mode)
 */
export class UnixSocketTransport implements Transport {
  // Similar to TCP but using UNIX socket path
}
```

### 3. MessagePack Codec

```typescript
// codec/msgpack.ts

import { encode, decode } from "@msgpack/msgpack";
import { Result, ok, err } from "neverthrow";
import { CodecError } from "../types/errors";

/**
 * Encode a JavaScript object to MessagePack format
 */
export function encodeMessage<T>(
  message: T
): Result<Uint8Array, CodecError> {
  try {
    const encoded = encode(message);
    return ok(new Uint8Array(encoded));
  } catch (error) {
    return err({
      type: "encoding_error",
      message: `Failed to encode message: ${error}`,
    });
  }
}

/**
 * Decode MessagePack data to JavaScript object
 */
export function decodeMessage<T>(
  data: Uint8Array
): Result<T, CodecError> {
  try {
    const decoded = decode(data) as T;
    return ok(decoded);
  } catch (error) {
    return err({
      type: "decoding_error",
      message: `Failed to decode message: ${error}`,
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
  
  return (
    (data[0] << 24) |
    (data[1] << 16) |
    (data[2] << 8) |
    data[3]
  );
}
```

### 4. Connection Management

```typescript
// connection/manager.ts

import { Result } from "neverthrow";
import { Transport } from "../transport/base";
import { ConnectionError } from "../types/errors";

/**
 * Manages connection lifecycle, reconnection, and health monitoring
 */
export class ConnectionManager {
  constructor(
    private transport: Transport,
    private config: ConnectionConfig
  ) {}

  /**
   * Establish connection with automatic retry
   */
  async connect(): Promise<Result<void, ConnectionError>> {
    // Implementation with retry logic
  }

  /**
   * Send request and wait for response
   */
  async sendRequest<TReq, TRes>(
    request: TReq
  ): Promise<Result<TRes, ConnectionError>> {
    // Implementation with timeout handling
  }

  /**
   * Start health check ping loop
   */
  startHealthCheck(): void {
    // Periodic ping to detect connection issues
  }
}
```

```typescript
// connection/reconnect.ts

/**
 * Implements exponential backoff reconnection strategy
 */
export class ReconnectStrategy {
  private attempt = 0;
  private readonly baseDelay = 1000; // 1 second
  private readonly maxDelay = 30000; // 30 seconds

  /**
   * Calculate next delay using exponential backoff with jitter
   */
  getNextDelay(): number {
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, this.attempt),
      this.maxDelay
    );
    
    // Add jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    
    this.attempt++;
    return exponentialDelay + jitter;
  }

  reset(): void {
    this.attempt = 0;
  }
}
```

### 5. Session Management

```typescript
// session/tracker.ts

import { Result } from "neverthrow";

export interface SessionInfo {
  id: string;
  active: boolean;
  created: string;
  lastActive: string;
  namespace?: string;
}

/**
 * Tracks active sessions and their state
 */
export class SessionTracker {
  private sessions = new Map<string, SessionInfo>();
  private activeSession?: string;

  /**
   * Register a new session
   */
  addSession(info: SessionInfo): void {
    this.sessions.set(info.id, info);
  }

  /**
   * Get current active session ID
   */
  getActiveSession(): string | undefined {
    return this.activeSession;
  }

  /**
   * Set the active session
   */
  setActiveSession(sessionId: string): Result<void, Error> {
    if (!this.sessions.has(sessionId)) {
      return err(new Error(`Session ${sessionId} not found`));
    }
    this.activeSession = sessionId;
    return ok(undefined);
  }

  /**
   * Update session last active timestamp
   */
  touch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = new Date().toISOString();
    }
  }

  /**
   * Remove a session from tracking
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    if (this.activeSession === sessionId) {
      this.activeSession = undefined;
    }
  }

  /**
   * Get all tracked sessions
   */
  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }
}
```

### 6. Operation Implementation Pattern

Each operation should follow this pattern:

```typescript
// operations/phase1/eval.ts

import { Result, ok, err } from "neverthrow";
import { ConnectionManager } from "../../connection/manager";
import { EvalRequest, EvalResponse } from "../../types/protocol";
import { OperationError } from "../../types/errors";
import { validateEvalRequest } from "../../utils/validation";

/**
 * Parameters for the eval operation
 */
export interface EvalParams {
  /** LFE code to evaluate */
  code: string;
  /** File path for error reporting */
  file?: string;
  /** Starting line number */
  line?: number;
  /** Starting column */
  column?: number;
}

/**
 * Evaluate LFE code in a session context
 * 
 * @param connection - Active connection manager
 * @param sessionId - Target session ID
 * @param params - Evaluation parameters
 * @returns Result containing evaluation response or error
 * 
 * @example
 * ```typescript
 * const result = await evalCode(connection, sessionId, {
 *   code: "(+ 1 2)"
 * });
 * 
 * result.match(
 *   (response) => console.log(`Result: ${response.value}`),
 *   (error) => console.error(`Error: ${error.message}`)
 * );
 * ```
 */
export async function evalCode(
  connection: ConnectionManager,
  sessionId: string,
  params: EvalParams
): Promise<Result<EvalResponse, OperationError>> {
  // Validate input parameters
  const validationResult = validateEvalRequest(params);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // Generate unique request ID
  const requestId = generateRequestId("eval");

  // Build request
  const request: EvalRequest = {
    id: requestId,
    op: "eval",
    session: sessionId,
    code: params.code,
    ...(params.file && { file: params.file }),
    ...(params.line && { line: params.line }),
    ...(params.column && { column: params.column }),
  };

  // Send request and await response
  const result = await connection.sendRequest<EvalRequest, EvalResponse>(
    request
  );

  return result.mapErr((error) => ({
    type: "operation_error",
    operation: "eval",
    message: error.message,
  }));
}
```

### 7. Main Client API

```typescript
// client.ts

import { Result, ok, err } from "neverthrow";
import { Transport } from "./transport/base";
import { TcpTransport, TcpConfig } from "./transport/tcp";
import { UnixSocketTransport, UnixSocketConfig } from "./transport/unix";
import { ConnectionManager } from "./connection/manager";
import { SessionTracker } from "./session/tracker";
import { ClientError } from "./types/errors";

// Import all operation functions
import { evalCode, EvalParams } from "./operations/phase1/eval";
import { cloneSession } from "./operations/phase1/clone";
// ... import all other operations

/**
 * Configuration for xREPL client
 */
export type XReplClientConfig =
  | { type: "tcp"; config: TcpConfig }
  | { type: "unix"; config: UnixSocketConfig };

/**
 * Main xREPL client interface
 */
export interface XReplClient {
  // Connection management
  connect(): Promise<Result<void, ClientError>>;
  disconnect(): Promise<Result<void, ClientError>>;
  isConnected(): boolean;

  // Session management
  getActiveSession(): string | undefined;
  setActiveSession(sessionId: string): Result<void, ClientError>;

  // Phase 1: Core REPL operations
  eval(params: EvalParams): Promise<Result<EvalResponse, OperationError>>;
  clone(sourceSession?: string): Promise<Result<CloneResponse, OperationError>>;
  close(sessionId: string): Promise<Result<CloseResponse, OperationError>>;
  lsSessions(): Promise<Result<LsSessionsResponse, OperationError>>;
  ping(): Promise<Result<PingResponse, OperationError>>;
  describe(): Promise<Result<DescribeResponse, OperationError>>;
  interrupt(sessionId: string): Promise<Result<InterruptResponse, OperationError>>;
  loadFile(params: LoadFileParams): Promise<Result<LoadFileResponse, OperationError>>;

  // Phase 2: Code Intelligence operations
  complete(params: CompleteParams): Promise<Result<CompleteResponse, OperationError>>;
  signature(params: SignatureParams): Promise<Result<SignatureResponse, OperationError>>;
  eldoc(params: EldocParams): Promise<Result<EldocResponse, OperationError>>;
  doc(params: DocParams): Promise<Result<DocResponse, OperationError>>;
  findDefinition(params: FindDefinitionParams): Promise<Result<FindDefinitionResponse, OperationError>>;
  findReferences(params: FindReferencesParams): Promise<Result<FindReferencesResponse, OperationError>>;
  listDefinitions(params: ListDefinitionsParams): Promise<Result<ListDefinitionsResponse, OperationError>>;
  format(params: FormatParams): Promise<Result<FormatResponse, OperationError>>;

  // ... Continue for all 83 operations across all phases
}

/**
 * Create an xREPL client
 * 
 * @param config - Client configuration (TCP or UNIX socket)
 * @returns Result containing client instance or error
 * 
 * @example
 * ```typescript
 * // TCP connection
 * const tcpClient = createClient({
 *   type: "tcp",
 *   config: {
 *     host: "localhost",
 *     port: 50123,
 *     token: "secret-token"
 *   }
 * });
 * 
 * // UNIX socket connection
 * const unixClient = createClient({
 *   type: "unix",
 *   config: {
 *     socketPath: "/tmp/xrepl.sock"
 *   }
 * });
 * ```
 */
export function createClient(
  config: XReplClientConfig
): Result<XReplClient, ClientError> {
  try {
    // Create appropriate transport
    const transport: Transport =
      config.type === "tcp"
        ? new TcpTransport(config.config)
        : new UnixSocketTransport(config.config);

    // Create connection manager
    const connectionManager = new ConnectionManager(transport, {
      autoReconnect: true,
      maxReconnectAttempts: 10,
    });

    // Create session tracker
    const sessionTracker = new SessionTracker();

    // Return client implementation
    return ok({
      async connect() {
        return connectionManager.connect();
      },

      async disconnect() {
        return connectionManager.disconnect();
      },

      isConnected() {
        return transport.isConnected();
      },

      getActiveSession() {
        return sessionTracker.getActiveSession();
      },

      setActiveSession(sessionId: string) {
        return sessionTracker.setActiveSession(sessionId);
      },

      async eval(params: EvalParams) {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "client_error",
            message: "No active session",
          });
        }
        return evalCode(connectionManager, session, params);
      },

      async clone(sourceSession?: string) {
        return cloneSession(connectionManager, sourceSession);
      },

      // ... Implement all other operation methods
      // Each method should:
      // 1. Check for active session if required
      // 2. Validate parameters
      // 3. Call the corresponding operation function
      // 4. Return the result
    });
  } catch (error) {
    return err({
      type: "client_creation_error",
      message: `Failed to create client: ${error}`,
    });
  }
}
```

### 8. Error Types

```typescript
// types/errors.ts

/**
 * Base error interface for all xREPL errors
 */
export interface XReplError {
  type: string;
  message: string;
}

/**
 * Transport layer errors
 */
export interface TransportError extends XReplError {
  type:
    | "connection_error"
    | "disconnection_error"
    | "send_error"
    | "receive_error"
    | "timeout_error";
}

/**
 * Codec errors (MessagePack encoding/decoding)
 */
export interface CodecError extends XReplError {
  type: "encoding_error" | "decoding_error";
}

/**
 * Protocol operation errors
 */
export interface OperationError extends XReplError {
  type: "operation_error" | "validation_error";
  operation?: string;
}

/**
 * Client-level errors
 */
export interface ClientError extends XReplError {
  type:
    | "client_error"
    | "client_creation_error"
    | "session_error";
}

/**
 * Server-returned errors
 */
export interface ServerError extends XReplError {
  type: string; // Server error type (e.g., "badarg", "undef")
  stacktrace?: StackFrame[];
}

export interface StackFrame {
  module: string;
  function: string;
  arity: number;
  file: string;
  line: number;
}
```

### 9. Validation Utilities

```typescript
// utils/validation.ts

import { Result, ok, err } from "neverthrow";
import { OperationError } from "../types/errors";

/**
 * Validate eval operation parameters
 */
export function validateEvalRequest(
  params: EvalParams
): Result<void, OperationError> {
  if (!params.code || typeof params.code !== "string") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "code parameter must be a non-empty string",
    });
  }

  if (params.line !== undefined && typeof params.line !== "number") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "line parameter must be a number",
    });
  }

  if (params.column !== undefined && typeof params.column !== "number") {
    return err({
      type: "validation_error",
      operation: "eval",
      message: "column parameter must be a number",
    });
  }

  return ok(undefined);
}

// Create similar validation functions for all other operations
```

### 10. Request ID Generation

```typescript
// utils/id-generator.ts

let requestCounter = 0;

/**
 * Generate a unique request ID
 * 
 * @param operation - Operation name
 * @returns Unique request ID (e.g., "eval-001", "complete-042")
 */
export function generateRequestId(operation: string): string {
  const id = String(requestCounter++).padStart(3, "0");
  return `${operation}-${id}`;
}

/**
 * Reset the request counter (useful for testing)
 */
export function resetRequestCounter(): void {
  requestCounter = 0;
}
```

## Testing Strategy

### Unit Tests

Create unit tests for each component:

```typescript
// tests/unit/codec/msgpack.test.ts

import { encodeMessage, decodeMessage, addLengthPrefix } from "../../../src/codec/msgpack";

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

    it("should handle encoding errors gracefully", () => {
      // Test with circular reference
      const circular: any = {};
      circular.self = circular;
      
      const result = encodeMessage(circular);
      expect(result.isErr()).toBe(true);
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
  });
});
```

### Integration Tests

Test actual communication with xREPL server (requires running server):

```typescript
// tests/integration/operations/eval.test.ts

import { createClient } from "../../../src/client";

describe("Eval Operation Integration", () => {
  let client: XReplClient;

  beforeAll(async () => {
    const result = createClient({
      type: "tcp",
      config: {
        host: "localhost",
        port: 50123,
        token: process.env.XREPL_TOKEN || "test-token",
      },
    });

    expect(result.isOk()).toBe(true);
    client = result._unsafeUnwrap();

    const connectResult = await client.connect();
    expect(connectResult.isOk()).toBe(true);
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it("should evaluate simple arithmetic", async () => {
    const result = await client.eval({ code: "(+ 1 2)" });

    expect(result.isOk()).toBe(true);
    result.map((response) => {
      expect(response.status).toContain("done");
      expect(response.value).toBe("3");
    });
  });

  it("should handle evaluation errors", async () => {
    const result = await client.eval({ code: "(undefined-fn)" });

    expect(result.isOk()).toBe(true);
    result.map((response) => {
      expect(response.status).toContain("error");
      expect(response.error_type).toBe("undef");
    });
  });
});
```

## Configuration Files

### package.json

```json
{
  "name": "@xrepl/client",
  "version": "0.1.0",
  "description": "TypeScript client library for xREPL protocol",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && tsup",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "keywords": [
    "xrepl",
    "lfe",
    "lisp",
    "erlang",
    "repl",
    "language-server"
  ],
  "author": "xREPL Contributors",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/xrepl/xrepl.ts.git"
  },
  "dependencies": {
    "@msgpack/msgpack": "^3.0.0",
    "neverthrow": "^6.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
});
```

### jest.config.js

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleFileExtensions: ["ts", "js", "json"],
  verbose: true,
};
```

### .eslintrc.js

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
  },
  env: {
    node: true,
    es2022: true,
  },
};
```

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure and configuration files
- [ ] Implement MessagePack codec with length prefix handling
- [ ] Create transport interface and TCP implementation
- [ ] Create transport interface and UNIX socket implementation
- [ ] Implement basic connection manager
- [ ] Implement reconnection with exponential backoff
- [ ] Create error types and validation utilities
- [ ] Write unit tests for codec and transport layers

### Phase 2: Core Operations (Week 1-2)
- [ ] Implement Phase 1 operations (eval, clone, close, ls_sessions, ping, describe, interrupt, load_file)
- [ ] Create session tracker
- [ ] Build main client API with Phase 1 operations
- [ ] Write unit tests for each operation
- [ ] Write integration tests for core functionality

### Phase 3: Code Intelligence (Week 2-3)
- [ ] Implement Phase 2 operations (complete, signature, eldoc, doc, find_definition, find_references, list_definitions, format)
- [ ] Add operations to client API
- [ ] Write tests for code intelligence features

### Phase 4: Compilation (Week 3-4)
- [ ] Implement Phase 3 operations (compile_file, compile_project, lint, buffer_analysis)
- [ ] Add operations to client API
- [ ] Write tests for compilation features

### Phase 5: Debugging (Week 4-5)
- [ ] Implement Phase 4 operations (breakpoints, stacktrace, stepping, frame inspection)
- [ ] Add operations to client API
- [ ] Write tests for debugging features

### Phase 6: Testing & Refactoring (Week 5-6)
- [ ] Implement Phase 5 operations (test_run, coverage, refactoring operations)
- [ ] Add operations to client API
- [ ] Write tests for testing and refactoring features

### Phase 7: BEAM Features (Week 6-7)
- [ ] Implement Phase 6 operations (hot_reload, process inspection, tracing, system_info)
- [ ] Add operations to client API
- [ ] Write tests for BEAM-specific features

### Phase 8: Advanced Features (Week 7-8)
- [ ] Implement Phase 7 operations (macroexpand, profiling, benchmarking, generation, sharing)
- [ ] Add operations to client API
- [ ] Write tests for advanced features

### Phase 9: Polish & Documentation (Week 8)
- [ ] Complete TSDoc documentation for all public APIs
- [ ] Write comprehensive README with usage examples
- [ ] Review and refactor code for consistency
- [ ] Ensure 100% test coverage for critical paths
- [ ] Performance testing and optimization
- [ ] Prepare for initial release

## Key Implementation Notes

1. **No Exceptions:** Always use `neverthrow` Result types. Never throw exceptions.

2. **Validation First:** Validate all inputs before sending to server. Reject invalid requests immediately.

3. **Type Safety:** Leverage TypeScript's type system fully. Use discriminated unions for different response types.

4. **Security:** Each operation is individually implemented and validated. No generic message forwarding.

5. **Connection Resilience:** Implement automatic reconnection with exponential backoff and jitter.

6. **Session Tracking:** Automatically track session state, making it easy for clients to manage multiple sessions.

7. **Packet Framing:** Properly handle 4-byte big-endian length prefix for all messages.

8. **Async/Await:** Use async/await consistently for all asynchronous operations.

9. **Functional Style:** Prefer pure functions, immutability, and composition over classes and mutation.

10. **Test Coverage:** Aim for high test coverage, especially for protocol encoding/decoding and connection management.

## Success Criteria

1. ✅ All 83 operations implemented with proper types and validation
2. ✅ Both TCP and UNIX socket transports working reliably
3. ✅ Automatic reconnection with exponential backoff functioning correctly
4. ✅ Session tracking working seamlessly
5. ✅ No exceptions thrown - all errors handled via Result types
6. ✅ Comprehensive TSDoc documentation for all public APIs
7. ✅ High test coverage (>80%) with passing unit and integration tests
8. ✅ Clean, idiomatic TypeScript following community best practices
9. ✅ Ready for use in VSCode extension

## Getting Started

1. **Initialize the project:**
   ```bash
   cd ~/lab/lfe/xrepl/xrepl.ts
   npm init -y
   ```

2. **Install dependencies:**
   ```bash
   npm install @msgpack/msgpack neverthrow
   npm install -D typescript tsup jest ts-jest @types/jest @types/node \
     eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
     ts-node
   ```

3. **Create configuration files** as specified above

4. **Create directory structure** as outlined in Project Structure section

5. **Begin with Phase 1** - implement foundation and core operations first

6. **Test continuously** - write tests alongside implementation

7. **Follow the implementation pattern** shown in the examples for consistency

Good luck with the implementation! This library will provide a robust, type-safe foundation for the xREPL VSCode extension.