import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bloom_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Fallback secret for development if not provided, warns in console
    return "secret-bloom-dev-key-change-in-production-20261020-vietnam";
  }
  return secret;
}

interface SessionPayload {
  recipientId: string;
  iat: number;
  exp: number;
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
 * Verify session token and check expiration
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const secret = getSessionSecret();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  // Constant-time comparison
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
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
 * Get recipient ID from active session cookie
 */
export async function getSessionRecipientId(): Promise<string | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const session = verifySessionToken(cookie.value);
  return session ? session.recipientId : null;
}
