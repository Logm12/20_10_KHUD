import http from "node:http";
import next from "next";
import assert from "node:assert/strict";

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

    // 3. Test POST /api/unlock with invalid DOB
    console.log("3. Testing POST /api/unlock with wrong year...");
    const wrongDobRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: "Thị Huyền",
        mode: "BIRTHDAY",
        birthDay: 27,
        birthMonth: 10,
        birthYear: 2000, // Wrong year
      }),
    });
    assert.equal(wrongDobRes.status, 400);
    const wrongDobJson = await wrongDobRes.json();
    assert.equal(wrongDobJson.success, false);
    assert.ok(wrongDobJson.message.includes("chưa tìm được đúng người"), "Generic friendly error returned");
    console.log("   ✅ Incorrect DOB safely returns 400 generic error");

    // 4. Test POST /api/unlock with valid DOB (G02: Thị Huyền)
    console.log("4. Testing POST /api/unlock with correct DOB...");
    const validDobRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: "Thị Huyền",
        mode: "BIRTHDAY",
        birthDay: 27,
        birthMonth: 10,
        birthYear: 2006,
      }),
    });
    assert.equal(validDobRes.status, 200);
    const validJson = await validDobRes.json();
    assert.equal(validJson.success, true);
    assert.equal(validJson.gift.displayName, "Thị Huyền");
    assert.equal(validJson.gift.flower, "Cúc họa mi");
    assert.equal(validJson.gift.cardVariant, "STANDARD");

    // Extract session cookie
    const setCookieHeader = validDobRes.headers.get("set-cookie");
    assert.ok(setCookieHeader, "Session cookie bloom_session is returned");
    assert.ok(setCookieHeader.includes("bloom_session="), "Cookie name is bloom_session");
    assert.ok(setCookieHeader.includes("HttpOnly"), "Cookie is HttpOnly");
    const cookieValue = setCookieHeader.split(";")[0];
    console.log("   ✅ Correct DOB unlocks gift and issues signed HttpOnly cookie");

    // 5. Test GET /api/me/gift with session cookie
    console.log("5. Testing GET /api/me/gift with session cookie...");
    const meGiftRes = await fetch(`${baseUrl}/api/me/gift`, {
      headers: { Cookie: cookieValue },
    });
    assert.equal(meGiftRes.status, 200);
    const meGiftJson = await meGiftRes.json();
    assert.equal(meGiftJson.authenticated, true);
    assert.equal(meGiftJson.gift.displayName, "Thị Huyền");
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

    // 7. Test Special Invite Code for Bùi Nhật Lệ (G01)
    console.log("7. Testing POST /api/unlock for Bùi Nhật Lệ with invite code...");
    const leRes = await fetch(`${baseUrl}/api/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: "Nhật Lệ",
        mode: "INVITE_CODE",
        inviteCode: "BLOOM-NL2026-KHUD",
      }),
    });
    assert.equal(leRes.status, 200);
    const leJson = await leRes.json();
    assert.equal(leJson.success, true);
    assert.equal(leJson.gift.displayName, "Nhật Lệ");
    assert.equal(leJson.gift.cardVariant, "SPECIAL_LEADER");
    assert.equal(leJson.gift.flower, "Cẩm tú cầu");
    console.log("   ✅ Special Leader unlock succeeds with invite code");

    console.log("\n🎉 ALL E2E INTEGRATION TESTS PASSED PERFECTLY!");
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
