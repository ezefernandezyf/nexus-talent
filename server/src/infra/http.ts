import { createHmac, timingSafeEqual } from "node:crypto";

// ── Utilities ───────────────────────────────────────────────

function base64urlEncode(data: Buffer): string {
  return data
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str: string): Buffer {
  let normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return Buffer.from(normalized, "base64");
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration format: "${duration}"`);
  const value = parseInt(match[1], 10);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3_600,
    d: 86_400,
  };
  return value * multipliers[unit];
}

// ── Sign ─────────────────────────────────────────────────────

/**
 * Create an HS256 JWT using Node's built-in crypto.
 * No `jsonwebtoken` dependency required.
 *
 * @param payload  - Claims to embed in the token.
 * @param secret   - HMAC secret key.
 * @param expiresIn - Optional duration string, e.g. "7d", "15m", "1h".
 * @returns The signed JWT string (header.payload.signature).
 */
export function sign(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn?: string,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = expiresIn ? iat + parseDuration(expiresIn) : undefined;

  const tokenPayload = {
    ...payload,
    iat,
    ...(exp !== undefined ? { exp } : {}),
  };

  const headerEncoded = base64urlEncode(Buffer.from(JSON.stringify(header)));
  const payloadEncoded = base64urlEncode(Buffer.from(JSON.stringify(tokenPayload)));

  const signature = createHmac("sha256", secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest();

  return `${headerEncoded}.${payloadEncoded}.${base64urlEncode(signature)}`;
}

// ── Verify ───────────────────────────────────────────────────

/**
 * Verify and decode an HS256 JWT.
 *
 * @param token  - The JWT string to verify.
 * @param secret - HMAC secret key.
 * @returns The decoded payload, or `null` if the token is invalid or expired.
 */
export function verify(
  token: string,
  secret: string,
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

    // Re-compute the expected signature
    const expectedSignature = createHmac("sha256", secret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest();

    const actualSignature = base64urlDecode(signatureEncoded);

    if (actualSignature.length !== expectedSignature.length) return null;
    if (!timingSafeEqual(actualSignature, expectedSignature)) return null;

    // Decode and parse payload
    const payloadStr = base64urlDecode(payloadEncoded).toString("utf-8");
    const payload = JSON.parse(payloadStr) as Record<string, unknown>;

    // Expiry check
    if (typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── Express Request Augmentation ─────────────────────────────

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
