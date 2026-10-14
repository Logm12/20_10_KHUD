import fs from "fs";
import path from "path";
import { RecipientConfig, RecipientPublicGift } from "../types/recipient";
import { isNameMatch, hashInviteCode } from "./validation";

// Safe sample fallback strictly for isolated test/dev environments without private configuration
const FALLBACK_RECIPIENTS: RecipientConfig[] = [
  {
    id: "DEMO01",
    fullName: "Ví Dụ Mẫu",
    displayName: "Ví Dụ",
    aliases: ["Vi Du"],
    birthDate: { day: 20, month: 10, year: 2006 },
    accessMode: "BIRTHDAY",
    role: "Khách mời",
    flower: "Cẩm tú cầu",
    theme: "Sự gắn kết và trân trọng",
    meaning: "Biểu trưng cho sự biết ơn và chân thành từ trái tim.",
    shortGreeting: "Chúc bạn luôn tràn đầy niềm vui và sự dịu dàng trong ngày 20/10!",
    letter: "Gửi bạn, một ngày 20/10 thật nhiều niềm vui và an lành. Cảm ơn vì đã luôn mang lại nguồn năng lượng tươi sáng cho mọi người xung quanh.",
    cardVariant: "STANDARD",
  },
];

let cachedRecipients: RecipientConfig[] | null = null;

export function clearRecipientsCache(): void {
  cachedRecipients = null;
}

export function validateRecipients(list: any[]): RecipientConfig[] {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Invalid recipients configuration: expected non-empty array.");
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (!r || typeof r !== "object") {
      throw new Error(`Invalid recipient item at index ${i}`);
    }

    if (!r.id || typeof r.id !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(r.id)) {
      throw new Error(`Recipient at index ${i} has invalid ID: ${r.id}`);
    }

    if (seenIds.has(r.id)) {
      throw new Error(`Duplicate recipient ID found: ${r.id}`);
    }
    seenIds.add(r.id);

    if (!r.fullName || typeof r.fullName !== "string") {
      throw new Error(`Recipient ${r.id} missing valid fullName`);
    }

    if (!r.displayName || typeof r.displayName !== "string") {
      throw new Error(`Recipient ${r.id} missing valid displayName`);
    }

    if (
      !r.birthDate ||
      typeof r.birthDate !== "object" ||
      typeof r.birthDate.day !== "number" ||
      typeof r.birthDate.month !== "number" ||
      r.birthDate.day < 1 ||
      r.birthDate.day > 31 ||
      r.birthDate.month < 1 ||
      r.birthDate.month > 12
    ) {
      throw new Error(`Recipient ${r.id} has invalid birthDate`);
    }

    if (r.birthDate.year !== null && typeof r.birthDate.year !== "number") {
      throw new Error(`Recipient ${r.id} birthDate.year must be number or null`);
    }

    const validModes = ["BIRTHDAY", "INVITE_CODE", "BOTH"];
    if (!r.accessMode || !validModes.includes(r.accessMode)) {
      throw new Error(`Recipient ${r.id} has invalid accessMode: ${r.accessMode}`);
    }

    if (!r.flower || !r.theme || !r.meaning || !r.letter) {
      throw new Error(`Recipient ${r.id} missing required content fields`);
    }

    const validCardVariants = ["STANDARD", "SPECIAL_LEADER"];
    if (r.cardVariant && !validCardVariants.includes(r.cardVariant)) {
      throw new Error(`Recipient ${r.id} has invalid cardVariant: ${r.cardVariant}`);
    }
  }

  return list as RecipientConfig[];
}

