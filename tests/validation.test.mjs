import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeName,
  isValidDate,
  isNameMatch,
  removeVietnameseAccents,
  hashInviteCode,
} from "../lib/validation.ts";

test("1. normalizeName trims extra spaces and lowercases", () => {
  assert.equal(normalizeName("  Thị   Huyền  "), "thị huyền");
  assert.equal(normalizeName("BÙI NHẬT LỆ"), "bùi nhật lệ");
  assert.equal(normalizeName(""), "");
});

test("2. Ambiguous one-word name 'Huyền' is rejected", () => {
  const recipient = {
    id: "TEST01",
    displayName: "Thị Huyền",
    fullName: "Trần Thị Huyền",
    aliases: [],
    birthDate: { day: 1, month: 1, year: 2000 },
    accessMode: "BIRTHDAY",
    role: "Member",
    flower: "Rose",
    theme: "Theme",
    meaning: "Meaning",
    shortGreeting: "Greeting",
    letter: "Letter",
    cardVariant: "STANDARD",
  };
  assert.equal(isNameMatch(recipient, "Huyền"), false);
  assert.equal(isNameMatch(recipient, "huyen"), false);
});

test("3. 'Thị Huyền' does NOT match 'Thanh Huyền' or 'Khánh Huyền'", () => {
  const g02 = {
    id: "G02",
    displayName: "Thị Huyền",
    fullName: "Trần Thị Huyền",
    aliases: ["Tran Thi Huyen"],
    birthDate: { day: 1, month: 1, year: 2000 },
    accessMode: "BIRTHDAY",
    role: "Member",
    flower: "Rose",
    theme: "Theme",
    meaning: "Meaning",
    shortGreeting: "Greeting",
    letter: "Letter",
    cardVariant: "STANDARD",
  };
  const g03 = {
    id: "G03",
    displayName: "Thanh Huyền",
    fullName: "Nguyễn Thị Thanh Huyền",
    aliases: ["Nguyen Thi Thanh Huyen"],
    birthDate: { day: 2, month: 2, year: 2000 },
    accessMode: "BIRTHDAY",
    role: "Member",
    flower: "Rose",
    theme: "Theme",
    meaning: "Meaning",
    shortGreeting: "Greeting",
    letter: "Letter",
    cardVariant: "STANDARD",
  };
  const g10 = {
    id: "G10",
    displayName: "Khánh Huyền",
    fullName: "Đặng Phương Khánh Huyền",
    aliases: ["Dang Phuong Khanh Huyen"],
    birthDate: { day: 3, month: 3, year: 2000 },
    accessMode: "BIRTHDAY",
    role: "Member",
    flower: "Rose",
    theme: "Theme",
    meaning: "Meaning",
    shortGreeting: "Greeting",
    letter: "Letter",
    cardVariant: "STANDARD",
  };

  assert.equal(isNameMatch(g02, "Thị Huyền"), true);
  assert.equal(isNameMatch(g02, "Thanh Huyền"), false);
  assert.equal(isNameMatch(g02, "Khánh Huyền"), false);

  assert.equal(isNameMatch(g03, "Thanh Huyền"), true);
  assert.equal(isNameMatch(g03, "Thị Huyền"), false);

  assert.equal(isNameMatch(g10, "Khánh Huyền"), true);
  assert.equal(isNameMatch(g10, "Thị Huyền"), false);
});

test("4. Gregorian calendar validation handles leap years and invalid dates", () => {
  // Valid dates
  assert.equal(isValidDate(29, 2, 2004), true); // Leap year 2004
  assert.equal(isValidDate(27, 10, 2006), true);

  // Invalid dates
  assert.equal(isValidDate(29, 2, 2006), false); // 2006 is NOT a leap year
  assert.equal(isValidDate(31, 4, 2006), false); // April has 30 days
  assert.equal(isValidDate(32, 1, 2006), false); // Jan has 31 days
  assert.equal(isValidDate(0, 5, 2006), false);
  assert.equal(isValidDate(15, 13, 2006), false); // Month 13 invalid
  assert.equal(isValidDate(15, 0, 2006), false); // Month 0 invalid
});

test("5. removeVietnameseAccents normalizes accents correctly", () => {
  assert.equal(removeVietnameseAccents("Nguyễn Thị Thanh Huyền"), "Nguyen Thi Thanh Huyen");
  assert.equal(removeVietnameseAccents("Đặng Phương"), "Dang Phuong");
});

test("6. hashInviteCode produces consistent SHA-256 hex string", () => {
  const hash1 = hashInviteCode("bloom-test-code");
  const hash2 = hashInviteCode("  BLOOM-TEST-CODE  ");
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});
