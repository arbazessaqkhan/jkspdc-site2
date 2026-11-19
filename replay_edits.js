const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get clean index.astro from 080656f
execSync('git checkout 080656f -- website/src/pages/index.astro');
let content = fs.readFileSync('website/src/pages/index.astro', 'utf8').replace(/\r\n/g, '\n');

const edits = JSON.parse(fs.readFileSync('all_edits_sessions0_to_4.json', 'utf8'));

console.log(`Replaying ${edits.length} edits...`);
let successCount = 0;
let failCount = 0;

for (let i = 0; i < edits.length; i++) {
  const e = edits[i];
  const target = (e.target || '').replace(/\r\n/g, '\n');
  const rep = (e.replacement || '').replace(/\r\n/g, '\n');

  if (content.includes(target)) {
    content = content.replace(target, rep);
    successCount++;
    console.log(`Edit ${i+1} (S${e.session} Step ${e.step} at ${e.time}): SUCCESS`);
  } else if (content.includes(rep)) {
    console.log(`Edit ${i+1} (S${e.session} Step ${e.step} at ${e.time}): ALREADY PRESENT`);
    successCount++;
  } else {
    console.log(`Edit ${i+1} (S${e.session} Step ${e.step} at ${e.time}): MISSED TARGET! Target preview: ${JSON.stringify(target.slice(0, 50))}`);
    failCount++;
  }
}

console.log(`\nReplay finished: ${successCount} applied, ${failCount} failed.`);
fs.writeFileSync('replayed_index.astro', content);
console.log('Saved replayed_index.astro, size:', content.length, 'lines:', content.split('\n').length);

// Clean up working tree
execSync('git checkout 080656f -- website/src/pages/index.astro');
