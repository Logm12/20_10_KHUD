import http from "node:http";
import next from "next";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const recipients = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config", "recipients.private.json"), "utf-8")
);

async function runE2ETests() {
  console.log("Starting Next.js test server...");
  const app = next({ dev: false, dir: process.cwd() });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => server.listen(3001, resolve));
  const baseUrl = "http://localhost:3001";
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Test homepage GET /
    console.log("1. Testing GET /...");
    const homeRes = await fetch(`${baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes("The Secret Bloom"), "HTML contains title");
    assert.ok(homeHtml.includes("20.10.2026"), "HTML contains date");
    console.log("   ✅ GET / passed (200 OK)");

    // 2. Test GET /api/me/photo without session cookie
    console.log("2. Testing GET /api/me/photo without authentication...");
    const unauthPhotoRes = await fetch(`${baseUrl}/api/me/photo`);
    assert.equal(unauthPhotoRes.status, 401);
    console.log("   ✅ Protected photo returns 401 Unauthorized without session");

    const g02 = recipients.find((r) => r.id === "G02");
    const g01 = recipients.find((r) => r.id === "G01");

    // 3. Test POST /api/unlock with wrong year
    console.log("3. Testing POST /api/unlock with wrong year...");
    const wrongDobRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: g02.displayName,
        mode: "BIRTHDAY",
        birthDay: g02.birthDate.day,
        birthMonth: g02.birthDate.month,
        birthYear: 1990, // Intentionally wrong year
      }),
    });
    assert.equal(wrongDobRes.status, 400);
    const wrongDobJson = await wrongDobRes.json();
    assert.equal(wrongDobJson.success, false);
    assert.ok(wrongDobJson.message.includes("chưa tìm được đúng người"), "Generic friendly error returned");
    console.log("   ✅ Incorrect DOB safely returns 400 generic error");

    // 4. Test POST /api/unlock with valid DOB
    console.log("4. Testing POST /api/unlock with correct DOB...");
    const validDobRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: g02.displayName,
        mode: "BIRTHDAY",
        birthDay: g02.birthDate.day,
        birthMonth: g02.birthDate.month,
        birthYear: g02.birthDate.year,
      }),
    });
    assert.equal(validDobRes.status, 200);

    // Verify Cache-Control is private and no-store (A08)
    const unlockCacheControl = validDobRes.headers.get("cache-control");
    assert.ok(unlockCacheControl?.includes("private"), "Cache-Control must be private");
    assert.ok(unlockCacheControl?.includes("no-store"), "Cache-Control must be no-store");

    const validJson = await validDobRes.json();
    assert.equal(validJson.success, true);
    assert.equal(validJson.gift.displayName, g02.displayName);
    assert.equal(validJson.gift.flower, g02.flower);
    assert.equal(validJson.gift.cardVariant, "STANDARD");

    // Extract session cookie
    const setCookieHeader = validDobRes.headers.get("set-cookie");
    assert.ok(setCookieHeader, "Session cookie bloom_session is returned");
    assert.ok(setCookieHeader.includes("bloom_session="), "Cookie name is bloom_session");
    assert.ok(setCookieHeader.includes("HttpOnly"), "Cookie is HttpOnly");
    const cookieValue = setCookieHeader.split(";")[0];
    console.log("   ✅ Correct DOB unlocks gift and issues signed HttpOnly cookie (with private no-store headers)");

    // 5. Test GET /api/me/gift with session cookie
    console.log("5. Testing GET /api/me/gift with session cookie...");
    const meGiftRes = await fetch(`${baseUrl}/api/me/gift`, {
      headers: { Cookie: cookieValue },
    });
    assert.equal(meGiftRes.status, 200);
    const giftCacheControl = meGiftRes.headers.get("cache-control");
    assert.ok(giftCacheControl?.includes("private"), "Gift Cache-Control must be private");
    assert.ok(giftCacheControl?.includes("no-store"), "Gift Cache-Control must be no-store");

    const meGiftJson = await meGiftRes.json();
    assert.equal(meGiftJson.authenticated, true);
    assert.equal(meGiftJson.gift.displayName, g02.displayName);
    console.log("   ✅ Session allows retrieving opened gift on page reload");

    // 6. Test GET /api/me/photo with session cookie
    console.log("6. Testing GET /api/me/photo with session cookie...");
    const authPhotoRes = await fetch(`${baseUrl}/api/me/photo`, {
      headers: { Cookie: cookieValue },
    });
    assert.equal(authPhotoRes.status, 200);
    const contentType = authPhotoRes.headers.get("content-type");
    assert.ok(contentType?.startsWith("image/"), `Photo returned with image content-type (${contentType})`);
    const photoBuffer = await authPhotoRes.arrayBuffer();
    assert.ok(photoBuffer.byteLength > 1000, "Photo buffer is non-empty");
    console.log(`   ✅ Authorized photo streamed successfully (${photoBuffer.byteLength} bytes)`);

    // 7. Test Special Invite Code for Bùi Nhật Lệ (G01) from environment
    if (process.env.SPECIAL_LEADER_CODE) {
      console.log("7. Testing POST /api/unlock for Bùi Nhật Lệ with invite code from env...");
      const leRes = await fetch(`${baseUrl}/api/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: g01.displayName,
          mode: "INVITE_CODE",
          inviteCode: process.env.SPECIAL_LEADER_CODE,
        }),
      });
      assert.equal(leRes.status, 200);
      const leJson = await leRes.json();
      assert.equal(leJson.success, true);
      assert.equal(leJson.gift.displayName, g01.displayName);
      assert.equal(leJson.gift.cardVariant, "SPECIAL_LEADER");
      console.log("   ✅ Special Leader unlock succeeds with valid invite code");
    }

    // 8. Test Birthday Unlock for Bùi Nhật Lệ (A04: must FAIL when year is unverified)
    console.log("8. Testing POST /api/unlock for Bùi Nhật Lệ with unverified birthday (must fail closed)...");
    const leDobRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: g01.displayName,
        mode: "BIRTHDAY",
        birthDay: 29,
        birthMonth: 1,
        birthYear: 1998,
      }),
    });
    assert.equal(leDobRes.status, 400);
    const leDobJson = await leDobRes.json();
    assert.equal(leDobJson.success, false);
    console.log("   ✅ Bùi Nhật Lệ birthday unlock correctly rejected while year is unverified");

    // 9. Test POST /api/me/reset (A13)
    console.log("9. Testing POST /api/me/reset clears session cookie...");
    const resetRes = await fetch(`${baseUrl}/api/me/reset`, {
      method: "POST",
      headers: { Cookie: cookieValue },
    });
    assert.equal(resetRes.status, 200);
    const resetCookieHeader = resetRes.headers.get("set-cookie");
    assert.ok(resetCookieHeader?.includes("bloom_session="), "Reset returns bloom_session cookie header");
    assert.ok(resetCookieHeader?.includes("Max-Age=0") || resetCookieHeader?.includes("1970"), "Cookie cleared");
    console.log("   ✅ Server reset successfully clears recipient session cookie");

    console.log("\n🎉 ALL E2E INTEGRATION TESTS PASSED PERFECTLY!");
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
