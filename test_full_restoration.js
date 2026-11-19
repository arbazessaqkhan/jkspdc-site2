const fs = require('fs');
const { execSync } = require('child_process');

console.log('1. Setting up clean base and applying step454 patch...');
execSync('git checkout 080656f -- website/src/pages/index.astro');
execSync('git apply step454_clean.patch');

// Copy ProjectCard_exact.astro to website/src/components/ProjectCard.astro
fs.copyFileSync('ProjectCard_exact.astro', 'website/src/components/ProjectCard.astro');

// Apply ticker_exact.patch to website/src/components/Ticker.astro
execSync('git checkout 080656f -- website/src/components/Ticker.astro');
execSync('git apply ticker_exact.patch');

console.log('2. Reading index.astro...');
let content = fs.readFileSync('website/src/pages/index.astro', 'utf8').replace(/\r\n/g, '\n');

// 3. Apply the project cards import & wiring
if (!content.includes("import ProjectCard from '../components/ProjectCard.astro';")) {
  content = content.replace(
    "import Layout from '../layouts/Layout.astro';",
    "import Layout from '../layouts/Layout.astro';\nimport ProjectCard from '../components/ProjectCard.astro';"
  );
}

// 4. Check hero section styling from step 830
// In step 830, hero slide card was styled with official portal style (radial gradient, BHEP, orange bar, etc.)
// Let's verify what hero section exists in content right now
console.log('Hero section has BHEP styling?', content.includes('Dam Site') || content.includes('rounded-2xl max-w-xl'));

// 5. Apply the standardized section spacings from walkthrough_section_spacings.md:
// - Page body container: py-10 sm:py-12 lg:py-14 space-y-10 sm:space-y-12 lg:space-y-14
content = content.replace(
  'class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14"',
  'class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 space-y-10 sm:space-y-12 lg:space-y-14"'
);

// Save candidate file
fs.writeFileSync('website/src/pages/index.astro', content);
console.log('Saved website/src/pages/index.astro.');

// 6. Test astro build
console.log('Testing Astro build in website/...');
try {
  const buildOut = execSync('npm run build', { cwd: 'website', encoding: 'utf8' });
  console.log('BUILD SUCCESSFUL:\n', buildOut.slice(-300));
} catch (err) {
  console.error('BUILD FAILED:\n', err.stdout || err.message);
}

// Revert index.astro and Ticker.astro until plan is approved by user
execSync('git checkout 080656f -- website/src/pages/index.astro website/src/components/Ticker.astro');
