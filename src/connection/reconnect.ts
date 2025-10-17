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

  /**
   * Get current attempt number
   */
  getAttemptCount(): number {
    return this.attempt;
  }

  /**
   * Reset the reconnection state
   */
  reset(): void {
    this.attempt = 0;
  }
}
