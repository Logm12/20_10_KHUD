import crypto from "crypto";
import { RecipientConfig } from "../types/recipient";

/**
 * Remove Vietnamese accents and convert to lowercase for alias comparison
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Clean and normalize names
 */
export function normalizeName(name: string): string {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Validate Gregorian calendar date
 */
export function isValidDate(day: number, month: number, year: number | null): boolean {
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

  // Without year
  const maxDays = month === 2 ? 29 : daysInMonths[month - 1];
  return day <= maxDays;
}

/**
 * Hash secret code using SHA-256
 */
export function hashInviteCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Check if the input name strictly matches a recipient
 * Prevents ambiguous one-word matches like "Huyền"
 */
export function isNameMatch(recipient: RecipientConfig, inputName: string): boolean {
  const cleanedInput = normalizeName(inputName);
  if (!cleanedInput) return false;

  // Reject single ambiguous words that are common substrings
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

    // Compare with accents removed
    const strippedInput = removeVietnameseAccents(cleanedInput);
    const strippedTarget = removeVietnameseAccents(cleanedTarget);
    if (strippedInput === strippedTarget) return true;
  }

  return false;
}
