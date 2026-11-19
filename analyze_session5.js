const fs = require('fs');
const readline = require('readline');

async function analyzeSession5() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inSession5 = false;
  let sessionIndex = 0;
  const session5Ops = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.type === 'CHECKPOINT' || (entry.content && entry.content.includes('# Resuming from a compaction'))) {
      sessionIndex++;
      if (sessionIndex === 5) inSession5 = true;
      else inSession5 = false;
    }
    if (inSession5) {
      if (entry.tool_calls) {
        for (const tc of entry.tool_calls) {
          session5Ops.push({
            step: entry.step_index,
            time: entry.created_at,
            name: tc.name,
            args: tc.args
          });
        }
      }
    }
  }

  console.log(`Session 5 total tool calls: ${session5Ops.length}`);
  const edits = session5Ops.filter(o => o.name === 'edit_file' || o.name === 'write_file' || (o.name === 'run_command' && JSON.stringify(o.args).includes('git')));
  edits.forEach(e => {
    console.log(`${e.time} [${e.step}] ${e.name}: ${JSON.stringify(e.args).slice(0, 120)}`);
  });
}

analyzeSession5();
