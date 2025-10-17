# xREPL Protocol Specification for VSCode Extension

## Message Format

All messages use MessagePack encoding with a 4-byte big-endian length prefix (packet: 4 mode).

### Authentication
- **TCP connections**: Require a `token` field in all messages
- **UNIX domain sockets**: Pre-authenticated via file permissions (no token needed)

## Core Message Structure

### Request Format
```typescript
interface XReplRequest {
  id: string;           // Message ID (e.g., "msg-0", "msg-1")
  op: string;           // Operation name
  token?: string;       // Auth token (TCP only)
  [key: string]: any;   // Operation-specific fields
}
```

### Response Format
```typescript
interface XReplResponse {
  id: string;                              // Echoed from request
  status: "done" | "error" | "ping";
  [key: string]: any;                      // Operation-specific fields
}
```

## Supported Operations

### 1. `eval` - Evaluate Code

**Request:**
```typescript
{
  op: "eval",
  code: string,
  session?: string  // Optional session ID
}
```

**Response Types:**

#### a) Normal Value Response
```typescript
{
  status: "done",
  value: string,        // Formatted result
  session: string       // Session ID
}
```

#### b) Session Switch Response
When user switches to a specific session via command:
```typescript
{
  status: "done",
  action: "switch",
  session: string       // New session ID to switch to
}
```

**VSCode behavior:** Switch active REPL panel/context to the specified session.

#### c) Switch to Other Session
When user toggles between sessions (Alt+Tab-like behavior):
```typescript
{
  status: "done",
  action: "switch-to-other"
}
```

**VSCode behavior:** Toggle to the most recently used session (maintain MRU stack).

#### d) Formatted Output Response
For commands that produce pre-formatted output (help text, listings, etc.):
```typescript
{
  status: "done",
  formatted: string,    // Pre-formatted text (not eval result)
  session: string
}
```

**VSCode behavior:** Display in output channel or REPL view without additional formatting.

### 2. `clone` - Create New Session

**Request:**
```typescript
{
  op: "clone",
  session?: string  // Optional: session to clone from
}
```

**Response:**
```typescript
{
  status: "done",
  new_session: string  // ID of newly created session
}
```

**VSCode behavior:** Create new REPL panel/tab for the session.

### 3. `close` - Close Session

**Request:**
```typescript
{
  op: "close",
  session?: string  // Optional: specific session to close
}
```

**Response:**
```typescript
{
  status: "done"
}
```

**Note:** Sessions are stopped but metadata is preserved for reopening.

**VSCode behavior:** Close REPL panel but keep session in history/sidebar for reopening.

### 4. `ls_sessions` - List Sessions

**Request:**
```typescript
{
  op: "ls_sessions"
}
```

**Response:**
```typescript
{
  status: "done",
  sessions: Array<{
    id: string,
    active: boolean,
    created_at: string  // ISO timestamp
  }>
}
```

**VSCode behavior:** Populate session list in sidebar/tree view.

### 5. `describe` - Server Capabilities

**Request:**
```typescript
{
  op: "describe"
}
```

**Response:**
```typescript
{
  status: "done",
  versions: {
    xrepl: string,
    erlang?: string,
    // ... other version info
  },
  ops: string[],        // Supported operations
  transports: string[]  // Supported transports (stdio, tcp, unix)
}
```

**VSCode behavior:** Cache capabilities, enable/disable features based on supported ops.

### 6. `ping` - Keepalive

**Request:**
```typescript
{
  op: "ping"
}
```

**Response:**
```typescript
{
  status: "done",
  pong: true,
  timestamp: number  // Server timestamp
}
```

**VSCode behavior:** Use for connection health checks, display connection status.

### 7. `upload_history` - Sync Client History

**Request:**
```typescript
{
  op: "upload_history",
  commands: string[],   // Array of command strings
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  uploaded: number  // Number of commands uploaded
}
```

**VSCode behavior:** Sync local command history to server periodically or on session switch.

### 8. Error Response (Any Operation)

```typescript
{
  status: "error",
  error: {
    type: string,      // Error type (atom from server)
    message: string    // Human-readable error message
  }
}
```

**VSCode behavior:** Display error in REPL output, show error decoration in editor if applicable.

---

## Proposed New Operations (To Be Implemented)

### 9. `format` - Format Code

**Request:**
```typescript
{
  op: "format",
  code: string,
  options?: {
    indent_width?: number,
    max_line_length?: number,
    style?: "compact" | "expanded"
  }
}
```

**Response:**
```typescript
{
  status: "done",
  formatted: string  // Formatted code
}
```

**VSCode behavior:** Replace selection/document with formatted code. Integrate with VSCode's format command.

### 10. `complete` - Code Completion

