const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'website', 'src', 'pages', 'index.astro');
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Add Scrim & Text Shadow in Hero Slide
const oldSlideInner = `          <!-- Slide Content -->
          <div class="absolute inset-0 z-20 flex items-center">
            <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 items-center">
                <!-- Left: Title, Desc, Buttons -->
                <div class="md:col-span-3 text-white">
                  <div class="inline-flex items-center border border-white/40 bg-black/30 text-white/90 text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1 mb-3 sm:mb-4">
                    {slide.badge}
                  </div>
                  <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight" style="text-shadow: 0 2px 8px rgba(0,0,0,0.45);">
                    {slide.title}
                  </h2>
                  <p class="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white/95 max-w-xl leading-relaxed font-medium line-clamp-3 sm:line-clamp-4" style="text-shadow: 0 1px 4px rgba(0,0,0,0.65);">
                    {slide.desc}
                  </p>`;

const newSlideInner = `          <!-- Dynamic Scrim / Contrast Overlays (WCAG AA Contrast Guarantee) -->
          <div class="absolute inset-0 bg-black/35 z-10" aria-hidden="true"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent z-10" aria-hidden="true"></div>

          <!-- Slide Content -->
          <div class="absolute inset-0 z-20 flex items-center">
            <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 items-center">
                <!-- Left: Title, Desc, Buttons -->
                <div class="md:col-span-3 text-white">
                  <div class="inline-flex items-center border border-white/40 bg-black/40 text-white text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1 mb-3 sm:mb-4 rounded-xs">
                    {slide.badge}
                  </div>
                  <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h2>
                  <p class="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white/95 max-w-xl leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {slide.desc}
                  </p>`;

if (!norm.includes(oldSlideInner)) {
  console.error('oldSlideInner not found in index.astro');
  process.exit(1);
}
norm = norm.replace(oldSlideInner, newSlideInner);

// 2. Dots & Controls
const oldControls = `    <!-- Dots -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
      {heroSlides.map((_, i) => (
        <button data-dot={String(i)} class={\`h-1.5 transition-all duration-300 \${i === 0 ? 'w-10 bg-white' : 'w-4 bg-white/40'}\`} aria-label={\`Slide \${i + 1}\`}></button>
      ))}
    </div>
    <button id="hero-prev" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition border border-white/20 text-xl" aria-label="Previous">&#8249;</button>
    <button id="hero-next" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition border border-white/20 text-xl" aria-label="Next">&#8250;</button>`;

const newControls = `    <!-- Dots and Accessible Pause/Play Controls Container (WCAG 2.2.2) -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 bg-black/45 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
      <div class="flex items-center gap-2" role="tablist" aria-label="Slides">
        {heroSlides.map((_, i) => (
          <button data-dot={String(i)} class={\`h-1.5 transition-all duration-300 rounded-full \${i === 0 ? 'w-8 bg-white' : 'w-3.5 bg-white/45'}\`} aria-label={\`Slide \${i + 1}\`} role="tab" aria-selected={i === 0 ? "true" : "false"}></button>
        ))}
      </div>
      <div class="w-px h-3.5 bg-white/30" aria-hidden="true"></div>
      <!-- Hero Pause/Play Toggle Button (WCAG 2.2.2 Compliance) -->
      <button
        id="hero-pause-play"
        type="button"
        class="w-7 h-7 flex items-center justify-center rounded-full text-white hover:text-amber-300 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
        aria-label="Pause slideshow"
        aria-pressed="false"
        title="Pause slideshow"
      >
        <!-- Pause Icon -->
        <svg id="hero-pause-icon" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1"></rect>
        </svg>
        <!-- Play Icon (Hidden by default) -->
        <svg id="hero-play-icon" class="w-3.5 h-3.5 hidden" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    </div>

    <!-- Directional Navigation Arrows (Enlarged to 48px touch targets WCAG 2.5.5) -->
    <button
      id="hero-prev"
      type="button"
      class="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/75 transition-all duration-150 border border-white/25 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
      aria-label="Previous slide"
      title="Previous slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      id="hero-next"
      type="button"
      class="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/75 transition-all duration-150 border border-white/25 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
      aria-label="Next slide"
      title="Next slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </button>`;

