import { Result, ok, err } from "neverthrow";
import { Transport } from "./transport/base";
import { TcpTransport, TcpConfig } from "./transport/tcp";
import { UnixSocketTransport, UnixSocketConfig } from "./transport/unix";
import { ConnectionManager } from "./connection/manager";
import { SessionTracker } from "./session/tracker";
import { ClientError, OperationError } from "./types/errors";

// Import Phase 1 operations
import { evalCode, EvalParams } from "./operations/phase1/eval";
import { cloneSession } from "./operations/phase1/clone";
import { closeSession } from "./operations/phase1/close";
import { listSessions } from "./operations/phase1/ls-sessions";
import { ping } from "./operations/phase1/ping";
import { describe } from "./operations/phase1/describe";
import { interrupt } from "./operations/phase1/interrupt";
import { loadFile, LoadFileParams } from "./operations/phase1/load-file";

// Import types
import {
  EvalResponse,
  CloneResponse,
  CloseResponse,
  LsSessionsResponse,
  PingResponse,
  DescribeResponse,
  InterruptResponse,
  LoadFileResponse,
} from "./types/protocol";

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
  clone(
    sourceSession?: string
  ): Promise<Result<CloneResponse, OperationError>>;
  close(sessionId: string): Promise<Result<CloseResponse, OperationError>>;
  lsSessions(): Promise<Result<LsSessionsResponse, OperationError>>;
  ping(): Promise<Result<PingResponse, OperationError>>;
  describe(): Promise<Result<DescribeResponse, OperationError>>;
  interrupt(
    sessionId: string,
    interruptId?: string
  ): Promise<Result<InterruptResponse, OperationError>>;
  loadFile(
    params: LoadFileParams
  ): Promise<Result<LoadFileResponse, OperationError>>;
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
      requestTimeout: 30000,
    });

    // Create session tracker
    const sessionTracker = new SessionTracker();

    // Get token for TCP connections
    const token = config.type === "tcp" ? config.config.token : undefined;

    // Return client implementation
    return ok({
      async connect(): Promise<Result<void, ClientError>> {
        const result = await connectionManager.connect();
        if (result.isErr()) {
          return err({
            type: "client_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      async disconnect(): Promise<Result<void, ClientError>> {
        const result = await connectionManager.disconnect();
        if (result.isErr()) {
          return err({
            type: "client_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      isConnected(): boolean {
        return connectionManager.isConnected();
      },

      getActiveSession(): string | undefined {
        return sessionTracker.getActiveSession();
      },

      setActiveSession(sessionId: string): Result<void, ClientError> {
        const result = sessionTracker.setActiveSession(sessionId);
        if (result.isErr()) {
          return err({
            type: "session_error",
            message: result.error.message,
          });
        }
        return ok(undefined);
      },

      async eval(
        params: EvalParams
      ): Promise<Result<EvalResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "eval",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return evalCode(connectionManager, session, params, token);
      },

      async clone(
        sourceSession?: string
      ): Promise<Result<CloneResponse, OperationError>> {
        const result = await cloneSession(
          connectionManager,
          sourceSession,
          token
        );

        // Track the new session
        if (result.isOk()) {
          sessionTracker.addSession({
            id: result.value.new_session,
            active: true,
            created: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            namespace: result.value.namespace,
          });
        }

        return result;
      },

      async close(
        sessionId: string
      ): Promise<Result<CloseResponse, OperationError>> {
        const result = await closeSession(connectionManager, sessionId, token);

        // Remove session from tracker
        if (result.isOk()) {
          sessionTracker.removeSession(sessionId);
        }

        return result;
      },

      async lsSessions(): Promise<Result<LsSessionsResponse, OperationError>> {
        return listSessions(connectionManager, token);
      },

      async ping(): Promise<Result<PingResponse, OperationError>> {
        return ping(connectionManager, token);
      },

      async describe(): Promise<Result<DescribeResponse, OperationError>> {
        return describe(connectionManager, token);
      },

      async interrupt(
        sessionId: string,
        interruptId?: string
      ): Promise<Result<InterruptResponse, OperationError>> {
        return interrupt(connectionManager, sessionId, interruptId, token);
      },

      async loadFile(
        params: LoadFileParams
      ): Promise<Result<LoadFileResponse, OperationError>> {
        const session = sessionTracker.getActiveSession();
        if (!session) {
          return err({
            type: "operation_error",
            operation: "load-file",
            message: "No active session. Use clone() to create a new session.",
          });
        }
        return loadFile(connectionManager, session, params, token);
      },
    });
  } catch (error) {
    return err({
      type: "client_creation_error",
      message: `Failed to create client: ${error}`,
    });
  }
}
