/* ═══════════════════════════════════════════════════════
   Signature Radio UK — main.js
═══════════════════════════════════════════════════════ */

/* ── Visit Counter ────────────────────────────────────
   Fetches from /api/counter (Netlify Function + Upstash).
   The function increments the shared counter on every call
   and returns the current value. localStorage is used only
   to show a number instantly on load while the request is
   in flight — it is overwritten with the real value once
   the response arrives.
─────────────────────────────────────────────────────── */
(function initVisitCounter() {
  const SEED      = 292560;
  const CACHE_KEY = 'sruk_visits_cache';
  const el        = document.getElementById('visitCounter');

  if (!el) return;

  // Show cached value immediately so the counter isn't blank on load
  const cached = parseInt(localStorage.getItem(CACHE_KEY), 10);
  el.textContent = (isNaN(cached) || cached < SEED)
    ? SEED.toLocaleString('en-GB')
    : cached.toLocaleString('en-GB');

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
   Toggles play/pause on the HTML5 audio element.
   Swap the <source src=""> in index.html for the real
   stream URL when available.
─────────────────────────────────────────────────────── */
(function initPlayer() {
  const btn   = document.getElementById('playerBtn');
  const label = document.getElementById('playerBtnLabel');
  const audio = document.getElementById('liveAudio');

  if (!btn || !audio) return;

  // SVG namespace needed to replace the icon element
  const NS = 'http://www.w3.org/2000/svg';

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

  let playing = false;

  btn.addEventListener('click', function () {
    // No stream configured yet
    const src = audio.querySelector('source') && audio.querySelector('source').getAttribute('src');
    if (!src) {
      label.textContent = 'SOON';
      btn.title = 'Stream URL coming soon — check back shortly';
      return;
    }

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
})();
