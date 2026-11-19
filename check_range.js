const fs = require('fs');
const readline = require('readline');

async function checkRange() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum >= 730 && lineNum <= 755) {
      const e = JSON.parse(line);
      console.log(`Line ${lineNum} [${e.step_index}] ${e.source} ${e.type} ${e.created_at} tc:${e.tool_calls ? e.tool_calls.map(t=>t.name).join(',') : ''}`);
    }
  }
}

checkRange();
