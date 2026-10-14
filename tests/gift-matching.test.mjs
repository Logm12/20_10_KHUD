import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const recipients = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config", "recipients.private.json"), "utf-8")
);

function removeVietnameseAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeName(name) {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function isNameMatch(recipient, inputName) {
  const cleanedInput = normalizeName(inputName);
  if (!cleanedInput) return false;

  const ambiguousWords = ["huyen", "huyền", "le", "lệ", "chi", "phuong", "phương", "quynh", "quỳnh", "trang", "anh", "duong", "dương"];
  if (ambiguousWords.includes(cleanedInput)) return false;

  const validTargets = [
    recipient.displayName,
    recipient.fullName,
    ...(recipient.aliases || []),
  ];

  for (const target of validTargets) {
    const cleanedTarget = normalizeName(target);
    if (cleanedInput === cleanedTarget) return true;

    const strippedInput = removeVietnameseAccents(cleanedInput);
    const strippedTarget = removeVietnameseAccents(cleanedTarget);
    if (strippedInput === strippedTarget) return true;
  }

  return false;
}

function findRecipientByBirthday(name, day, month, year) {
  for (const r of recipients) {
    if (!isNameMatch(r, name)) continue;
    if (r.birthDate.year === null || year === null) continue;
    if (r.birthDate.day === day && r.birthDate.month === month && r.birthDate.year === year) {
      return r;
    }
  }
  return null;
}

function hashInviteCode(code) {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function findRecipientByInviteCode(name, code) {
  const inputHash = hashInviteCode(code);
  for (const r of recipients) {
    if (!isNameMatch(r, name)) continue;
    if (r.inviteCodeHash && r.inviteCodeHash.toLowerCase() === inputHash.toLowerCase()) {
      return r;
    }
  }
  return null;
}

test("1. All 10 recipients unlock with exact name and verified DOB", () => {
  assert.equal(recipients.length, 10);

  for (const r of recipients) {
    const matched = findRecipientByBirthday(r.displayName, r.birthDate.day, r.birthDate.month, r.birthDate.year);
    assert.ok(matched, `Recipient ${r.displayName} should match with DOB ${r.birthDate.day}/${r.birthDate.month}/${r.birthDate.year}`);
    assert.equal(matched.id, r.id);
  }
});

test("2. Incorrect birth year fails to unlock", () => {
  const g02 = recipients.find((r) => r.id === "G02");
  const matched = findRecipientByBirthday(g02.displayName, g02.birthDate.day, g02.birthDate.month, 1990); // Intentionally wrong year
  assert.equal(matched, null);

  const g01 = recipients.find((r) => r.id === "G01");
  const matchedLeWrongYear = findRecipientByBirthday(g01.displayName, g01.birthDate.day, g01.birthDate.month, 1990); // Intentionally wrong year
  assert.equal(matchedLeWrongYear, null);
});

test("3. Incorrect birth day or month fails to unlock", () => {
  const g03 = recipients.find((r) => r.id === "G03");
  const wrongDay = g03.birthDate.day === 1 ? 2 : 1;
  const matchedDay = findRecipientByBirthday(g03.displayName, wrongDay, g03.birthDate.month, g03.birthDate.year);
  assert.equal(matchedDay, null);

  const g04 = recipients.find((r) => r.id === "G04");
  const wrongMonth = g04.birthDate.month === 1 ? 2 : 1;
  const matchedMonth = findRecipientByBirthday(g04.displayName, g04.birthDate.day, wrongMonth, g04.birthDate.year);
  assert.equal(matchedMonth, null);
});

test("4. Bùi Nhật Lệ successfully unlocks with verified full DOB", () => {
  const g01 = recipients.find((r) => r.id === "G01");
  const matched = findRecipientByBirthday(g01.displayName, g01.birthDate.day, g01.birthDate.month, g01.birthDate.year);
  assert.ok(matched, "Nhật Lệ should match with verified birth date");
  assert.equal(matched.id, "G01");
  assert.equal(matched.cardVariant, "SPECIAL_LEADER");
});

test("5. Bùi Nhật Lệ also supports unlock via invite code (dual access mode)", () => {
  const g01 = recipients.find((r) => r.id === "G01");
  const inviteCode = process.env.SPECIAL_LEADER_CODE || "BLOOM-NL2026-KHUD";
  const matched = findRecipientByInviteCode(g01.displayName, inviteCode);
  assert.ok(matched, "Should unlock with invite code");
  assert.equal(matched.id, "G01");
  assert.equal(matched.cardVariant, "SPECIAL_LEADER");
});

test("6. All 10 personalized letters are distinct and non-empty", () => {
  const letterSet = new Set();
  assert.equal(recipients.length, 10);

  for (const r of recipients) {
    assert.ok(r.letter && r.letter.length > 50, `Letter for ${r.displayName} must be substantial`);
    assert.ok(!letterSet.has(r.letter), `Letter for ${r.displayName} must be unique`);
    letterSet.add(r.letter);
  }
});
