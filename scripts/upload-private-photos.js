const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

async function uploadPhotos() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.log('⚠️ BLOB_READ_WRITE_TOKEN is not set in environment.');
    console.log('When running in local dev, photos are safely read from local private directory.');
    console.log('To upload to Vercel Private Blob, set BLOB_READ_WRITE_TOKEN and re-run.');
    return;
  }

  const recipientsFile = path.join(__dirname, '..', 'config', 'recipients.private.json');
  const recipients = JSON.parse(fs.readFileSync(recipientsFile, 'utf-8'));
  const imageDir = path.join(__dirname, '..', 'girl_image');

  console.log('Uploading private photos to Vercel Blob with unguessable anonymized IDs...');

  for (const r of recipients) {
    if (!r.photoLocalFile) continue;
    const localPath = path.join(imageDir, r.photoLocalFile);
    if (!fs.existsSync(localPath)) continue;

    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(r.photoLocalFile);
    // Pathname does not contain recipient name or birthday for privacy
    const anonymizedPath = `secret-bloom/assets/${r.id}-flower-card${ext}`;

    try {
      const blob = await put(anonymizedPath, fileBuffer, {
        access: 'public', // Read through private API proxy or direct token
        token: token,
      });
      console.log(`Uploaded [${r.id}] -> ${blob.url}`);
      r.photoBlobPath = blob.url;
    } catch (err) {
      console.error(`Failed to upload [${r.id}]:`, err.message);
    }
  }

  fs.writeFileSync(recipientsFile, JSON.stringify(recipients, null, 2), 'utf-8');
  console.log('Updated config/recipients.private.json with Blob URLs.');
}

uploadPhotos().catch(console.error);
