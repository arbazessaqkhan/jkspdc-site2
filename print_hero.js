const fs = require('fs');
const lines = fs.readFileSync('perfect_reconstructed_index.astro', 'utf8').split('\n');
console.log(lines.slice(500, 650).join('\n'));
