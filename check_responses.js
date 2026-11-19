const fs = require('fs');
const readline = require('readline');

async function checkResponses() {
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

  for (const ed of edits) {
    // Find entry with fileLine === ed.lineNum
    const idx = entries.findIndex(e => e.fileLine === ed.lineNum);
    if (idx !== -1 && idx + 1 < entries.length) {
      const resp = entries[idx + 1];
      const respContent = resp.content || '';
      console.log(`Line ${ed.lineNum} [Step ${ed.step}]: ${respContent.slice(0, 100).replace(/\r?\n/g, ' ')}`);
    }
  }
}

checkResponses();
