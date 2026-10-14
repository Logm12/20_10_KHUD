const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function syncRecipients() {
  const configFile = path.join(__dirname, '..', 'config', 'recipients.private.json');
  if (!fs.existsSync(configFile)) {
    console.error('Config file not found:', configFile);
    process.exit(1);
  }

  const recipients = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  console.log(`Loaded ${recipients.length} recipients from private config.`);

  // Minify JSON to minimize size
  const minified = JSON.stringify(recipients);
  const b64 = Buffer.from(minified, 'utf-8').toString('base64');
  console.log(`Minified JSON length: ${minified.length} chars. Base64 length: ${b64.length} chars.`);

  console.log('Spawning Vercel CLI to add RECIPIENTS_JSON...');
  const proc = spawn('cmd.exe', ['/c', 'npx', 'vercel', 'env', 'add', 'RECIPIENTS_JSON', 'production'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    cwd: path.join(__dirname, '..'),
  });

  proc.stdin.write(b64);
  proc.stdin.end();

  proc.on('close', (code) => {
    if (code === 0) {
      console.log('✅ RECIPIENTS_JSON successfully updated in Vercel production environment.');
    } else {
      console.error(`❌ Vercel CLI exited with code ${code}`);
      process.exit(code);
    }
  });
}

syncRecipients();
