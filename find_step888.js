const fs = require('fs');
const readline = require('readline');

async function findStep888Output() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.created_at >= '2026-11-18T14:45:50Z' && entry.created_at <= '2026-11-18T14:46:30Z') {
      console.log(entry.created_at, entry.step_index, entry.type, 'len:', entry.content ? entry.content.length : 0);
      if (entry.content && entry.content.includes('diff --git')) {
        fs.writeFileSync('step889_diff.patch', entry.content);
        console.log('Saved step889_diff.patch, len:', entry.content.length);
      }
    }
  }
}

findStep888Output();
