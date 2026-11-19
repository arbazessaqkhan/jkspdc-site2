const fs = require('fs');
const readline = require('readline');

async function firstToolCalls() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        count++;
        if (count <= 15) {
          console.log(`Call ${count}: [${entry.step_index}] ${tc.name} ${JSON.stringify(tc.args).slice(0, 80)}`);
        }
      }
    }
  }
}

firstToolCalls();
