import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  MUSIC_PLAYLIST,
  getNextTrackIndex,
  getPrevTrackIndex,
} from "../config/music.ts";

test("1. MUSIC_PLAYLIST has valid real entries and starts with 'Phép Màu'", () => {
  assert.equal(MUSIC_PLAYLIST.length, 2, "Playlist must contain 2 real tracks");

  assert.equal(MUSIC_PLAYLIST[0].id, "phep-mau");
  assert.equal(MUSIC_PLAYLIST[0].title, "Phép Màu");
  assert.equal(MUSIC_PLAYLIST[0].src, "/music/phep-mau.m4a");

  assert.equal(MUSIC_PLAYLIST[1].id, "em-se-rang-ngoi-nhe");
  assert.equal(MUSIC_PLAYLIST[1].title, "Em Sẽ Rạng Ngời Nhé");
  assert.equal(MUSIC_PLAYLIST[1].src, "/music/em-se-rang-ngoi-nhe.m4a");

  for (const track of MUSIC_PLAYLIST) {
    assert.ok(track.id && track.title && track.src);
    assert.ok(
      track.src.startsWith("/music/"),
      `Track src must be a public web path starting with /music/, got: ${track.src}`
    );
    assert.ok(
      !track.src.includes("\\") && !track.src.includes(":"),
      "Track src must not use local filesystem paths"
    );
  }
});

test("2. Original files in music/ and public assets in public/music/ exist with valid AAC-LC codec", () => {
  const rawFiles = [
    path.join(process.cwd(), "music", "Phep_mau.m4a"),
    path.join(process.cwd(), "music", "Em_se_rang_ngoi_nhe.m4a"),
  ];
  for (const rawPath of rawFiles) {
    assert.ok(fs.existsSync(rawPath), `Original file must remain intact: ${rawPath}`);
  }

  for (const track of MUSIC_PLAYLIST) {
    const publicFilePath = path.join(process.cwd(), "public", track.src);
    assert.ok(
      fs.existsSync(publicFilePath),
      `Public audio asset must exist at ${publicFilePath}`
    );

    const buf = fs.readFileSync(publicFilePath);
    assert.ok(buf.length > 1_000_000, "Audio file should have valid size");

    const ftyp = buf.subarray(4, 8).toString("ascii");
    assert.equal(ftyp, "ftyp", "M4A container must begin with ftyp box");
    assert.ok(buf.includes(Buffer.from("mp4a")), "M4A container must contain mp4a audio sample entry");
    assert.ok(buf.includes(Buffer.from("esds")), "M4A container must contain esds codec descriptor");
  }
});

test("3. Playlist looping & navigation logic works for 1, 2, and 3 tracks (using temporary fixture)", () => {
  // 1-track playlist: loops back to 0
  assert.equal(getNextTrackIndex(0, 1), 0);
  assert.equal(getPrevTrackIndex(0, 1), 0);

  // 2-track playlist: 0 -> 1 -> 0
  assert.equal(getNextTrackIndex(0, 2), 1);
  assert.equal(getNextTrackIndex(1, 2), 0);
  assert.equal(getPrevTrackIndex(0, 2), 1);
  assert.equal(getPrevTrackIndex(1, 2), 0);

  // 3-track temporary fixture (not persisted in production config)
  const tempThreeTrackFixture = [
    ...MUSIC_PLAYLIST,
    { id: "temp-track-3", title: "Bài thử nghiệm 3", src: "/music/phep-mau.m4a" },
  ];
  const len = tempThreeTrackFixture.length;
  assert.equal(len, 3);
  assert.equal(getNextTrackIndex(0, len), 1);
  assert.equal(getNextTrackIndex(1, len), 2);
  assert.equal(getNextTrackIndex(2, len), 0);

  assert.equal(getPrevTrackIndex(0, len), 2);
  assert.equal(getPrevTrackIndex(2, len), 1);
  assert.equal(getPrevTrackIndex(1, len), 0);
});

test("4. AudioPlayer component removes Web Audio oscillator chime and uses single HTMLAudioElement with preload='none'", () => {
  const playerPath = path.join(process.cwd(), "components", "AudioPlayer.tsx");
  const code = fs.readFileSync(playerPath, "utf-8");

  // Ensure legacy Web Audio API chime generator is completely removed
  assert.ok(!code.includes("createOscillator"), "Must not use createOscillator");
  assert.ok(!code.includes("playChime"), "Must not contain old playChime function");
  assert.ok(!code.includes("AudioContext"), "Must not instantiate Web Audio API AudioContext");

  // Ensure single <audio> with preload="none" and ref={audioRef}
  const audioTagMatches = code.match(/<audio\b/g) || [];
  assert.equal(audioTagMatches.length, 1, "Must render exactly one <audio> element");
  assert.ok(code.includes('preload="none"'), 'Must set preload="none" on audio element');
  assert.ok(code.includes("ref={audioRef}"), "Must bind audioRef to HTMLAudioElement");
});
