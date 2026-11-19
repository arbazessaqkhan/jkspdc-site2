const fs = require('fs');
const c = fs.readFileSync('perfect_reconstructed_index.astro', 'utf8');
const heroIdx = c.indexOf('id="home"');
console.log('Hero idx:', heroIdx);
console.log(c.slice(heroIdx, heroIdx + 1200));

const projIdx = c.indexOf('id="projects"');
console.log('\nProjects idx:', projIdx);
console.log(c.slice(projIdx, projIdx + 800));
