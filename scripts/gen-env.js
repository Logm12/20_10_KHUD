const fs = require('fs');

const data = fs.readFileSync('config/recipients.private.json', 'utf-8');
const b64 = Buffer.from(data).toString('base64');
const content = [
  'SESSION_SECRET=deab3b5c7a44884ff6318b5de1996e2c31c8a79f714f357a6ce2102dbd4ddcde',
  'SPECIAL_LEADER_CODE=BLOOM-NL2026-KHUD',
  'RECIPIENTS_JSON=' + b64,
  ''
].join('\n');

fs.writeFileSync('.env.local', content, 'utf-8');
console.log('Successfully created .env.local');
