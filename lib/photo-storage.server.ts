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

/**
 * Safely retrieves recipient's photo from Vercel Blob or local private storage
 */
export async function getPhotoForRecipient(recipientId: string): Promise<PhotoResult | null> {
  const recipient = await getRecipientById(recipientId);
  if (!recipient) return null;

  // 1. Check if configured with remote Vercel Blob URL
  if (recipient.photoBlobPath && recipient.photoBlobPath.startsWith("http")) {
    try {
      const headers: HeadersInit = {};
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
      }
      const res = await fetch(recipient.photoBlobPath, { headers });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          contentType: res.headers.get("content-type") || getContentType(recipient.photoBlobPath),
        };
      }
    } catch (e) {
      console.error("Failed to fetch photo from Blob path", e);
    }
  }

  // 2. Check local secure private storage (e.g. girl_image / private_photos in server environment)
  if (recipient.photoLocalFile) {
    const candidateDirs = [
      path.join(process.cwd(), "girl_image"),
      path.join(process.cwd(), "girl_photo"),
      path.join(process.cwd(), "private_photos"),
    ];

    for (const dir of candidateDirs) {
      const localFilePath = path.join(dir, recipient.photoLocalFile);
      if (fs.existsSync(localFilePath)) {
        try {
          const buffer = fs.readFileSync(localFilePath);
          return {
            buffer,
            contentType: getContentType(recipient.photoLocalFile),
          };
        } catch (e) {
          console.error("Failed to read local photo file", e);
        }
      }
    }
  }

  return null;
}
