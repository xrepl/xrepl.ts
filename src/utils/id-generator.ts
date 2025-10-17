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
