const fs = require('fs');
const { execSync } = require('child_process');

// 1. Reset index.astro to 080656f
execSync('git checkout 080656f -- website/src/pages/index.astro');
// 2. Apply step454_clean.patch
execSync('git apply step454_clean.patch');

let content = fs.readFileSync('website/src/pages/index.astro', 'utf8').replace(/\r\n/g, '\n');
const edits = JSON.parse(fs.readFileSync('edits_after_454.json', 'utf8'));

console.log(`Replaying ${edits.length} edits strictly by lineNum...`);

let ok = 0;
let fail = 0;

for (let i = 0; i < edits.length; i++) {
  const e = edits[i];
  const target = (e.target || '').replace(/\r\n/g, '\n');
  const rep = (e.replacement || '').replace(/\r\n/g, '\n');

  if (content.includes(target)) {
    content = content.replace(target, rep);
    ok++;
    console.log(`[${i+1}/${edits.length}] Line ${e.lineNum} (Step ${e.step}): OK`);
  } else if (content.includes(rep)) {
    ok++;
    console.log(`[${i+1}/${edits.length}] Line ${e.lineNum} (Step ${e.step}): ALREADY PRESENT`);
  } else {
    fail++;
    console.log(`[${i+1}/${edits.length}] Line ${e.lineNum} (Step ${e.step}): FAILED! Target snippet: ${JSON.stringify(target.slice(0, 40))}`);
  }
}

console.log(`Summary: ${ok} succeeded, ${fail} failed.`);
fs.writeFileSync('reconstructed_from_454_plus_edits.astro', content);

// Revert index.astro in repo for safety
execSync('git checkout 080656f -- website/src/pages/index.astro');
