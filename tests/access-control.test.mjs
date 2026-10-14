import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

const TEST_SECRET = "test-secret-key-for-session-management-12345";

function createSessionToken(recipientId, secret = TEST_SECRET) {
  const payload = {
    recipientId,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token, secret = TEST_SECRET) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

test("1. Valid session token successfully verifies and extracts recipient ID", () => {
  const token = createSessionToken("G01");
  const verified = verifySessionToken(token);
  assert.ok(verified);
  assert.equal(verified.recipientId, "G01");
});

test("2. Tampered token signature fails verification", () => {
  const token = createSessionToken("G01");
  const tamperedToken = token.slice(0, -4) + "abcd";
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
  const expiredPayload = { recipientId: "G01", iat: Date.now() - 10000, exp: Date.now() - 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TEST_SECRET).update(payloadB64).digest("base64url");
  const expiredToken = `${payloadB64}.${signature}`;

  const verified = verifySessionToken(expiredToken);
  assert.equal(verified, null);
});
