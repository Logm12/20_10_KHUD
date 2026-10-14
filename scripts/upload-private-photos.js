const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

async function uploadPrivatePhotos() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.log('⚠️ BLOB_READ_WRITE_TOKEN is not set in environment.');
    console.log('In local development, photos are safely read from local private directories.');
    console.log('To upload to Vercel Private Blob store, supply BLOB_READ_WRITE_TOKEN and run this script.');
    return;
  }

  const recipientsFile = path.join(__dirname, '..', 'config', 'recipients.private.json');
  if (!fs.existsSync(recipientsFile)) {
    console.error('Config file not found:', recipientsFile);
    return;
  }

  const recipients = JSON.parse(fs.readFileSync(recipientsFile, 'utf-8'));
  const candidateDirs = [
    path.join(__dirname, '..', 'girl_image'),
    path.join(__dirname, '..', 'girl_photo'),
    path.join(__dirname, '..', 'private_photos'),
  ];

  console.log('Beginning secure upload to Vercel Private Blob (access: private, unguessable UUIDs)...');

  for (const r of recipients) {
    if (!r.photoLocalFile) continue;

    let localPath = null;
    for (const dir of candidateDirs) {
      const p = path.join(dir, r.photoLocalFile);
      if (fs.existsSync(p)) {
        localPath = p;
        break;
      }
    }

    if (!localPath) {
      console.warn(`[WARN] File not found for recipient ${r.id}: ${r.photoLocalFile}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(r.photoLocalFile).toLowerCase() || '.jpg';
    // Use cryptographically secure random token in path to prevent guessing
    const secureRandomSuffix = crypto.randomBytes(16).toString('hex');
    const privateBlobPath = `secret-bloom/private-assets/${r.id}-${secureRandomSuffix}${ext}`;

    try {
      const blob = await put(privateBlobPath, fileBuffer, {
        access: 'private',
        token: token,
      });
      // Store blob URL internally in private configuration
      r.photoBlobPath = blob.url;
      console.log(`[OK] Uploaded private asset for recipient ${r.id} (access: private)`);
    } catch (err) {
      console.error(`[ERROR] Failed to upload for recipient ${r.id}:`, err.message);
    }
  }

  fs.writeFileSync(recipientsFile, JSON.stringify(recipients, null, 2), 'utf-8');
  console.log('Successfully updated config/recipients.private.json with private blob references.');
}

uploadPrivatePhotos().catch((err) => {
  console.error('Upload script encountered an error:', err.message);
});
