const fs = require('fs');
const readline = require('readline');

async function getEditsAfter454() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  const edits = [];

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (lineNum > 714 && entry.created_at < '2026-11-18T14:40:00Z' && entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        if (tc.name === 'edit_file' && tc.args && tc.args.Path && tc.args.Path.includes('index.astro')) {
          edits.push({
            lineNum,
            step: entry.step_index,
            time: entry.created_at,
            target: tc.args.Target,
            replacement: tc.args.Replacement
          });
        }
      }
    }
  }

  console.log(`Found ${edits.length} edits to index.astro between 454 and Nov 18 14:40.`);
  fs.writeFileSync('edits_after_454.json', JSON.stringify(edits, null, 2));
  edits.forEach((e, i) => {
    console.log(`${i+1}. Line ${e.lineNum} [Step ${e.step}] at ${e.time}: Target[${e.target ? e.target.length : 0}] -> Rep[${e.replacement ? e.replacement.length : 0}]`);
  });
}

getEditsAfter454();
