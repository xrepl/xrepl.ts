import { Result, ok, err } from "neverthrow";

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
    // If this is the first session, make it active
    if (!this.activeSession) {
      this.activeSession = info.id;
    }
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
      // Set active session to any remaining session
      const remainingSessions = Array.from(this.sessions.keys());
      this.activeSession = remainingSessions[0];
    }
  }

  /**
   * Get all tracked sessions
   */
  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get a specific session
   */
  getSession(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session info
   */
  updateSession(sessionId: string, updates: Partial<SessionInfo>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  /**
   * Check if a session exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
