import test from "node:test";
import assert from "node:assert/strict";

// Re-implement or import validation functions in ESM
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

function isValidDate(day, month, year) {
  if (!Number.isInteger(day) || !Number.isInteger(month)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year !== null) {
    if (!Number.isInteger(year) || year < 1970 || year > 2030) return false;
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const maxDays = month === 2 && isLeapYear ? 29 : daysInMonths[month - 1];
    return day <= maxDays;
  }

  const maxDays = month === 2 ? 29 : daysInMonths[month - 1];
  return day <= maxDays;
}

function isNameMatch(recipient, inputName) {
  const cleanedInput = normalizeName(inputName);
  if (!cleanedInput) return false;

  const ambiguousWords = ["huyen", "huyền", "le", "lệ", "chi", "phuong", "phương", "quynh", "quỳnh", "trang", "anh", "duong", "dương"];
  if (ambiguousWords.includes(cleanedInput)) {
    return false;
  }

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

test("1. normalizeName trims extra spaces and lowercases", () => {
  assert.equal(normalizeName("  Thị   Huyền  "), "thị huyền");
  assert.equal(normalizeName("BÙI NHẬT LỆ"), "bùi nhật lệ");
});

test("2. Ambiguous one-word name 'Huyền' is rejected", () => {
  const recipient = { displayName: "Thị Huyền", fullName: "Trần Thị Huyền", aliases: [] };
  assert.equal(isNameMatch(recipient, "Huyền"), false);
  assert.equal(isNameMatch(recipient, "huyen"), false);
});

test("3. 'Thị Huyền' does NOT match 'Thanh Huyền' or 'Khánh Huyền'", () => {
  const g02 = { id: "G02", displayName: "Thị Huyền", fullName: "Trần Thị Huyền", aliases: ["Tran Thi Huyen"] };
  const g03 = { id: "G03", displayName: "Thanh Huyền", fullName: "Nguyễn Thị Thanh Huyền", aliases: ["Nguyen Thi Thanh Huyen"] };
  const g10 = { id: "G10", displayName: "Khánh Huyền", fullName: "Đặng Phương Khánh Huyền", aliases: ["Dang Phuong Khanh Huyen"] };

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
});
