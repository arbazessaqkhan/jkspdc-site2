const fs = require('fs');
const readline = require('readline');

async function getEdits() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const edits = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.step_index > 454 && entry.step_index <= 742 && entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        if (tc.name === 'edit_file' && tc.args && tc.args.Path && tc.args.Path.includes('index.astro')) {
          edits.push({
            step: entry.step_index,
            targetLen: tc.args.Target ? tc.args.Target.length : 0,
            repLen: tc.args.Replacement ? tc.args.Replacement.length : 0,
            targetSample: tc.args.Target ? tc.args.Target.slice(0, 40).replace(/\r?\n/g, ' ') : '',
            repSample: tc.args.Replacement ? tc.args.Replacement.slice(0, 40).replace(/\r?\n/g, ' ') : '',
            args: tc.args
          });
        }
      }
    }
  }
  console.log('Total edits found between step 454 and 742:', edits.length);
  fs.writeFileSync('edits_454_to_742.json', JSON.stringify(edits, null, 2));
  edits.forEach((e, i) => {
    console.log(`${i+1}. Step ${e.step}: Target[${e.targetLen}] -> Rep[${e.repLen}] | "${e.targetSample}"`);
  });
}
getEdits();
