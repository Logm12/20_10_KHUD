const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '..', 'girl_image');
const recipientsPath = path.join(__dirname, '..', 'config', 'recipients.private.json');

console.log('--- AUDITING GIRL PHOTOS ---');

if (!fs.existsSync(imageDir)) {
  console.error('Directory girl_image does not exist!');
  process.exit(1);
}

const files = fs.readdirSync(imageDir);
console.log(`Found ${files.length} files in ${imageDir}:`);
files.forEach(f => {
  const stat = fs.statSync(path.join(imageDir, f));
  console.log(`- ${f} (${stat.size} bytes, ${path.extname(f)})`);
});

const recipients = JSON.parse(fs.readFileSync(recipientsPath, 'utf-8'));
console.log(`\nValidating 10 official recipients against local photos:`);

let matchedCount = 0;
const unmatchedRecipients = [];
const mappedFiles = new Set();

recipients.forEach(r => {
  const targetFile = r.photoLocalFile;
  if (targetFile && files.includes(targetFile)) {
    console.log(`✅ [${r.id}] ${r.fullName} (${r.displayName}) -> ${targetFile}`);
    matchedCount++;
    mappedFiles.add(targetFile);
  } else {
    console.error(`❌ [${r.id}] ${r.fullName} -> MISSING: ${targetFile}`);
    unmatchedRecipients.push(r.fullName);
  }
});

console.log(`\nMatched: ${matchedCount}/10 recipients.`);

const unmappedFiles = files.filter(f => !mappedFiles.has(f));
if (unmappedFiles.length > 0) {
  console.log(`\n⚠️ Notice extra unmapped files in directory (not in official roster):`);
  unmappedFiles.forEach(f => console.log(`- ${f}`));
}

if (matchedCount === 10) {
  console.log('\n🎉 ALL 10 RECIPIENTS ARE SUCCESSFULLY MAPPED!');
} else {
  console.error('\n⚠️ Some recipients are missing images!');
  process.exit(1);
}
