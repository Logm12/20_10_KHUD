import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  INTRO_CONFIG,
  isIntroActive,
  isValidIntroVideoUrl,
} from "../config/intro.ts";
import { inspectMp4File } from "../scripts/upload-intro-video.js";

test("Intro config is enabled and points to public Vercel Blob video", () => {
  assert.equal(INTRO_CONFIG.enabled, true, "INTRO_CONFIG.enabled must be true");
  assert.equal(
    INTRO_CONFIG.videoUrl,
    "https://djwwq8t6znwblubj.public.blob.vercel-storage.com/intro/KHUD_20_10.mp4",
    "INTRO_CONFIG.videoUrl must match the public blob video URL"
  );
  assert.equal(INTRO_CONFIG.allowSkip, true, "INTRO_CONFIG.allowSkip must default to true");
  assert.equal(
    isIntroActive(INTRO_CONFIG),
    true,
    "isIntroActive(INTRO_CONFIG) must be true when enabled and valid videoUrl is present"
  );
});

test("isValidIntroVideoUrl and isIntroActive validate public HTTPS video URLs strictly", () => {
  assert.equal(isValidIntroVideoUrl(""), false);
  assert.equal(isValidIntroVideoUrl("   "), false);
  assert.equal(isValidIntroVideoUrl("/video/intro.mp4"), false);
  assert.equal(isValidIntroVideoUrl("http://example.com/intro.mp4"), false);
  assert.equal(
    isValidIntroVideoUrl("https://store.public.blob.vercel-storage.com/intro/video.mp4"),
    true
  );

  assert.equal(
    isIntroActive({
      enabled: true,
      videoUrl: "",
      posterUrl: "",
      allowSkip: true,
    }),
    false,
    "enabled=true with empty videoUrl must NOT activate intro"
  );

  assert.equal(
    isIntroActive({
      enabled: false,
      videoUrl: "https://store.public.blob.vercel-storage.com/intro/video.mp4",
      posterUrl: "",
      allowSkip: true,
    }),
    false,
    "enabled=false with valid videoUrl must NOT activate intro"
  );

  assert.equal(
    isIntroActive({
      enabled: true,
      videoUrl: "https://store.public.blob.vercel-storage.com/intro/video.mp4",
      posterUrl: "",
      allowSkip: true,
    }),
    true,
    "enabled=true with valid HTTPS videoUrl activates intro"
  );
});

test("IntroExperience component implements invitation flow, single video element, watchdog, and accessibility", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "components/IntroExperience.tsx"),
    "utf8"
  );

  // Invitation texts & buttons
  assert.match(source, /Có một lời nhắn dành cho bạn\./);
  assert.match(source, /Xem lời nhắn/);
  assert.match(source, /Bỏ qua, vào khu vườn/);

  // Video element attributes & single instance
  const videoTagMatches = source.match(/<video\b/g) || [];
  assert.equal(videoTagMatches.length, 1, "Must render exactly one <video> element");
  assert.match(source, /preload="none"/);
  assert.match(source, /playsInline/);
  assert.match(source, /loop=\{false\}/);
  assert.match(source, /object-contain/);

  // Watchdog & error recovery without treating failure as ended
  assert.match(source, /BUFFERING_WATCHDOG_MS\s*=\s*14000/);
  assert.match(source, /Thử lại/);
  assert.match(source, /Vào khu vườn/);
  assert.match(source, /hasFinishedRef/);

  // Accessibility & reduced motion
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
});

test("SecretGiftSection resets session on every load and never restores previous gift", () => {
  const secretGiftSource = fs.readFileSync(
    path.resolve(process.cwd(), "components/SecretGiftSection.tsx"),
    "utf8"
  );
  const unlockFormSource = fs.readFileSync(
    path.resolve(process.cwd(), "components/GiftUnlockForm.tsx"),
    "utf8"
  );

  // Must NOT call /api/me/gift to restore old session
  assert.equal(
    secretGiftSource.includes("/api/me/gift"),
    false,
    "SecretGiftSection must not fetch /api/me/gift on mount"
  );

  // Must NOT use localStorage or sessionStorage to restore unlocked gift
  assert.equal(
    secretGiftSource.includes("localStorage") || secretGiftSource.includes("sessionStorage"),
    false,
    "SecretGiftSection must not persist or restore gift from Web Storage"
  );

  // Must initialize activeGift to null and call POST /api/me/reset on load
  assert.match(
    secretGiftSource,
    /useState<RecipientPublicGift\s*\|\s*null>\(\s*null\s*\)/
  );
  assert.match(
    secretGiftSource,
    /fetch\(\s*"\/api\/me\/reset",\s*\{\s*method:\s*"POST"/
  );

  // Concurrency & bfcache guards
  assert.match(secretGiftSource, /resetRequestIdRef/);
  assert.match(secretGiftSource, /unlockGenerationRef/);
  assert.match(secretGiftSource, /pageshow/);
  assert.match(secretGiftSource, /pagehide/);

  // Form submission gated on session reset completion + retry button
  assert.match(unlockFormSource, /isSessionReady/);
  assert.match(unlockFormSource, /onRetrySessionReset/);
});

test("upload-intro-video script uses streaming multipart upload and inspects MP4 fast-start boxes without reading full file into RAM", () => {
  const scriptSource = fs.readFileSync(
    path.resolve(process.cwd(), "scripts/upload-intro-video.js"),
    "utf8"
  );

  assert.equal(
    scriptSource.includes("readFileSync"),
    false,
    "upload-intro-video.js must not use fs.readFileSync on large video files"
  );
  assert.match(scriptSource, /createReadStream/);
  assert.match(scriptSource, /multipart:\s*true/);
  assert.match(scriptSource, /access:\s*"public"/);
  assert.match(scriptSource, /INTRO_BLOB_READ_WRITE_TOKEN/);

  // Create a tiny synthetic MP4 in a temp file to verify inspectMp4File
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "intro-mp4-test-"));
  const fastStartMp4 = path.join(tmpDir, "faststart.mp4");
  const slowStartMp4 = path.join(tmpDir, "slowstart.mp4");

  const makeBox = (type, payload) => {
    const buf = Buffer.alloc(8 + payload.length);
    buf.writeUInt32BE(buf.length, 0);
    buf.write(type, 4, 4, "ascii");
    payload.copy(buf, 8);
    return buf;
  };

  const ftypBox = makeBox("ftyp", Buffer.from("isom0000", "ascii"));
  const moovBox = makeBox("moov", Buffer.from("0000avc10000mp4a0000", "ascii"));
  const mdatBox = makeBox("mdat", Buffer.from("videodata", "ascii"));

  try {
    fs.writeFileSync(fastStartMp4, Buffer.concat([ftypBox, moovBox, mdatBox]));
    const fastReport = inspectMp4File(fastStartMp4);
    assert.equal(fastReport.hasFtyp, true);
    assert.equal(fastReport.isFastStart, true);
    assert.equal(fastReport.hasH264, true);
    assert.equal(fastReport.hasAac, true);

    fs.writeFileSync(slowStartMp4, Buffer.concat([ftypBox, mdatBox, moovBox]));
    const slowReport = inspectMp4File(slowStartMp4);
    assert.equal(slowReport.hasFtyp, true);
    assert.equal(slowReport.isFastStart, false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
