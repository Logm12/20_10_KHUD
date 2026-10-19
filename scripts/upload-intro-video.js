#!/usr/bin/env node
/**
 * Admin script to inspect and upload the Intro Video (> 200 MB) directly to a
 * dedicated Vercel Public Blob store using streaming/multipart upload.
 *
 * Security & Architecture Constraints:
 * - Uses a SEPARATE Public Blob store token (`INTRO_BLOB_READ_WRITE_TOKEN`),
 *   keeping the private photo store (`BLOB_READ_WRITE_TOKEN`) completely untouched.
 * - Never reads the entire video file into RAM: uses bounded chunk reads for MP4
 *   box/codec inspection and `fs.createReadStream` + `multipart: true` for upload.
 * - Never exposes any R/W token to `NEXT_PUBLIC_*` or client code.
 *
 * Usage:
 *   INTRO_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node scripts/upload-intro-video.js <path-to-video.mp4>
 *   node scripts/upload-intro-video.js <path-to-video.mp4> --inspect-only
 */

const fs = require("fs");
const path = require("path");
const { put } = require("@vercel/blob");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Inspects MP4 top-level atoms (`ftyp`, `moov`, `mdat`) by walking box headers
 * using file descriptor offsets (O(1) memory, works on multi-GB files) and
 * scans the first bounded slice of `moov` for `avc1` (H.264) and `mp4a` (AAC).
 */
function inspectMp4File(filePath) {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const fd = fs.openSync(filePath, "r");

  const headerBuf = Buffer.alloc(16);
  const topLevelBoxes = [];
  let offset = 0;
  let moovOffset = -1;
  let moovSize = 0;
  let mdatOffset = -1;
  let hasFtyp = false;
  let hasH264 = false;
  let hasAac = false;

  try {
    while (offset + 8 <= fileSize && topLevelBoxes.length < 64) {
      const bytesRead = fs.readSync(fd, headerBuf, 0, Math.min(16, fileSize - offset), offset);
      if (bytesRead < 8) break;

      let boxSize = headerBuf.readUInt32BE(0);
      const boxType = headerBuf.subarray(4, 8).toString("ascii");
      let headerSize = 8;

      if (boxSize === 1) {
        if (bytesRead < 16) break;
        const high = headerBuf.readUInt32BE(8);
        const low = headerBuf.readUInt32BE(12);
        boxSize = high * 0x100000000 + low;
        headerSize = 16;
      } else if (boxSize === 0) {
        boxSize = fileSize - offset;
      }

      if (boxSize < headerSize) break;

      topLevelBoxes.push({ type: boxType, offset, size: boxSize });

      if (boxType === "ftyp") hasFtyp = true;
      if (boxType === "moov" && moovOffset === -1) {
        moovOffset = offset;
        moovSize = boxSize;
      }
      if (boxType === "mdat" && mdatOffset === -1) {
        mdatOffset = offset;
      }

      offset += boxSize;
    }

    if (moovOffset !== -1 && moovSize > 0) {
      // Read up to 2 MB of the moov atom to check codec signatures without loading large files
      const scanBytes = Math.min(moovSize, 2 * 1024 * 1024);
      const moovBuf = Buffer.alloc(scanBytes);
      fs.readSync(fd, moovBuf, 0, scanBytes, moovOffset);
      hasH264 = moovBuf.includes(Buffer.from("avc1", "ascii"));
      hasAac = moovBuf.includes(Buffer.from("mp4a", "ascii"));
    }
  } finally {
    fs.closeSync(fd);
  }

  const isFastStart =
    moovOffset !== -1 && (mdatOffset === -1 || moovOffset < mdatOffset);

  return {
    fileSize,
    fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
    hasFtyp,
    moovOffset,
    mdatOffset,
    isFastStart,
    hasH264,
    hasAac,
    topLevelBoxes: topLevelBoxes.map((b) => b.type),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const inspectOnly = args.includes("--inspect-only");
  const fileArg = args.find((arg) => !arg.startsWith("--"));

  if (!fileArg) {
    console.error(
      "Usage: node scripts/upload-intro-video.js <path-to-video.mp4> [--inspect-only]"
    );
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[ERROR] Video file not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`[1/3] Inspecting MP4 container & web readiness: ${ path.basename(resolvedPath) }`);
  const report = inspectMp4File(resolvedPath);
  console.log(`  - File size   : ${report.fileSizeMB} MB (${report.fileSize} bytes)`);
  console.log(`  - Top boxes   : ${report.topLevelBoxes.join(", ") || "unknown"}`);
  console.log(`  - MP4 ftyp    : ${report.hasFtyp ? "OK" : "MISSING"}`);
  console.log(
    `  - Fast-start  : ${
      report.isFastStart
        ? "OK (moov atom precedes mdat)"
        : "WARNING (moov is after mdat; browser must seek to end before playing)"
    }`
  );
  console.log(`  - Video codec : ${report.hasH264 ? "H.264 (avc1) detected" : "WARNING: avc1 not detected"}`);
  console.log(`  - Audio codec : ${report.hasAac ? "AAC (mp4a) detected" : "WARNING: mp4a not detected"}`);

  if (!report.hasFtyp || !report.isFastStart || !report.hasH264) {
    console.log("\n[TIP] To optimize this video for instant web streaming (H.264 + AAC + faststart) while keeping the original file intact:");
    console.log(
      `  ffmpeg -i "${fileArg}" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 22 -c:a aac -b:a 160k -movflags +faststart "${fileArg.replace(/\.[^.]+$/, "")}.web.mp4"\n`
    );
  }

  if (inspectOnly) {
    console.log("[DONE] Inspection finished (--inspect-only).");
    return;
  }

  const token = process.env.INTRO_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      "[ERROR] Missing INTRO_BLOB_READ_WRITE_TOKEN environment variable.\n" +
        "Please create a SEPARATE Public Vercel Blob store for the intro video (do NOT use the private photo store token) and run:\n" +
        "  INTRO_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node scripts/upload-intro-video.js <path-to-video.mp4>"
    );
    process.exit(1);
  }

  if (
    process.env.BLOB_READ_WRITE_TOKEN &&
    token === process.env.BLOB_READ_WRITE_TOKEN
  ) {
    console.error(
      "[SECURITY ABORT] INTRO_BLOB_READ_WRITE_TOKEN matches BLOB_READ_WRITE_TOKEN (private photo store).\n" +
        "The intro video MUST use a separate Public Blob store so private photos remain strictly isolated."
    );
    process.exit(1);
  }

  const blobPathname = `intro/${path.basename(resolvedPath)}`;
  console.log(
    `[2/3] Streaming upload (${report.fileSizeMB} MB) to Vercel Public Blob as "${blobPathname}" (multipart: true)...`
  );

  const readStream = fs.createReadStream(resolvedPath);
  const blob = await put(blobPathname, readStream, {
    access: "public",
    multipart: true,
    addRandomSuffix: true,
    contentType: "video/mp4",
    token,
  });

  console.log("\n[3/3] Upload Complete!");
  console.log(`  Public HTTPS URL: ${blob.url}`);
  console.log(
    "\nNext step: Set `enabled: true` and `videoUrl` in `config/intro.ts` (or set `NEXT_PUBLIC_INTRO_VIDEO_URL` and `NEXT_PUBLIC_INTRO_ENABLED=true`)."
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[UPLOAD ERROR]", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

module.exports = { inspectMp4File };
