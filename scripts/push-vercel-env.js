const { execSync } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

const envLocal = dotenv.parse(fs.readFileSync('.env.local', 'utf-8'));

const vars = [
  { name: 'SESSION_SECRET', value: envLocal.SESSION_SECRET },
  { name: 'SPECIAL_LEADER_CODE', value: envLocal.SPECIAL_LEADER_CODE },
  { name: 'RECIPIENTS_JSON', value: envLocal.RECIPIENTS_JSON },
];

for (const envTarget of ['production', 'preview', 'development']) {
  for (const v of vars) {
    if (!v.value) continue;
    console.log(`Setting ${v.name} for ${envTarget}...`);
    try {
      execSync(`vercel env rm ${v.name} ${envTarget} --yes`, { stdio: 'ignore' });
    } catch {}
    try {
      execSync(`vercel env add ${v.name} ${envTarget}`, {
        input: v.value,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`✅ Set ${v.name} for ${envTarget}`);
    } catch (err) {
      console.error(`Failed to set ${v.name} for ${envTarget}:`, err.message);
    }
  }
}

console.log('Environment variables configuration completed!');
