# xREPL TypeScript Client

TypeScript client library for the xREPL protocol, enabling communication with LFE (Lisp Flavored Erlang) language servers using MessagePack over TCP or UNIX domain sockets.

## Features

- ✅ **Type-Safe**: Full TypeScript support with strict typing
- ✅ **Error Handling**: Uses `neverthrow` Result types - no exceptions thrown
- ✅ **Dual Transport**: Supports both TCP and UNIX socket connections
- ✅ **Auto-Reconnect**: Automatic reconnection with exponential backoff
- ✅ **Session Management**: Built-in session tracking and management
- ✅ **Phase 1 Operations**: All core REPL operations implemented
  - `eval` - Evaluate LFE code
  - `clone` - Create/clone sessions
  - `close` - Close sessions
  - `ls-sessions` - List active sessions
  - `ping` - Health check
  - `describe` - Server capabilities
  - `interrupt` - Interrupt running evaluations
  - `load-file` - Load and evaluate files
- ✅ **Phase 2 Operations**: All code intelligence operations implemented
  - `complete` - Code completion
  - `signature` - Function signature help
  - `eldoc` - Expression documentation
  - `doc` - Full symbol documentation
  - `find-definition` - Go to definition
  - `find-references` - Find all references
  - `list-definitions` - Document symbols
  - `format` - Code formatting
- ✅ **Phase 3 Operations**: All compilation & building operations implemented
  - `compile-file` - Compile single files
  - `compile-project` - Compile entire projects
  - `lint` - Lint code without compilation
  - `buffer-analysis` - Analyze code buffers
- ✅ **Phase 5 Operations**: All debugging operations implemented
  - `set-breakpoint` - Set breakpoints in code
  - `clear-breakpoint` - Clear/remove breakpoints
  - `list-breakpoints` - List all active breakpoints
  - `stacktrace` - Get current stack trace
  - `step` - Step through code execution (into/over/out)
  - `inspect-locals` - Inspect local variables
  - `eval-in-frame` - Evaluate expressions in stack frames
- ✅ **Phase 6 Operations**: All testing & refactoring operations implemented
  - `test-run` - Run tests
  - `test-coverage` - Get test coverage information
  - `test-rerun-failures` - Rerun only failed tests
  - `rename-symbol` - Rename symbols across codebase
  - `extract-function` - Extract code into new function
  - `inline-function` - Inline function calls
- ✅ **Phase 7 Operations**: All BEAM-specific operations implemented
  - `hot-reload` - Hot reload code modules
  - `list-processes` - List all BEAM processes
  - `inspect-process` - Inspect specific BEAM process
  - `trace-calls` - Trace function calls
  - `system-info` - Get BEAM system information
  - `observer-data` - Get data for observer/monitoring tools
- ✅ **Phase 8 Operations**: All advanced features implemented
  - `macroexpand` - Expand macros in code
  - `macroexpand-all` - Expand all macros recursively
  - `profile-start` - Start profiling
  - `profile-stop` - Stop profiling and get results
  - `benchmark` - Benchmark code execution
  - `workspace-symbols` - Search symbols across workspace
  - `generate-function` - AI-powered function generation
  - `generate-tests` - AI-powered test case generation
  - `suggest-improvements` - AI-powered code improvement suggestions
  - `snippets` - Retrieve code snippets and templates
  - `share-session` - Share sessions for collaboration
  - `restore-session` - Restore shared sessions

## Installation

```bash
npm install @xrepl/client
```

## Quick Start

### TCP Connection

```typescript
import { createClient } from "@xrepl/client";

// Create a TCP client
const clientResult = createClient({
  type: "tcp",
  config: {
    host: "localhost",
    port: 50123,
    token: "your-auth-token",
  },
});

if (clientResult.isErr()) {
  console.error("Failed to create client:", clientResult.error);
  process.exit(1);
}

const client = clientResult.value;

// Connect to server
const connectResult = await client.connect();
if (connectResult.isErr()) {
  console.error("Connection failed:", connectResult.error);
  process.exit(1);
}

// Create a new session
const cloneResult = await client.clone();
if (cloneResult.isErr()) {
  console.error("Failed to create session:", cloneResult.error);
  process.exit(1);
}

console.log("Session created:", cloneResult.value.new_session);

// Evaluate some code
const evalResult = await client.eval({ code: "(+ 1 2)" });
evalResult.match(
  (response) => console.log("Result:", response.value),
  (error) => console.error("Eval error:", error)
);

// Disconnect
await client.disconnect();
```