export async function getAllRecipients(): Promise<RecipientConfig[]> {
  if (cachedRecipients) return cachedRecipients;

  // 1. Try environment variable RECIPIENTS_JSON
  const envData = process.env.RECIPIENTS_JSON;
  if (envData) {
    try {
      let rawJson = envData;
      if (!envData.trim().startsWith("[")) {
        try {
          rawJson = Buffer.from(envData, "base64").toString("utf-8");
        } catch {
          // Keep raw
        }
      }
      const parsed = JSON.parse(rawJson);
      const validated = validateRecipients(parsed);
      cachedRecipients = validated;
      return validated;
    } catch (e) {
      console.error("Failed to parse/validate RECIPIENTS_JSON environment variable", e);
      if (process.env.NODE_ENV === "production") {
        throw new Error("Production error: Failed to parse valid RECIPIENTS_JSON. Failing closed.");
      }
    }
  }

  // 2. Try private gitignored configuration file
  const privateFilePath = path.join(process.cwd(), "config", "recipients.private.json");
  if (fs.existsSync(privateFilePath)) {
    try {
      const fileData = fs.readFileSync(privateFilePath, "utf-8");
      const parsed = JSON.parse(fileData);
      const validated = validateRecipients(parsed);
      cachedRecipients = validated;
      return validated;
    } catch (e) {
      console.error("Failed to read/validate private recipients file", e);
      if (process.env.NODE_ENV === "production") {
        throw new Error("Production error: Failed to validate config/recipients.private.json. Failing closed.");
      }
    }
  }

  // Fail-closed in production: Never serve fallback demo recipients
  if (process.env.NODE_ENV === "production") {
    throw new Error("Production error: No valid recipient configuration available. Failing closed.");
  }

  return FALLBACK_RECIPIENTS;
}

export async function getRecipientById(id: string): Promise<RecipientConfig | null> {
  const recipients = await getAllRecipients();
  return recipients.find((r) => r.id === id) || null;
}

export async function findRecipientByBirthday(
  name: string,
  day: number,
  month: number,
  year: number | null
): Promise<RecipientConfig | null> {
  const recipients = await getAllRecipients();

  for (const recipient of recipients) {
    // 1. Enforce accessMode: if INVITE_CODE only, do not allow birthday unlock
    if (recipient.accessMode === "INVITE_CODE") {
      continue;
    }

    // 2. Check if name matches
    if (!isNameMatch(recipient, name)) continue;

    // 3. Verify full birthday match
    // If recipient's year is null or unverified (like Nhật Lệ), standard birthday flow must not match
    if (recipient.birthDate.year === null || year === null) {
      continue;
    }

    if (
      recipient.birthDate.day === day &&
      recipient.birthDate.month === month &&
      recipient.birthDate.year === year
    ) {
      return recipient;
    }
  }

  return null;
}

export async function findRecipientByInviteCode(
  name: string,
  code: string
): Promise<RecipientConfig | null> {
  if (!code || !code.trim()) return null;
  const recipients = await getAllRecipients();
  const inputHash = hashInviteCode(code);

  for (const recipient of recipients) {
    // 1. Enforce accessMode: if BIRTHDAY only, do not allow invite code unlock
    if (recipient.accessMode === "BIRTHDAY") {
      continue;
    }

    if (!isNameMatch(recipient, name)) continue;

    // 2. Check invite code hash configured on recipient
    if (recipient.inviteCodeHash && recipient.inviteCodeHash.toLowerCase() === inputHash.toLowerCase()) {
      return recipient;
    }

    // 3. Check fallback SPECIAL_LEADER_CODE from environment for special leader
    if (recipient.cardVariant === "SPECIAL_LEADER" && process.env.SPECIAL_LEADER_CODE) {
      const envLeaderHash = hashInviteCode(process.env.SPECIAL_LEADER_CODE);
      if (envLeaderHash.toLowerCase() === inputHash.toLowerCase()) {
        return recipient;
      }
    }
  }

  return null;
}

export function toPublicGift(recipient: RecipientConfig): RecipientPublicGift {
  return {
    id: recipient.id,
    displayName: recipient.displayName,
    flower: recipient.flower,
    theme: recipient.theme,
    meaning: recipient.meaning,
    shortGreeting: recipient.shortGreeting,
    letter: recipient.letter,
    role: recipient.role,
    cardVariant: recipient.cardVariant,
    hasPhoto: Boolean(recipient.photoBlobPath || recipient.photoLocalFile),
  };
}
