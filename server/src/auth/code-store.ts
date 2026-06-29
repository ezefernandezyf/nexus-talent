import { randomBytes } from "node:crypto";

export const CODE_TTL_MS = 60_000;

const CLEANUP_INTERVAL_MS = 30_000;

interface CodeEntry {
  jwt: string;
  expiresAt: number;
}

/**
 * In-memory one-time code store for OAuth code exchange.
 *
 * Stores JWT values behind 64-hex-char codes with a 60s TTL.
 * Single-use: `get()` deletes the entry on first access.
 * Periodic cleanup via `setInterval().unref()` to purge expired entries.
 *
 * Pattern matches `rate-limiter.ts` (Map + setInterval cleanup).
 */
export class CodeStore {
  private store = new Map<string, CodeEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Store a JWT and return a one-time code.
   *
   * @param jwt       - The JWT string to protect.
   * @param ttlMs     - Time-to-live in ms (default: 60_000). Pass a negative
   *                    value for test-expired entries.
   * @returns The 64-hex-char one-time code.
   */
  set(jwt: string, ttlMs: number = CODE_TTL_MS): string {
    this.startCleanup();
    const code = randomBytes(32).toString("hex");
    this.store.set(code, { jwt, expiresAt: Date.now() + ttlMs });
    return code;
  }

  /**
   * Retrieve and delete a JWT by code.
   *
   * @param code - The one-time code.
   * @returns The JWT string, or `null` if the code is unknown or expired.
   */
  get(code: string): string | null {
    const entry = this.store.get(code);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(code);
      return null;
    }
    this.store.delete(code); // single-use
    return entry.jwt;
  }

  /**
   * Start the periodic cleanup interval.
   * Uses `.unref()` so it does not block process exit.
   * Called automatically on first `set()`. Safe to call multiple times.
   */
  startCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => this.sweep(), CLEANUP_INTERVAL_MS);
    this.cleanupTimer.unref();
  }

  /**
   * Stop the periodic cleanup interval.
   * Used in tests to prevent dangling timers.
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Manually purge expired entries.
   * Exposed for testing; the cleanup interval calls this automatically.
   */
  sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

/** Singleton code store instance used across the auth module. */
export const codeStore = new CodeStore();
