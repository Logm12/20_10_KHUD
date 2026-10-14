import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bloom_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

let devSecretFallback: string | null = null;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL: SESSION_SECRET is not configured or lacks sufficient entropy (minimum 32 chars required) in production. Failing closed."
      );
    }
    // In development or test, generate an in-memory random secret per runtime
    if (!devSecretFallback) {
      devSecretFallback = crypto.randomBytes(32).toString("hex");
      console.warn("⚠️ Warning: SESSION_SECRET not set in non-production. Generated ephemeral in-memory secret.");
    }
    return devSecretFallback;
  }
  return secret.trim();
}

export interface SessionPayload {
  recipientId: string;
  iat: number;
  exp: number;
}

/**
 * Validates that the session payload adheres to expected schema and ranges
 */
export function isValidSessionPayload(payload: any): payload is SessionPayload {
  if (!payload || typeof payload !== "object") return false;
  const { recipientId, iat, exp } = payload;

  if (typeof recipientId !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(recipientId)) {
    return false;
  }

  const now = Date.now();
  if (typeof iat !== "number" || !Number.isFinite(iat) || iat > now + 60000 || iat < now - SESSION_DURATION_MS - 86400000) {
    return false;
  }

  if (typeof exp !== "number" || !Number.isFinite(exp) || exp <= now || exp > iat + SESSION_DURATION_MS + 60000) {
    return false;
  }

  return true;
}

/**
 * Sign session payload with HMAC SHA-256
 */
export function createSessionToken(recipientId: string): string {
  const secret = getSessionSecret();
  const payload: SessionPayload = {
    recipientId,
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify session token, validate schema, signature, and check expiration
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  try {
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    // Constant-time comparison with length check
    const sigBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const rawPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (!isValidSessionPayload(rawPayload)) {
      return null;
    }

    return rawPayload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie on current response
 */
export async function setRecipientSession(recipientId: string): Promise<string> {
  const token = createSessionToken(recipientId);
  const cookieStore = cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return token;
}

/**
 * Clear recipient session cookie (for logout / "Đổi người")
 */
export async function clearRecipientSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Get recipient ID from active session cookie
 */
export async function getSessionRecipientId(): Promise<string | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const session = verifySessionToken(cookie.value);
  return session ? session.recipientId : null;
}

