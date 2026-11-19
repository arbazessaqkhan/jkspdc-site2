const fs = require('fs');
const readline = require('readline');

async function checkAllReplacements() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  const entries = [];
  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    e.fileLine = lineNum;
    entries.push(e);
  }

  const edits = JSON.parse(fs.readFileSync('edits_after_454.json', 'utf8'));

  for (let i = 0; i < edits.length; i++) {
    const ed = edits[i];
    const idx = entries.findIndex(e => e.fileLine === ed.lineNum);
    if (idx !== -1 && idx + 1 < entries.length) {
      const resp = entries[idx + 1];
      const match = (resp.content || '').match(/starting at line (\d+) \(([+-]\d+\/[+-]\d+ lines)\)/);
      const errMatch = (resp.content || '').includes('Error') || (resp.content || '').includes('error');
      console.log(`[${i+1}] Line ${ed.lineNum} [Step ${ed.step}]: ${match ? `line ${match[1]} (${match[2]})` : (errMatch ? 'ERROR' : resp.content.slice(0, 60))}`);
    }
  }
}

checkAllReplacements();
