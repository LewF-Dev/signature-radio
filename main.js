/* ═══════════════════════════════════════════════════════
   Signature Radio UK — main.js
═══════════════════════════════════════════════════════ */

/* ── Visit Counter ────────────────────────────────────
   Increments the shared counter once per browser session.
   sessionStorage prevents repeat increments on refresh.
   localStorage caches the last known count so the display
   is never blank while the fetch is in flight.
─────────────────────────────────────────────────────── */
(function initVisitCounter() {
  const SEED        = 292560;
  const CACHE_KEY   = 'sruk_visits_cache';
  const SESSION_KEY = 'sruk_counted';
  const el          = document.getElementById('visitCounter');

  if (!el) return;

  // Show cached value immediately so the counter isn't blank on load
  const cached = parseInt(localStorage.getItem(CACHE_KEY), 10);
  el.textContent = (isNaN(cached) || cached < SEED)
    ? SEED.toLocaleString('en-GB')
    : cached.toLocaleString('en-GB');

  // Only increment once per browser session
  if (sessionStorage.getItem(SESSION_KEY)) return;
  sessionStorage.setItem(SESSION_KEY, '1');

  fetch('/api/counter')
    .then(function (res) {
      if (!res.ok) throw new Error('Network response not ok');
      return res.json();
    })
    .then(function (data) {
      const count = data.count || SEED;
      el.textContent = count.toLocaleString('en-GB');
      localStorage.setItem(CACHE_KEY, count);
    })
    .catch(function () {
      // Silently keep the cached/seed value on failure
    });
})();


/* ── Slideshow ────────────────────────────────────────
   Fade transition between slides. Auto-advances every 8s.
   Pauses on hover. Arrow keys, swipe, and dot navigation.
─────────────────────────────────────────────────────── */
(function initSlideshow() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const slides   = Array.from(slideshow.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('slideshowDots');
  const prevBtn  = document.getElementById('slideshowPrev');
  const nextBtn  = document.getElementById('slideshowNext');
  const INTERVAL = 8000;
  const SWIPE_THRESHOLD = 40; // px

  if (!slides.length) return;

  let current = 0;
  let timer;
  let touchStartX = 0;

  // Build dot indicators
  const dots = slides.map(function (_, i) {
    const dot = document.createElement('button');
    dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { stopTimer(); goTo(i); startTimer(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    timer = setInterval(next, INTERVAL);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { stopTimer(); prev(); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { stopTimer(); next(); startTimer(); });

  // Pause auto-advance on hover
  slideshow.addEventListener('mouseenter', stopTimer);
  slideshow.addEventListener('mouseleave', startTimer);

  // Keyboard navigation
  slideshow.setAttribute('tabindex', '0');
  slideshow.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { stopTimer(); prev(); startTimer(); }
    if (e.key === 'ArrowRight') { stopTimer(); next(); startTimer(); }
  });

  // Swipe support
  slideshow.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slideshow.addEventListener('touchend', function (e) {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    stopTimer();
    if (delta < 0) next(); else prev();
    startTimer();
  }, { passive: true });

  startTimer();
})();

/* ── Mobile Nav Toggle ────────────────────────────── */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is tapped on mobile
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ── Live Player ──────────────────────────────────────
   Plays the live Shoutcast stream. Fetches now-playing
   metadata from /api/nowplaying on load and every 30s.
─────────────────────────────────────────────────────── */
(function initPlayer() {
  const btn        = document.getElementById('playerBtn');
  const label      = document.getElementById('playerBtnLabel');
  const trackEl    = document.getElementById('playerTrack');
  const audio      = document.getElementById('liveAudio');
  const slider     = document.getElementById('volumeSlider');

  if (!btn || !audio) return;

  function setPlayIcon() {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    svg.innerHTML = '<polygon points="5,3 19,12 5,21" fill="currentColor"/>';
  }

  function setPauseIcon() {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    svg.innerHTML = '<rect x="5" y="3" width="4" height="18" fill="currentColor"/><rect x="15" y="3" width="4" height="18" fill="currentColor"/>';
  }

  // Fetch now-playing metadata and update the player track display
  function fetchNowPlaying() {
    fetch('/api/nowplaying')
      .then(function (res) {
        if (!res.ok) throw new Error('nowplaying fetch failed');
        return res.json();
      })
      .then(function (data) {
        if (trackEl && data.title) {
          trackEl.textContent = data.title;
          trackEl.title = data.title;
        }
      })
      .catch(function () {
        // Keep existing track display on failure
      });
  }

  // Poll on load and every 30 seconds
  fetchNowPlaying();
  setInterval(fetchNowPlaying, 30000);

  let playing = false;

  btn.addEventListener('click', function () {
    if (!playing) {
      audio.play().then(function () {
        playing = true;
        label.textContent = 'PAUSE';
        btn.setAttribute('aria-label', 'Pause live stream');
        setPauseIcon();
      }).catch(function () {
        label.textContent = 'ERROR';
      });
    } else {
      audio.pause();
      playing = false;
      label.textContent = 'LISTEN';
      btn.setAttribute('aria-label', 'Play live stream');
      setPlayIcon();
    }
  });

  // If the stream stalls or errors, reset the button state
  audio.addEventListener('error', function () {
    playing = false;
    label.textContent = 'LISTEN';
    setPlayIcon();
  });

  // Volume slider
  if (slider) {
    // Restore last saved volume
    const saved = parseFloat(localStorage.getItem('sruk_volume'));
    if (!isNaN(saved)) {
      audio.volume = saved;
      slider.value = saved;
    }

    slider.addEventListener('input', function () {
      audio.volume = parseFloat(slider.value);
      localStorage.setItem('sruk_volume', slider.value);
    });
  }
})();