**Request:**
```typescript
{
  op: "complete",
  code: string,
  position: number,     // Cursor position in code string
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  completions: Array<{
    text: string,
    type: "function" | "variable" | "module" | "macro" | "keyword",
    documentation?: string,
    detail?: string,        // Type signature or brief description
    insert_text?: string,   // Text to insert (may differ from display text)
    sort_text?: string      // For ordering completions
  }>
}
```

**VSCode behavior:** Provide IntelliSense completions via `CompletionItemProvider`.

### 11. `doc` - Documentation Lookup

**Request:**
```typescript
{
  op: "doc",
  symbol: string,
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  documentation: {
    signature?: string,      // Function signature
    description: string,     // Full documentation
    examples?: string[],     // Usage examples
    source_url?: string      // Link to source/docs
  }
}
```

**VSCode behavior:** Show hover documentation, support "Go to Documentation" command.

### 12. `signature` - Signature Help

**Request:**
```typescript
{
  op: "signature",
  code: string,
  position: number,
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  signatures: Array<{
    label: string,           // Full signature display
    parameters: Array<{
      label: string,         // Parameter name
      documentation?: string
    }>,
    active_parameter?: number,
    documentation?: string
  }>
}
```

**VSCode behavior:** Show signature help while typing function calls.

### 13. `definition` - Jump to Definition

**Request:**
```typescript
{
  op: "definition",
  symbol: string,
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  locations: Array<{
    file: string,      // File path
    line: number,
    column: number,
    end_line?: number,
    end_column?: number
  }>
}
```

**VSCode behavior:** Enable F12 "Go to Definition" functionality.

### 14. `references` - Find References

**Request:**
```typescript
{
  op: "references",
  symbol: string,
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  references: Array<{
    file: string,
    line: number,
    column: number,
    context?: string   // Surrounding code context
  }>
}
```

**VSCode behavior:** Populate references panel, support "Find All References".

### 15. `interrupt` - Interrupt Running Code

**Request:**
```typescript
{
  op: "interrupt",
  session?: string
}
```

**Response:**
```typescript
{
  status: "done",
  interrupted: boolean
}
```

**VSCode behavior:** Provide "Stop" button in REPL panel, keyboard shortcut for interrupt.

### 16. `eval_stream` - Streaming Evaluation

**Request:**
```typescript
{
  op: "eval_stream",
  code: string,
  session?: string
}
```

**Response (multiple messages):**
```typescript
// Intermediate output
{
  id: string,
  status: "streaming",
  output: string,    // Partial output/stdout
  stream: "stdout" | "stderr"
}

// Final result
{
  id: string,
  status: "done",
  value: string,
  session: string
}
```

**VSCode behavior:** Stream output to REPL panel in real-time for long-running evaluations.

### 17. `workspace_symbols` - Workspace Symbol Search

**Request:**
```typescript
{
  op: "workspace_symbols",
  query: string,
  limit?: number
}
```

**Response:**
```typescript
{
  status: "done",
  symbols: Array<{
    name: string,
    type: "function" | "variable" | "module" | "macro",
    file: string,
    line: number,
    column: number,
    container?: string  // Parent module/namespace
  }>
}
```

**VSCode behavior:** Support Ctrl+T workspace symbol search.

---

## Session Management

### Session Lifecycle
1. Sessions persist in `xrepl-store` with metadata
2. `close` stops the process but preserves metadata
3. Sessions can be reopened
4. Each session maintains independent history

### Session Properties
- **ID**: Unique identifier
- **Transport type**: `stdio`, `tcp`, or `unix`
- **Active status**: Running or stopped
- **Creation timestamp**: ISO datetime
- **Command history**: Per-session history buffer

---

## VSCode Extension Integration Points

### Required Features
- **Connection management**: Connect to existing xrepl or spawn new instance
- **Session tree view**: Display and manage multiple sessions
- **REPL panel**: Interactive terminal-like interface
- **Send to REPL**: Commands to send selection/file to active session
- **Output channel**: Display formatted results and errors

### Enhanced Features (with new ops)
- **IntelliSense**: Completions and signature help
- **Hover documentation**: Symbol documentation on hover
- **Go to definition**: F12 navigation
- **Format document**: Ctrl+Shift+I formatting
- **Streaming output**: Real-time feedback for long operations
- **Interrupt execution**: Stop button for runaway code
- **Symbol search**: Workspace-wide symbol navigation

### UI Components
- **Session sidebar**: Tree view of active/stopped sessions
- **REPL webview**: Rich interactive REPL with history
- **Status bar item**: Show active session and connection status
- **Inline decorations**: Show evaluation results inline in editor
- **History view**: Browse and re-execute past commands