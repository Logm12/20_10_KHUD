import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  findRecipientByBirthday,
  findRecipientByInviteCode,
  toPublicGift,
  validateRecipients,
} from "../lib/recipients.server.ts";
import { hashInviteCode } from "../lib/validation.ts";

// Synthetic test fixture ensuring tests pass on clean checkouts without private credentials
const SYNTHETIC_FIXTURE = [
  {
    id: "G01",
    fullName: "Bùi Nhật Lệ",
    displayName: "Nhật Lệ",
    aliases: ["Bui Nhat Le", "Nhat Le"],
    birthDate: {
      day: 29,
      month: 1,
      year: null, // Unverified year per source of truth
    },
    accessMode: "INVITE_CODE",
    inviteCodeHash: hashInviteCode("TEST-SPECIAL-CODE-2026"),
    role: "Bí thư Liên chi đoàn",
    flower: "Cẩm tú cầu",
    theme: "Sự gắn kết và trân trọng",
    meaning: "Biểu trưng cho sự biết ơn và chân thành từ trái tim.",
    shortGreeting: "Chúc Nhật Lệ luôn rạng rỡ và hạnh phúc!",
    letter: "Gửi Nhật Lệ,\n\nĐây là bức thư tri ân chân thành dành cho người thủ lĩnh tận tâm.",
    cardVariant: "SPECIAL_LEADER",
  },
  {
    id: "G02",
    fullName: "Nguyễn Thị Hoa",
    displayName: "Thị Hoa",
    aliases: ["Nguyen Thi Hoa"],
    birthDate: {
      day: 15,
      month: 8,
      year: 2005,
    },
    accessMode: "BIRTHDAY",
    role: "Ủy viên BCH",
    flower: "Hoa Hồng",
    theme: "Nét đẹp dịu dàng",
    meaning: "Tượng trưng cho sự ấm áp và tình cảm chân thành.",
    shortGreeting: "Chúc bạn 20/10 thật nhiều niềm vui!",
    letter: "Gửi Thị Hoa,\n\nCảm ơn bạn vì đã luôn đồng hành cùng tập thể trong mọi hoạt động.",
    cardVariant: "STANDARD",
  },
  {
    id: "G03",
    fullName: "Trần Ánh Dương",
    displayName: "Ánh Dương",
    aliases: ["Tran Anh Duong"],
    birthDate: {
      day: 24,
      month: 11,
      year: 2005,
    },
    accessMode: "BOTH",
    inviteCodeHash: hashInviteCode("TEST-DUAL-CODE-2026"),
    role: "Thành viên",
    flower: "Hoa Hướng Dương",
    theme: "Năng lượng tích cực",
    meaning: "Biểu trưng cho niềm tin và sự tươi sáng.",
    shortGreeting: "Chúc bạn luôn tỏa sáng như đóa hướng dương!",
    letter: "Gửi Ánh Dương,\n\nChúc bạn luôn giữ được nụ cười tươi tắn và năng lượng rạng ngời.",
    cardVariant: "STANDARD",
  },
];

test("1. Synthetic fixture passes strict schema validation", () => {
  const validated = validateRecipients(SYNTHETIC_FIXTURE);
  assert.equal(validated.length, 3);
});

test("2. Schema validation fails on duplicate recipient IDs", () => {
  const duplicateFixture = [
    { ...SYNTHETIC_FIXTURE[0], id: "DUP01" },
    { ...SYNTHETIC_FIXTURE[1], id: "DUP01" },
  ];
  assert.throws(() => validateRecipients(duplicateFixture), /Duplicate recipient ID/);
});

test("3. Schema validation fails on invalid accessMode", () => {
  const invalidModeFixture = [{ ...SYNTHETIC_FIXTURE[0], accessMode: "INVALID_MODE" }];
  assert.throws(() => validateRecipients(invalidModeFixture), /invalid accessMode/);
});

