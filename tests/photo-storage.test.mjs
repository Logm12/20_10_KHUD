import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { getPhotoForRecipient } from "../lib/photo-storage.server";

test("Photo Storage - retrieves local photos with Vietnamese filenames", async () => {
  // Test G02 (Trần_Thu_Huyền.jpg)
  const photoG02 = await getPhotoForRecipient("G02");
  if (fs.existsSync(path.join(process.cwd(), "girl_image", "Trần_Thu_Huyền.jpg"))) {
    assert.ok(photoG02, "Should find photo for G02");
    assert.ok(photoG02.buffer.length > 1000, "Buffer should be valid image bytes");
    assert.equal(photoG02.contentType, "image/jpeg");
  }

  // Test G01 (Nhật_Lệ.png)
  const photoG01 = await getPhotoForRecipient("G01");
  if (fs.existsSync(path.join(process.cwd(), "girl_image", "Nhật_Lệ.png"))) {
    assert.ok(photoG01, "Should find photo for G01");
    assert.ok(photoG01.buffer.length > 1000, "Buffer should be valid image bytes");
    assert.equal(photoG01.contentType, "image/png");
  }

  // Test non-existent recipient returns null
  const nonExistent = await getPhotoForRecipient("NON_EXISTENT_ID");
  assert.equal(nonExistent, null, "Should return null for non-existent recipient");
});