### UNIX Socket Connection

```typescript
import { createClient } from "@xrepl/client";

const clientResult = createClient({
  type: "unix",
  config: {
    socketPath: "/tmp/xrepl.sock",
  },
});

// Use the client same as TCP example above
```

## API Documentation

### Client Creation

#### `createClient(config: XReplClientConfig): Result<XReplClient, ClientError>`

Creates a new xREPL client instance.

**Parameters:**
- `config` - Client configuration (TCP or UNIX socket)

**Returns:**
- `Result<XReplClient, ClientError>` - Result containing client or error

### Connection Management

#### `connect(): Promise<Result<void, ClientError>>`

Connect to the xREPL server.

#### `disconnect(): Promise<Result<void, ClientError>>`

Disconnect from the xREPL server.

#### `isConnected(): boolean`

Check if currently connected to server.

### Session Management

#### `getActiveSession(): string | undefined`

Get the ID of the currently active session.

#### `setActiveSession(sessionId: string): Result<void, ClientError>`

Set the active session for subsequent operations.

### Core Operations

#### `eval(params: EvalParams): Promise<Result<EvalResponse, OperationError>>`

Evaluate LFE code in the active session.

**Example:**
```typescript
const result = await client.eval({
  code: "(+ 1 2)",
  file: "repl.lfe",  // optional
  line: 1,           // optional
  column: 1,         // optional
});
```

#### `clone(sourceSession?: string): Promise<Result<CloneResponse, OperationError>>`

Create a new session or clone an existing one.

**Example:**
```typescript
// Create new session
const result = await client.clone();

// Clone existing session
const result = await client.clone(existingSessionId);
```

#### `close(sessionId: string): Promise<Result<CloseResponse, OperationError>>`

Close a session.

**Example:**
```typescript
await client.close(sessionId);
```

#### `lsSessions(): Promise<Result<LsSessionsResponse, OperationError>>`

List all active sessions.

**Example:**
```typescript
const result = await client.lsSessions();
result.map(response => {
  console.log("Active sessions:", response.sessions);
});
```

#### `ping(): Promise<Result<PingResponse, OperationError>>`

Health check - verify server is responding.

**Example:**
```typescript
const result = await client.ping();
```

#### `describe(): Promise<Result<DescribeResponse, OperationError>>`

Get server capabilities and version information.

**Example:**
```typescript
const result = await client.describe();
result.map(response => {
  console.log("xREPL version:", response.versions?.xrepl);
  console.log("Supported operations:", response.ops);
});
```

#### `interrupt(sessionId: string, interruptId?: string): Promise<Result<InterruptResponse, OperationError>>`

Interrupt a running evaluation.

**Example:**
```typescript
await client.interrupt(sessionId);
```

#### `loadFile(params: LoadFileParams): Promise<Result<LoadFileResponse, OperationError>>`

Load and evaluate an entire file.

**Example:**
```typescript
// Load from disk
const result = await client.loadFile({
  file: "/path/to/file.lfe"
});

// Load with provided content
const result = await client.loadFile({
  file: "buffer.lfe",
  content: "(defun hello () 'world)"
});
```

### Code Intelligence Operations

#### `complete(params: CompleteParams): Promise<Result<CompleteResponse, OperationError>>`

Get code completion suggestions.

**Example:**
```typescript
const result = await client.complete({
  prefix: "def",
  context: "(defun hello () ",
  line: 1,
  column: 15
});

result.map(response => {
  response.completions.forEach(item => {
    console.log(`${item.candidate} (${item.type})`);
  });
});
```

#### `signature(params: SignatureParams): Promise<Result<SignatureResponse, OperationError>>`

Get function signature help.

**Example:**
```typescript
const result = await client.signature({
  symbol: "map",
  context: "(map "
});

result.map(response => {
  response.signatures.forEach(sig => {
    console.log(`Signature: ${sig.label}`);
  });
});
```

#### `eldoc(params: EldocParams): Promise<Result<EldocResponse, OperationError>>`

