/* ═══════════════════════════════════════════════════════
   Signature Radio UK — main.js
═══════════════════════════════════════════════════════ */

/* ── Visit Counter ────────────────────────────────────
   Persists in localStorage. Seeded at 292560.
   Increments once per browser session (sessionStorage flag).
   NOTE: This is a per-device counter. For a true cross-user
   live counter, replace with a backend API call (e.g. a
   serverless function writing to a KV store or database).
─────────────────────────────────────────────────────── */
(function initVisitCounter() {
  const SEED      = 292560;
  const STORE_KEY = 'sruk_visits';
  const FLAG_KEY  = 'sruk_visited_this_session';

  let count = parseInt(localStorage.getItem(STORE_KEY), 10);

  if (isNaN(count) || count < SEED) {
    count = SEED;
  }

  // Only increment once per browser session
  if (!sessionStorage.getItem(FLAG_KEY)) {
    count += 1;
    localStorage.setItem(STORE_KEY, count);
    sessionStorage.setItem(FLAG_KEY, '1');
  }

  const el = document.getElementById('visitCounter');
  if (el) {
    el.textContent = count.toLocaleString('en-GB');
  }
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
