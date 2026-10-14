import fs from "fs";
import path from "path";
import { getRecipientById } from "./recipients.server";

export interface PhotoResult {
  buffer: Buffer;
  contentType: string;
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function isAllowedStorageHost(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    // Allowlist official Vercel Blob storage domains
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".blob.vercel-storage.com") ||
        url.hostname === "blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

/**
 * Resilient file finder that handles Unicode normalization (NFC/NFD),
 * case differences, and alternative naming patterns on Linux filesystems.
 */
function findFileInDir(dir: string, targetFilename: string, recipientId: string): string | null {
  if (!fs.existsSync(dir)) return null;
  try {
    const entries = fs.readdirSync(dir);
    // 1. Direct match
    if (entries.includes(targetFilename)) {
      return path.join(dir, targetFilename);
    }
    // 2. Unicode normalized match (NFC / NFD)
    const normNFC = targetFilename.normalize("NFC").toLowerCase();
    const normNFD = targetFilename.normalize("NFD").toLowerCase();
    for (const entry of entries) {
      const entryNFC = entry.normalize("NFC").toLowerCase();
      const entryNFD = entry.normalize("NFD").toLowerCase();
      if (entryNFC === normNFC || entryNFD === normNFD) {
        return path.join(dir, entry);
      }
    }
    // 3. Match without non-alphanumeric characters (diacritics/encoding discrepancies)
    const targetClean = targetFilename.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    for (const entry of entries) {
      const entryClean = entry.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (entryClean === targetClean) {
        return path.join(dir, entry);
      }
    }
    // 4. Recipient ID prefix match (e.g. G01.jpg, G01_photo.png)
    for (const entry of entries) {
      if (entry.toLowerCase().startsWith(recipientId.toLowerCase())) {
        return path.join(dir, entry);
      }
    }
  } catch (e) {
    console.error(`[PhotoStorage] Error searching dir ${dir}:`, e);
  }
  return null;
}

/**
 * Safely retrieves recipient's photo from Vercel Private Blob or local private storage.
 * Follows defense-in-depth: attempts remote blob, then resilient local candidate locations.
 */
export async function getPhotoForRecipient(recipientId: string): Promise<PhotoResult | null> {
  const recipient = await getRecipientById(recipientId);
  if (!recipient) {
    console.warn(`[PhotoStorage] Recipient ${recipientId} not found.`);
    return null;
  }

  // 1. Check if configured with remote Vercel Blob URL
  if (recipient.photoBlobPath && recipient.photoBlobPath.startsWith("http")) {
    if (!isAllowedStorageHost(recipient.photoBlobPath)) {
      console.error(`[PhotoStorage] Blocked photo request to untrusted storage host: ${recipient.photoBlobPath}`);
      return null;
    }

    try {
      const headers: HeadersInit = {};
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(recipient.photoBlobPath, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 50) {
          const rawContentType = res.headers.get("content-type") || getContentType(recipient.photoBlobPath);
          const safeContentType = rawContentType.startsWith("image/") ? rawContentType : "image/jpeg";
          return {
            buffer,
            contentType: safeContentType,
          };
        }
      } else {
        console.warn(`[PhotoStorage] Remote photo storage returned status ${res.status} for recipient ${recipientId}`);
      }
    } catch (e) {
      console.error(`[PhotoStorage] Failed to fetch photo from remote storage for ${recipientId}:`, e);
    }
  }

  // 2. Check local secure private storage (girl_image / girl_photo)
  if (recipient.photoLocalFile) {
    const candidateDirs = [
      path.join(process.cwd(), "girl_image"),
      path.resolve("girl_image"),
      path.join(__dirname, "..", "..", "..", "..", "..", "..", "girl_image"),
      path.join(__dirname, "..", "..", "..", "..", "..", "girl_image"),
      path.join(__dirname, "..", "..", "..", "..", "girl_image"),
      path.join(__dirname, "..", "..", "..", "girl_image"),
      path.join(__dirname, "..", "..", "girl_image"),
      path.join(__dirname, "girl_image"),
      path.join(process.env.LAMBDA_TASK_ROOT || "", "girl_image"),
      path.join(process.cwd(), "girl_photo"),
      path.join(process.cwd(), "private_photos"),
    ];

    for (const dir of candidateDirs) {
      const matchedFilePath = findFileInDir(dir, recipient.photoLocalFile, recipientId);
      if (matchedFilePath) {
        try {
          const buffer = fs.readFileSync(matchedFilePath);
          if (buffer.length > 50) {
            return {
              buffer,
              contentType: getContentType(matchedFilePath),
            };
          }
        } catch (e) {
          console.error(`[PhotoStorage] Failed to read local photo file for ${recipientId}:`, e);
        }
      }
    }
  }

  console.warn(`[PhotoStorage] Photo unavailable for recipient ${recipientId} across all configured storage locations.`);
  return null;
}
