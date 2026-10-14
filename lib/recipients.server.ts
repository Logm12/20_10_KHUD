import fs from "fs";
import path from "path";
import { RecipientConfig, RecipientPublicGift } from "@/types/recipient";
import { isNameMatch, hashInviteCode } from "./validation";

// Safe sample fallback if no secret config exists (e.g. initial public build / CI)
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

export async function getAllRecipients(): Promise<RecipientConfig[]> {
  if (cachedRecipients) return cachedRecipients;

  // 1. Try environment variable RECIPIENTS_JSON
  const envData = process.env.RECIPIENTS_JSON;
  if (envData) {
    try {
      let rawJson = envData;
      // Handle base64 encoded JSON string if used
      if (!envData.trim().startsWith("[")) {
        try {
          rawJson = Buffer.from(envData, "base64").toString("utf-8");
        } catch {
          // Keep raw
        }
      }
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRecipients = parsed;
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse RECIPIENTS_JSON environment variable", e);
    }
  }

  // 2. Try private gitignored configuration file
  const privateFilePath = path.join(process.cwd(), "config", "recipients.private.json");
  if (fs.existsSync(privateFilePath)) {
    try {
      const fileData = fs.readFileSync(privateFilePath, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRecipients = parsed;
        return parsed;
      }
    } catch (e) {
      console.error("Failed to read private recipients file", e);
    }
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
    // 1. Check if name matches
    if (!isNameMatch(recipient, name)) continue;

    // 2. Verify full birthday match
    // If recipient's year is null or unverified (like Nhật Lệ), normal birthday match requires verified full DOB
    if (recipient.birthDate.year === null || year === null) {
      // Missing year: Cannot match through standard birthday flow if full DOB is unverified
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
    if (!isNameMatch(recipient, name)) continue;

    // Check invite code
    if (recipient.inviteCodeHash && recipient.inviteCodeHash.toLowerCase() === inputHash.toLowerCase()) {
      return recipient;
    }

    // Also support fallback SPECIAL_LEADER_CODE from env for Nhật Lệ
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
