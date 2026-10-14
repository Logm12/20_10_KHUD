const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateSecureEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  let existingEnv = {};

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        existingEnv[match[1]] = match[2] || '';
      }
    }
  }

  // Preserve or generate cryptographically secure values
  const sessionSecret = existingEnv.SESSION_SECRET && existingEnv.SESSION_SECRET.length >= 32
    ? existingEnv.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

  const specialLeaderCode = existingEnv.SPECIAL_LEADER_CODE && existingEnv.SPECIAL_LEADER_CODE.trim()
    ? existingEnv.SPECIAL_LEADER_CODE.trim()
    : 'BLOOM-' + crypto.randomBytes(6).toString('hex').toUpperCase();

  const recipientsPath = path.join(__dirname, '..', 'config', 'recipients.private.json');
  let recipientsB64 = existingEnv.RECIPIENTS_JSON || '';

  if (fs.existsSync(recipientsPath)) {
    const rawData = fs.readFileSync(recipientsPath, 'utf-8');
    recipientsB64 = Buffer.from(rawData).toString('base64');
  }

  const outputLines = [
    `SESSION_SECRET=${sessionSecret}`,
    `SPECIAL_LEADER_CODE=${specialLeaderCode}`,
    `RECIPIENTS_JSON=${recipientsB64}`,
  ];

  if (existingEnv.BLOB_READ_WRITE_TOKEN) {
    outputLines.push(`BLOB_READ_WRITE_TOKEN=${existingEnv.BLOB_READ_WRITE_TOKEN}`);
  }

  fs.writeFileSync(envPath, outputLines.join('\n') + '\n', 'utf-8');
  console.log('Successfully generated .env.local with secure random secrets.');
}

generateSecureEnv();
