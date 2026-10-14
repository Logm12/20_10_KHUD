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
 * Safely retrieves recipient's photo from Vercel Private Blob or local private storage
 */
export async function getPhotoForRecipient(recipientId: string): Promise<PhotoResult | null> {
  const recipient = await getRecipientById(recipientId);
  if (!recipient) return null;

  // 1. Check if configured with remote Vercel Blob URL
  if (recipient.photoBlobPath && recipient.photoBlobPath.startsWith("http")) {
    if (!isAllowedStorageHost(recipient.photoBlobPath)) {
      console.error(`Blocked photo request to untrusted storage host: ${recipient.photoBlobPath}`);
      return null;
    }

    try {
      const headers: HeadersInit = {};
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
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
        console.warn(`Remote photo storage returned status ${res.status} for recipient ${recipientId}`);
      }
    } catch (e) {
      console.error(`Failed to fetch photo from remote storage for ${recipientId}:`, e);
    }
  }

  // 2. Check local secure private storage (girl_image / girl_photo)
  if (recipient.photoLocalFile) {
    const candidateDirs = [
      path.join(process.cwd(), "girl_image"),
      path.resolve("girl_image"),
      path.join(__dirname, "..", "..", "..", "girl_image"),
      path.join(__dirname, "..", "..", "girl_image"),
      path.join(process.cwd(), "girl_photo"),
      path.join(process.cwd(), "private_photos"),
    ];

    for (const dir of candidateDirs) {
      const localFilePath = path.join(dir, recipient.photoLocalFile);
      if (fs.existsSync(localFilePath)) {
        try {
          const buffer = fs.readFileSync(localFilePath);
          if (buffer.length > 50) {
            return {
              buffer,
              contentType: getContentType(recipient.photoLocalFile),
            };
          }
        } catch (e) {
          console.error(`Failed to read local photo file for ${recipientId}:`, e);
        }
      }
    }
  }

  return null;
}
