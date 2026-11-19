const fs = require('fs');
const readline = require('readline');

async function getAllEdits() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let sessionIndex = 0;
  const allEdits = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.type === 'CHECKPOINT' || (entry.content && entry.content.includes('# Resuming from a compaction'))) {
      sessionIndex++;
    }
    if (sessionIndex <= 4) {
      if (entry.tool_calls) {
        for (const tc of entry.tool_calls) {
          if (tc.name === 'edit_file' && tc.args && tc.args.Path && tc.args.Path.includes('index.astro')) {
            allEdits.push({
              session: sessionIndex,
              step: entry.step_index,
              time: entry.created_at,
              target: tc.args.Target,
              replacement: tc.args.Replacement
            });
          }
        }
      }
    }
  }

  console.log(`Total edits across sessions 0-4: ${allEdits.length}`);
  fs.writeFileSync('all_edits_sessions0_to_4.json', JSON.stringify(allEdits, null, 2));
  allEdits.forEach((e, i) => {
    console.log(`${i+1}. Session ${e.session} Step ${e.step} at ${e.time}: Target[${e.target ? e.target.length : 0}] -> Rep[${e.replacement ? e.replacement.length : 0}]`);
  });
}

getAllEdits();