Get expression documentation (eldoc-style).

**Example:**
```typescript
const result = await client.eldoc({
  symbol: "lists:map"
});

result.map(response => {
  console.log(`${response.name}: ${response.arglists?.join(", ")}`);
});
```

#### `doc(params: DocParams): Promise<Result<DocResponse, OperationError>>`

Get full documentation for a symbol.

**Example:**
```typescript
const result = await client.doc({
  symbol: "lists:map"
});

result.map(response => {
  console.log("Documentation:", response.doc);
  console.log("Arglists:", response.arglists);
});
```

#### `findDefinition(params: FindDefinitionParams): Promise<Result<FindDefinitionResponse, OperationError>>`

Find definition location(s) for a symbol (go-to-definition).

**Example:**
```typescript
const result = await client.findDefinition({
  symbol: "my-function"
});

result.map(response => {
  response.definitions.forEach(def => {
    console.log(`Definition at ${def.file}:${def.line}`);
  });
});
```

#### `findReferences(params: FindReferencesParams): Promise<Result<FindReferencesResponse, OperationError>>`

Find all references to a symbol.

**Example:**
```typescript
const result = await client.findReferences({
  symbol: "my-function",
  includeDeclaration: true
});

result.map(response => {
  console.log(`Found ${response.references.length} references`);
});
```

#### `listDefinitions(params: ListDefinitionsParams): Promise<Result<ListDefinitionsResponse, OperationError>>`

List all definitions in a file or namespace (document symbols).

**Example:**
```typescript
// List definitions in a file
const result = await client.listDefinitions({
  file: "/path/to/file.lfe"
});

// Or by namespace
const result = await client.listDefinitions({
  namespace: "my-module"
});

result.map(response => {
  response.definitions.forEach(def => {
    console.log(`${def.type}: ${def.name} at ${def.location.file}:${def.location.line}`);
  });
});
```

#### `format(params: FormatParams): Promise<Result<FormatResponse, OperationError>>`

Format LFE code.

**Example:**
```typescript
const result = await client.format({
  code: "(defun hello()    'world)",
  file: "buffer.lfe"
});

result.map(response => {
  if (response.formatted) {
    console.log("Formatted:", response.formatted);
  }
});
```

### Debugging Operations

#### `setBreakpoint(params: SetBreakpointParams): Promise<Result<SetBreakpointResponse, OperationError>>`

Set a breakpoint in code.

**Example:**
```typescript
const result = await client.setBreakpoint({
  file: "/path/to/file.lfe",
  line: 42,
  condition: "(> x 100)"  // optional
});

result.map(response => {
  console.log(`Breakpoint set: ${response.breakpoint_id}`);
  console.log(`Location: ${response.breakpoint.file}:${response.breakpoint.line}`);
});
```

#### `clearBreakpoint(params: ClearBreakpointParams): Promise<Result<ClearBreakpointResponse, OperationError>>`

Clear/remove a breakpoint.

**Example:**
```typescript
const result = await client.clearBreakpoint({
  breakpoint_id: "bp-001"
});

result.map(response => {
  if (response.cleared) {
    console.log("Breakpoint cleared");
  }
});
```

#### `listBreakpoints(): Promise<Result<ListBreakpointsResponse, OperationError>>`

List all active breakpoints.

**Example:**
```typescript
const result = await client.listBreakpoints();

result.map(response => {
  console.log(`Active breakpoints: ${response.breakpoints.length}`);
  response.breakpoints.forEach(bp => {
    console.log(`  ${bp.id}: ${bp.file}:${bp.line}`);
  });
});
```

#### `stacktrace(params: StacktraceParams): Promise<Result<StacktraceResponse, OperationError>>`

Get current stack trace.

**Example:**
```typescript
const result = await client.stacktrace({
  thread_id: "main"  // optional
});

result.map(response => {
  console.log("Stack trace:");
  response.frames.forEach((frame, i) => {
    console.log(`  ${i}: ${frame.module}:${frame.function}/${frame.arity}`);
    console.log(`     ${frame.file}:${frame.line}`);
  });
});
```

#### `step(params: StepParams): Promise<Result<StepResponse, OperationError>>`

Step through code execution.

