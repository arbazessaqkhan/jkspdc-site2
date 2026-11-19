const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get index.astro from git HEAD (clean 080656f)
console.log('Restoring base index.astro from 080656f...');
execSync('git checkout 080656f -- website/src/pages/index.astro');

// 2. Apply step454_clean.patch
console.log('Applying step454_clean.patch...');
execSync('git apply step454_clean.patch');

let currentContent = fs.readFileSync('website/src/pages/index.astro', 'utf8').replace(/\r\n/g, '\n');

// 3. Read edits_454_to_742.json and sort by step ascending
const rawEdits = JSON.parse(fs.readFileSync('edits_454_to_742.json', 'utf8'));
rawEdits.sort((a, b) => a.step - b.step);

console.log(`Processing ${rawEdits.length} edits sequentially...`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < rawEdits.length; i++) {
  const e = rawEdits[i];
  const target = (e.args.Target || '').replace(/\r\n/g, '\n');
  const replacement = (e.args.Replacement || '').replace(/\r\n/g, '\n');

  if (!target) {
    console.log(`Edit ${i+1} (step ${e.step}) has no target, skipping`);
    continue;
  }

  if (currentContent.includes(target)) {
    currentContent = currentContent.replace(target, replacement);
    successCount++;
    console.log(`Edit ${i+1} (step ${e.step}) APPLIED successfully`);
  } else {
    // Check if target was already applied or failed
    if (currentContent.includes(replacement)) {
      console.log(`Edit ${i+1} (step ${e.step}) ALREADY PRESENT (replacement found)`);
      successCount++;
    } else {
      console.log(`Edit ${i+1} (step ${e.step}) MISSED target! Target preview: ${JSON.stringify(target.slice(0, 50))}`);
      failCount++;
    }
  }
}

console.log(`\nResults: ${successCount} applied/present, ${failCount} failed.`);
fs.writeFileSync('reconstructed_index_step742.astro', currentContent);
console.log('Wrote reconstructed_index_step742.astro, length:', currentContent.length);

// Also restore git checkout on index.astro so we don't leave working tree dirty yet
execSync('git checkout 080656f -- website/src/pages/index.astro');
