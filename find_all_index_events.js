const fs = require('fs');
const readline = require('readline');

async function findAllIndexEdits() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  const events = [];

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        const s = JSON.stringify(tc.args || {});
        if (s.includes('index.astro')) {
          events.push({
            lineNum,
            step: entry.step_index,
            time: entry.created_at,
            name: tc.name,
            args: tc.args
          });
        }
      }
    }
  }

  console.log(`Total events touching index.astro: ${events.length}`);
  events.forEach((ev, i) => {
    console.log(`${i+1}. Line ${ev.lineNum} [Step ${ev.step}] at ${ev.time}: ${ev.name} ${JSON.stringify(ev.args).slice(0, 100)}`);
  });
}

findAllIndexEdits();