test("4. G01 (Nhật Lệ) with year:null and INVITE_CODE CANNOT be unlocked via birthday", async () => {
  // Inject synthetic fixture into environment
  process.env.RECIPIENTS_JSON = JSON.stringify(SYNTHETIC_FIXTURE);

  // Even if user provides day 29, month 1 and an arbitrary year, birthday unlock must fail
  const birthdayMatchWithYear = await findRecipientByBirthday("Nhật Lệ", 29, 1, 1998);
  assert.equal(birthdayMatchWithYear, null, "G01 must not unlock via birthday when year is null");

  const birthdayMatchNoYear = await findRecipientByBirthday("Nhật Lệ", 29, 1, null);
  assert.equal(birthdayMatchNoYear, null, "G01 must not unlock without full verified DOB");
});

test("5. G01 unlocks successfully with valid invite code and receives SPECIAL_LEADER variant", async () => {
  process.env.RECIPIENTS_JSON = JSON.stringify(SYNTHETIC_FIXTURE);

  const matched = await findRecipientByInviteCode("Nhật Lệ", "TEST-SPECIAL-CODE-2026");
  assert.ok(matched, "Should unlock with valid invite code");
  assert.equal(matched.id, "G01");
  assert.equal(matched.cardVariant, "SPECIAL_LEADER");
  assert.equal(matched.displayName, "Nhật Lệ");

  // Invalid code fails
  const invalidMatch = await findRecipientByInviteCode("Nhật Lệ", "WRONG-CODE");
  assert.equal(invalidMatch, null);
});

test("6. G02 with accessMode BIRTHDAY unlocks with exact DOB and fails with invite code", async () => {
  process.env.RECIPIENTS_JSON = JSON.stringify(SYNTHETIC_FIXTURE);

  // Valid birthday
  const matched = await findRecipientByBirthday("Thị Hoa", 15, 8, 2005);
  assert.ok(matched);
  assert.equal(matched.id, "G02");

  // Wrong day fails
  const wrongDay = await findRecipientByBirthday("Thị Hoa", 16, 8, 2005);
  assert.equal(wrongDay, null);

  // Wrong year fails
  const wrongYear = await findRecipientByBirthday("Thị Hoa", 15, 8, 2004);
  assert.equal(wrongYear, null);

  // G02 cannot be unlocked via invite code
  const inviteMatch = await findRecipientByInviteCode("Thị Hoa", "ANY-CODE");
  assert.equal(inviteMatch, null, "BIRTHDAY-only recipient cannot unlock via invite code");
});

test("7. toPublicGift returns sanitized public fields and omits private data", () => {
  const publicGift = toPublicGift(SYNTHETIC_FIXTURE[0]);
  assert.equal(publicGift.id, "G01");
  assert.equal(publicGift.displayName, "Nhật Lệ");
  assert.equal(publicGift.cardVariant, "SPECIAL_LEADER");

  // Verify that private fields are NOT present
  assert.equal(publicGift.birthDate, undefined);
  assert.equal(publicGift.inviteCodeHash, undefined);
  assert.equal(publicGift.photoLocalFile, undefined);
});

test("8. Local private config validation (if present in environment/filesystem)", () => {
  const privateConfigPath = path.join(process.cwd(), "config", "recipients.private.json");
  if (!fs.existsSync(privateConfigPath)) {
    // Skipped gracefully on clean CI checkouts
    return;
  }

  const raw = fs.readFileSync(privateConfigPath, "utf-8");
  const recipients = JSON.parse(raw);
  assert.equal(recipients.length, 10, "Private config must have exactly 10 recipients");

  // Verify G01 status in private config
  const g01 = recipients.find((r) => r.id === "G01");
  assert.ok(g01);
  assert.equal(g01.birthDate.year, null, "G01 birth year must be null until verified");
  assert.equal(g01.accessMode, "INVITE_CODE", "G01 must use INVITE_CODE access mode");
  assert.equal(g01.cardVariant, "SPECIAL_LEADER");
});
