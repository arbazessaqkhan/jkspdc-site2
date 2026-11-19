const fs = require('fs');
const readline = require('readline');

async function analyzeSessions() {
  const fileStream = fs.createReadStream('C:/Users/LGS/.gemini/antigravity/brain/977f43e6-c191-4cdd-bb62-6fff6d2280e0/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let sessionCount = 0;
  let currentSession = [];
  const sessions = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    if (entry.type === 'CHECKPOINT' || (entry.content && entry.content.includes('# Resuming from a compaction'))) {
      if (currentSession.length > 0) {
        sessions.push(currentSession);
        currentSession = [];
      }
      sessionCount++;
    }
    currentSession.push(entry);
  }
  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  console.log(`Found ${sessions.length} sessions.`);
  sessions.forEach((s, i) => {
    const first = s[0];
    const last = s[s.length - 1];
    console.log(`Session ${i+1}: ${s.length} steps, ${first.created_at} -> ${last.created_at}`);
  });
}

analyzeSessions();
