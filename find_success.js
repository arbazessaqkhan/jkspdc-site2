const fs = require('fs');
const readline = require('readline');

async function findSuccessfulEdits() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const entries = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    entries.push(JSON.parse(line));
  }

  const successfulEdits = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.step_index > 454 && entry.step_index <= 742 && entry.tool_calls) {
      for (const tc of entry.tool_calls) {
        if (tc.name === 'edit_file' && tc.args && tc.args.Path && tc.args.Path.includes('index.astro')) {
          // Look for the response in the immediate next steps
          let resultStatus = 'unknown';
          let resultText = '';
          for (let j = i + 1; j < Math.min(i + 5, entries.length); j++) {
            const resp = entries[j];
            if (resp.type === 'GENERIC' || resp.source === 'SYSTEM') {
              const content = resp.content || '';
              if (content.includes('Successfully modified') || content.includes('applied') || content.includes('replaced')) {
                resultStatus = 'SUCCESS';
                resultText = content;
                break;
              } else if (content.includes('Error') || content.includes('failed') || content.includes('Target not found')) {
                resultStatus = 'FAIL';
                resultText = content;
                break;
              }
            }
          }
          successfulEdits.push({
            step: entry.step_index,
            status: resultStatus,
            resultText: resultText.slice(0, 100),
            target: tc.args.Target,
            replacement: tc.args.Replacement
          });
        }
      }
    }
  }

  console.log('Total index.astro edits examined:', successfulEdits.length);
  successfulEdits.forEach((e, idx) => {
    console.log(`${idx + 1}. Step ${e.step}: status=${e.status} | target[${e.target ? e.target.length : 0}] -> rep[${e.replacement ? e.replacement.length : 0}]`);
  });

  fs.writeFileSync('successful_edits.json', JSON.stringify(successfulEdits, null, 2));
}

findSuccessfulEdits();
