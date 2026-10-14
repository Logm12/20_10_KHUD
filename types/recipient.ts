export type CardVariant = "STANDARD" | "SPECIAL_LEADER";
export type AccessMode = "BIRTHDAY" | "INVITE_CODE" | "BOTH";

export interface RecipientBirthDate {
  day: number;
  month: number;
  year: number | null;
}

export interface RecipientConfig {
  id: string; // e.g. G01..G10
  fullName: string;
  displayName: string;
  aliases: string[];
  birthDate: RecipientBirthDate;
  accessMode: AccessMode;
  inviteCodeHash?: string; // SHA-256 hex string of code
  role: string;
  flower: string;
  flowerScientific?: string;
  theme: string;
  meaning: string;
  shortGreeting: string;
  letter: string;
  photoLocalFile?: string; // Name of file in girl_image for private storage preparation
  photoBlobPath?: string; // Vercel Blob store url/path
  cardVariant: CardVariant;
}

export interface RecipientPublicGift {
  id: string;
  displayName: string;
  flower: string;
  theme: string;
  meaning: string;
  shortGreeting: string;
  letter: string;
  role: string;
  cardVariant: CardVariant;
  hasPhoto: boolean;
}
