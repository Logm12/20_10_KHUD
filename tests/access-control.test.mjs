import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  createSessionToken,
  verifySessionToken,
  getSessionSecret,
  isValidSessionPayload,
} from "../lib/session.server.ts";
import { checkRateLimit, resetRateLimits } from "../lib/rate-limiter.server.ts";

test("1. Valid session token successfully creates and verifies with real implementation", () => {
  const token = createSessionToken("G01");
  const verified = verifySessionToken(token);
  assert.ok(verified, "Token must be valid");
  assert.equal(verified.recipientId, "G01");
  assert.ok(verified.exp > Date.now());
});

test("2. Tampered token signature fails verification", () => {
  const token = createSessionToken("G01");
  const [payloadB64] = token.split(".");
  const tamperedToken = `${payloadB64}.${"a".repeat(43)}`;
  const verified = verifySessionToken(tamperedToken);
  assert.equal(verified, null);
});

test("3. Tampered payload with forged recipient ID fails signature check", () => {
  const token = createSessionToken("G01");
  const [, signature] = token.split(".");
  const fakePayload = { recipientId: "G02", iat: Date.now(), exp: Date.now() + 60000 };
  const fakePayloadB64 = Buffer.from(JSON.stringify(fakePayload)).toString("base64url");
  const forgedToken = `${fakePayloadB64}.${signature}`;

  const verified = verifySessionToken(forgedToken);
  assert.equal(verified, null);
});

test("4. Expired token is rejected", () => {
  const expiredPayload = { recipientId: "G01", iat: Date.now() - 100000, exp: Date.now() - 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
  const secret = getSessionSecret();
  const signature = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const expiredToken = `${payloadB64}.${signature}`;

  const verified = verifySessionToken(expiredToken);
  assert.equal(verified, null);
});

test("5. Malformed payload structure is rejected by isValidSessionPayload", () => {
  assert.equal(isValidSessionPayload(null), false);
  assert.equal(isValidSessionPayload({}), false);
  assert.equal(isValidSessionPayload({ recipientId: "" }), false);
  assert.equal(isValidSessionPayload({ recipientId: "G01", iat: "not-a-number", exp: Date.now() + 1000 }), false);
  assert.equal(isValidSessionPayload({ recipientId: "G01", iat: Date.now(), exp: Date.now() - 1000 }), false);
});

test("6. getSessionSecret fails closed in production when missing or short", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.SESSION_SECRET;

  try {
    process.env.NODE_ENV = "production";
    delete process.env.SESSION_SECRET;

    assert.throws(
      () => {
        getSessionSecret();
      },
      /CRITICAL: SESSION_SECRET is not configured/
    );

    // Also fails if secret is too short (< 32 chars)
    process.env.SESSION_SECRET = "too-short";
    assert.throws(
      () => {
        getSessionSecret();
      },
      /CRITICAL: SESSION_SECRET is not configured/
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalSecret) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  }
});

test("7. Rate limiter enforces maximum attempts and returns retry-after", () => {
  resetRateLimits();
  const testId = "test-ip-127.0.0.1";

  // First 10 requests should succeed
  for (let i = 0; i < 10; i++) {
    const res = checkRateLimit(testId, 10, 60000);
    assert.equal(res.allowed, true);
  }

  // 11th request should be blocked
  const blocked = checkRateLimit(testId, 10, 60000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0 && blocked.retryAfterSeconds <= 60);

  // Different IP should still be allowed
  const otherIp = checkRateLimit("test-ip-192.168.1.1", 10, 60000);
  assert.equal(otherIp.allowed, true);
});
