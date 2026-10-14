import fs from 'fs';

async function verifyAll() {
  const recipients = JSON.parse(fs.readFileSync('config/recipients.private.json', 'utf-8'));
  console.log(`Starting production verification for all ${recipients.length} recipients on https://2010-silk.vercel.app ...\n`);

  let successCount = 0;
  for (const r of recipients) {
    const unlockRes = await fetch('https://2010-silk.vercel.app/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: r.displayName,
        mode: 'BIRTHDAY',
        birthDay: r.birthDate.day,
        birthMonth: r.birthDate.month,
        birthYear: r.birthDate.year
      })
    });

    const cookie = unlockRes.headers.get('set-cookie');
    if (unlockRes.ok && cookie) {
      const photoRes = await fetch('https://2010-silk.vercel.app/api/me/photo', {
        headers: { 'Cookie': cookie }
      });
      const ok = photoRes.ok;
      const size = ok ? (await photoRes.arrayBuffer()).byteLength : 0;
      const type = photoRes.headers.get('content-type') || 'none';
      console.log(`[${r.id}] ${r.displayName.padEnd(14)} -> Unlock: ${unlockRes.status} | Photo: ${photoRes.status} (${type}, ${(size / 1024).toFixed(1)} KB)`);
      if (ok && size > 1000) successCount++;
    } else {
      console.log(`[${r.id}] ${r.displayName.padEnd(14)} -> Unlock FAILED: ${unlockRes.status}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`FINAL RESULT: ${successCount}/${recipients.length} recipients unlocked and photos verified 200 OK.`);
  console.log(`========================================`);
}

verifyAll().catch(console.error);