if (!norm.includes(oldControls)) {
  console.error('oldControls not found in index.astro');
  process.exit(1);
}
norm = norm.replace(oldControls, newControls);

// 3. Script logic
const oldScript = `  function goTo(n) {
    if (total <= 1) return;

    if (slideEls[cur]) {
      slideEls[cur].classList.remove('opacity-100', 'z-10');
      slideEls[cur].classList.add('opacity-0', 'z-0', 'pointer-events-none');
    }
    if (dots[cur]) {
      dots[cur].className = 'h-1.5 transition-all duration-300 w-4 bg-white/40';
    }

    cur = ((n % total) + total) % total;

    if (slideEls[cur]) {
      var img = slideEls[cur].querySelector('img');
      if (img && img.loading === 'lazy') {
        img.loading = 'eager';
      }
      slideEls[cur].classList.remove('opacity-0', 'z-0', 'pointer-events-none');
      slideEls[cur].classList.add('opacity-100', 'z-10');
    }
    if (dots[cur]) {
      dots[cur].className = 'h-1.5 transition-all duration-300 w-10 bg-white';
    }
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      goTo(cur + 1);
    }, 6000);
  }`;

const newScript = `  var isHeroPaused = false;

  function goTo(n) {
    if (total <= 1) return;

    if (slideEls[cur]) {
      slideEls[cur].classList.remove('opacity-100', 'z-10');
      slideEls[cur].classList.add('opacity-0', 'z-0', 'pointer-events-none');
    }
    if (dots[cur]) {
      dots[cur].className = 'h-1.5 transition-all duration-300 rounded-full w-3.5 bg-white/45';
      dots[cur].setAttribute('aria-selected', 'false');
    }

    cur = ((n % total) + total) % total;

    if (slideEls[cur]) {
      var img = slideEls[cur].querySelector('img');
      if (img && img.loading === 'lazy') {
        img.loading = 'eager';
      }
      slideEls[cur].classList.remove('opacity-0', 'z-0', 'pointer-events-none');
      slideEls[cur].classList.add('opacity-100', 'z-10');
    }
    if (dots[cur]) {
      dots[cur].className = 'h-1.5 transition-all duration-300 rounded-full w-8 bg-white';
      dots[cur].setAttribute('aria-selected', 'true');
    }
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    if (isHeroPaused) return;
    timer = setInterval(function () {
      goTo(cur + 1);
    }, 6000);
  }

  // Hero Pause / Play Controls (WCAG 2.2.2)
  var pausePlayBtn = document.getElementById('hero-pause-play');
  var pauseIcon = document.getElementById('hero-pause-icon');
  var playIcon = document.getElementById('hero-play-icon');

  function toggleHeroPlayback() {
    isHeroPaused = !isHeroPaused;
    if (isHeroPaused) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (playIcon) playIcon.classList.remove('hidden');
      if (pausePlayBtn) {
        pausePlayBtn.setAttribute('aria-label', 'Play slideshow');
        pausePlayBtn.setAttribute('title', 'Play slideshow');
        pausePlayBtn.setAttribute('aria-pressed', 'true');
      }
    } else {
      startTimer();
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (pausePlayBtn) {
        pausePlayBtn.setAttribute('aria-label', 'Pause slideshow');
        pausePlayBtn.setAttribute('title', 'Pause slideshow');
        pausePlayBtn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  if (pausePlayBtn) {
    pausePlayBtn.addEventListener('click', toggleHeroPlayback);
  }

  var heroSection = document.getElementById('home');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', function () {
      if (timer) clearInterval(timer);
    });
    heroSection.addEventListener('mouseleave', function () {
      if (!isHeroPaused) {
        startTimer();
      }
    });
  }`;

if (!norm.includes(oldScript)) {
  console.error('oldScript not found in index.astro');
  process.exit(1);
}
norm = norm.replace(oldScript, newScript);

fs.writeFileSync(filePath, isCRLF ? norm.replace(/\n/g, '\r\n') : norm, 'utf8');
console.log('Successfully updated index.astro with hero contrast scrim, pause controls, and 48px arrows!');
