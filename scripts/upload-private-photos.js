const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

async function uploadPrivatePhotos() {
  // Support token from .env.local, environment variable, or command-line argument
  let token = process.env.BLOB_READ_WRITE_TOKEN || process.argv[2];

  if (!token) {
    console.log('\n❌ [CHƯA CÓ TOKEN] Không tìm thấy BLOB_READ_WRITE_TOKEN.');
    console.log('\n📌 HƯỚNG DẪN LẤY TOKEN TỪ VERCEL DASHBOARD:');
    console.log('1. Truy cập https://vercel.com/dashboard/stores/blob');
    console.log('2. Bấm vào Blob Store của bạn (ví dụ: "20-10-blob").');
    console.log('3. Chọn tab "Settings" (hoặc "Quickstart" > ".env.local").');
    console.log('4. Copy chuỗi token bắt đầu bằng "vercel_blob_rw_...".');
    console.log('\n👉 CÁCH CHẠY LỆNH:');
    console.log('Cách 1: node scripts/upload-private-photos.js vercel_blob_rw_xxxxxxxxxxxx');
    console.log('Cách 2: Thêm dòng sau vào file .env.local:');
    console.log('        BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx');
    console.log('        sau đó chạy: node scripts/upload-private-photos.js\n');
    return;
  }

  token = token.trim();

  // If passed via CLI argument, ensure .env.local records it
  const envFile = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envFile)) {
    let envContent = fs.readFileSync(envFile, 'utf-8');
    if (!envContent.includes('BLOB_READ_WRITE_TOKEN=')) {
      envContent += `\nBLOB_READ_WRITE_TOKEN=${token}\n`;
      fs.writeFileSync(envFile, envContent, 'utf-8');
      console.log('💾 Đã lưu BLOB_READ_WRITE_TOKEN vào .env.local.');
    }
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

  console.log('\n🚀 Bắt đầu tải ảnh lên Vercel Private Blob (access: private, UUID bảo mật)...');

  let successCount = 0;
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
      console.warn(`⚠️ [WARN] Không tìm thấy file ảnh cho [${r.id}] ${r.displayName}: ${r.photoLocalFile}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(r.photoLocalFile).toLowerCase() || '.jpg';
    // Path uses unguessable random hex to prevent enumeration
    const secureRandomSuffix = crypto.randomBytes(16).toString('hex');
    const privateBlobPath = `secret-bloom/private-assets/${r.id}-${secureRandomSuffix}${ext}`;

    try {
      const blob = await put(privateBlobPath, fileBuffer, {
        access: 'private',
        token: token,
      });
      r.photoBlobPath = blob.url;
      successCount++;
      console.log(`✅ [${r.id}] ${r.displayName} -> Đã tải lên Private Blob thành công.`);
    } catch (err) {
      console.error(`❌ [${r.id}] Lỗi khi tải lên:`, err.message);
    }
  }

  // 1. Update config/recipients.private.json
  fs.writeFileSync(recipientsFile, JSON.stringify(recipients, null, 2), 'utf-8');
  console.log(`\n📁 Đã cập nhật URLs Private Blob vào config/recipients.private.json (${successCount}/10 ảnh).`);

  // 2. Automatically sync RECIPIENTS_JSON into .env.local
  if (fs.existsSync(envFile)) {
    let envContent = fs.readFileSync(envFile, 'utf-8');
    const newB64 = Buffer.from(JSON.stringify(recipients)).toString('base64');
    if (envContent.includes('RECIPIENTS_JSON=')) {
      envContent = envContent.replace(/RECIPIENTS_JSON=.*(\r?\n|$)/, `RECIPIENTS_JSON=${newB64}\n`);
    } else {
      envContent += `\nRECIPIENTS_JSON=${newB64}\n`;
    }
    fs.writeFileSync(envFile, envContent, 'utf-8');
    console.log('🔄 Đã cập nhật chuỗi base64 RECIPIENTS_JSON mới vào .env.local.');
  }

  console.log('\n🎉 HOÀN TẤT UPLOAD ẢNH RIÊNG TƯ!');
  console.log('Bước tiếp theo:');
  console.log('1. Đẩy biến RECIPIENTS_JSON và BLOB_READ_WRITE_TOKEN lên Vercel:');
  console.log('   vercel env add BLOB_READ_WRITE_TOKEN production');
  console.log('   vercel env add RECIPIENTS_JSON production');
  console.log('2. Redeploy production: vercel --prod\n');
}

uploadPrivatePhotos().catch((err) => {
  console.error('Lỗi khi chạy upload script:', err.message);
});