**Example:**
```typescript
// Step into function
const result = await client.step({
  type: "into"
});

// Step over 3 lines
const result = await client.step({
  type: "over",
  count: 3
});

result.map(response => {
  if (response.stopped_at) {
    console.log(`Stopped at: ${response.stopped_at.file}:${response.stopped_at.line}`);
  }
});
```

#### `inspectLocals(params: InspectLocalsParams): Promise<Result<InspectLocalsResponse, OperationError>>`

Inspect local variables in current or specific stack frame.

**Example:**
```typescript
// Inspect current frame
const result = await client.inspectLocals({});

// Inspect specific frame
const result = await client.inspectLocals({
  frame_id: 2
});

result.map(response => {
  console.log("Local variables:");
  response.locals.forEach(local => {
    console.log(`  ${local.name} = ${local.value}`);
  });
});
```

#### `evalInFrame(params: EvalInFrameParams): Promise<Result<EvalInFrameResponse, OperationError>>`

Evaluate expression in specific stack frame.

**Example:**
```typescript
// Eval in current frame
const result = await client.evalInFrame({
  code: "x"
});

// Eval in specific frame
const result = await client.evalInFrame({
  code: "(+ x 10)",
  frame_id: 2
});

result.map(response => {
  if (response.value) {
    console.log(`Result: ${response.value}`);
  }
});
```

## Error Handling

This library uses the `neverthrow` library for type-safe error handling. All operations return `Result<T, E>` types instead of throwing exceptions.

```typescript
const result = await client.eval({ code: "(+ 1 2)" });

// Pattern matching
result.match(
  (response) => {
    console.log("Success:", response.value);
  },
  (error) => {
    console.error("Error:", error.message);
  }
);

// Or check directly
if (result.isOk()) {
  console.log("Value:", result.value);
} else {
  console.error("Error:", result.error);
}
```

## Configuration

### TCP Configuration

```typescript
type TcpConfig = {
  host: string;              // Server hostname
  port: number;              // Server port
  token: string;             // Authentication token
  timeout?: number;          // Connection timeout (default: 5000ms)
  autoReconnect?: boolean;   // Enable auto-reconnect (default: true)
  maxReconnectAttempts?: number;  // Max reconnection attempts (default: 10)
}
```

### UNIX Socket Configuration

```typescript
type UnixSocketConfig = {
  socketPath: string;        // Path to UNIX socket
  timeout?: number;          // Connection timeout (default: 5000ms)
  autoReconnect?: boolean;   // Enable auto-reconnect (default: true)
  maxReconnectAttempts?: number;  // Max reconnection attempts (default: 10)
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Linting

```bash
# Check for issues
npm run lint

# Fix issues
npm run lint:fix
```

### Type Checking

```bash
npm run typecheck
```

## Architecture

The library follows a functional, type-safe design:

- **Transport Layer**: Abstract interface with TCP and UNIX socket implementations
- **Codec Layer**: MessagePack encoding/decoding with 4-byte big-endian length prefix
- **Connection Manager**: Handles connection lifecycle, reconnection, and health monitoring
- **Session Tracker**: Tracks active sessions and their state
- **Operations**: Individual functions for each protocol operation
- **Client API**: High-level client interface that coordinates all components

## Roadmap

- ✅ Phase 1: Core REPL operations
- ✅ Phase 2: Code Intelligence (completion, signature help, documentation)
- ✅ Phase 3: Compilation & Building (compile, lint, analysis)
- ✅ Phase 4: CI/CD
- ✅ Phase 5: Debugging (breakpoints, stepping, inspection)
- ✅ Phase 6: Testing & Refactoring (test running, coverage, refactoring)
- ✅ Phase 7: BEAM-Specific (hot reload, processes, tracing, system info)
- ✅ Phase 8: Advanced Features (macroexpansion, profiling, benchmarking)

## Contributing

Contributions are welcome! Please see the implementation guide in `docs/design/xrepl-ts-implementation-prompt.md` for detailed information about the architecture and contribution guidelines.

## License

Apache-2.0

## Links

- [xREPL Protocol Specification](https://github.com/xrepl/xrepl)
- [GitHub Repository](https://github.com/xrepl/xrepl.ts)
- [Issue Tracker](https://github.com/xrepl/xrepl.ts/issues)
