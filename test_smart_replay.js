const fs = require('fs');
const { execSync } = require('child_process');

execSync('git checkout 080656f -- website/src/pages/index.astro');
execSync('git apply step454_clean.patch');

let content = fs.readFileSync('website/src/pages/index.astro', 'utf8').replace(/\r\n/g, '\n');
const edits = JSON.parse(fs.readFileSync('edits_after_454.json', 'utf8'));

// Exclude the 3 failed ones: line 1219, 1422, 1430
const successfulEdits = edits.filter(e => ![1219, 1422, 1430].includes(e.lineNum));

console.log(`Testing ${successfulEdits.length} successful edits...`);

for (let i = 0; i < successfulEdits.length; i++) {
  const e = successfulEdits[i];
  const target = (e.target || '').replace(/\r\n/g, '\n');
  const rep = (e.replacement || '').replace(/\r\n/g, '\n');

  if (content.includes(target)) {
    content = content.replace(target, rep);
    console.log(`[${i+1}] Line ${e.lineNum} (Step ${e.step}): DIRECT MATCH`);
  } else {
    // Try trimming trailing whitespaces per line
    const normalize = s => s.split('\n').map(l => l.trimEnd()).join('\n');
    const normContent = normalize(content);
    const normTarget = normalize(target);
    const pos = normContent.indexOf(normTarget);
    if (pos !== -1) {
      console.log(`[${i+1}] Line ${e.lineNum} (Step ${e.step}): MATCH WITH TRIMMED LINES!`);
      // Replace in content
      // Find actual lines in content
      const beforeLines = normContent.slice(0, pos).split('\n').length - 1;
      const targetLinesCount = normTarget.split('\n').length;
      const contentLines = content.split('\n');
      contentLines.splice(beforeLines, targetLinesCount, rep);
      content = contentLines.join('\n');
    } else {
      console.log(`[${i+1}] Line ${e.lineNum} (Step ${e.step}): NO MATCH`);
      // Print first line of target
      const firstLine = target.split('\n')[0].trim();
      const matchLines = content.split('\n').map((l, idx) => ({ l: l.trim(), idx })).filter(x => x.l === firstLine);
      console.log(`   First line: "${firstLine}", occurrences in content: ${matchLines.map(m => m.idx + 1).join(', ')}`);
    }
  }
}

fs.writeFileSync('tested_reconstruction.astro', content);
console.log('Saved tested_reconstruction.astro, size:', content.length, 'lines:', content.split('\n').length);
execSync('git checkout 080656f -- website/src/pages/index.astro');
