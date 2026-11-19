const fs = require('fs');
const readline = require('readline');

async function getSession4Edits() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inSession4 = false;
  let sessionIndex = 0;
  const session4Edits = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.type === 'CHECKPOINT' || (entry.content && entry.content.includes('# Resuming from a compaction'))) {
      sessionIndex++;
      if (sessionIndex === 4) inSession4 = true;
      else inSession4 = false;
    }
    if (inSession4) {
      if (entry.tool_calls) {
        for (const tc of entry.tool_calls) {
          if (tc.name === 'edit_file' && tc.args && tc.args.Path && tc.args.Path.includes('index.astro')) {
            session4Edits.push({
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

  console.log(`Session 4 index.astro edits: ${session4Edits.length}`);
  fs.writeFileSync('session4_edits.json', JSON.stringify(session4Edits, null, 2));
  session4Edits.forEach((e, i) => {
    console.log(`${i+1}. Step ${e.step} at ${e.time}: Target[${e.target ? e.target.length : 0}] -> Rep[${e.replacement ? e.replacement.length : 0}]`);
  });
}

getSession4Edits();
