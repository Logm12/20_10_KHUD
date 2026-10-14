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

test("1. All 9 standard recipients unlock with exact name and verified DOB", () => {
  const standardRecipients = recipients.filter((r) => r.birthDate.year !== null);
  assert.equal(standardRecipients.length, 9);

  for (const r of standardRecipients) {
    const matched = findRecipientByBirthday(r.displayName, r.birthDate.day, r.birthDate.month, r.birthDate.year);
    assert.ok(matched, `Recipient ${r.displayName} should match`);
    assert.equal(matched.id, r.id);
  }
});

test("2. Incorrect birth year fails to unlock", () => {
  const matched = findRecipientByBirthday("Thị Huyền", 27, 10, 2005); // Real year is 2006
  assert.equal(matched, null);
});

test("3. Incorrect birth day or month fails to unlock", () => {
  const matchedDay = findRecipientByBirthday("Thanh Huyền", 28, 9, 2005); // Real day is 29
  assert.equal(matchedDay, null);

  const matchedMonth = findRecipientByBirthday("Mai Anh", 16, 10, 2006); // Real month is 11
  assert.equal(matchedMonth, null);
});

test("4. Bùi Nhật Lệ fails standard birthday flow safely due to unverified DOB", () => {
  const matched = findRecipientByBirthday("Nhật Lệ", 29, 1, 2006);
  assert.equal(matched, null, "Should not match unverified birthday without confirmed year");
});

test("5. Bùi Nhật Lệ successfully unlocks using secure invite code", () => {
  const matched = findRecipientByInviteCode("Nhật Lệ", "BLOOM-NL2026-KHUD");
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
