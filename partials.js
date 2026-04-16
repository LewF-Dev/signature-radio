/* ═══════════════════════════════════════════════════════
   partials.js — injects shared nav, player and footer
   into every page. Update once, applies everywhere.
═══════════════════════════════════════════════════════ */

(function injectPartials() {

  /* ── Ticker ─────────────────────────────────────── */
  const tickerHTML = `
  <div class="ticker-wrap" aria-label="Station announcements">
    <div class="ticker-track" id="tickerTrack">
      <span>Signature Radio UK</span>
      <span class="ticker-sep">✦</span>
      <span>The Soundtrack Of Your Life</span>
      <span class="ticker-sep">✦</span>
      <span>DAB Launching May 1st 2026 — Join The Revolution</span>
      <span class="ticker-sep">✦</span>
      <span>Broadcasting across Bristol, North Somerset &amp; South Gloucestershire</span>
      <span class="ticker-sep">✦</span>
      <span>Reaching 1.2 Million People</span>
      <span class="ticker-sep">✦</span>
      <span>Signature Radio UK</span>
      <span class="ticker-sep">✦</span>
      <span>The Soundtrack Of Your Life</span>
      <span class="ticker-sep">✦</span>
      <span>DAB Launching May 1st 2026 — Join The Revolution</span>
      <span class="ticker-sep">✦</span>
      <span>Broadcasting across Bristol, North Somerset &amp; South Gloucestershire</span>
      <span class="ticker-sep">✦</span>
      <span>Reaching 1.2 Million People</span>
      <span class="ticker-sep">✦</span>
    </div>
  </div>`;

  /* ── Nav ─────────────────────────────────────────── */
  const navHTML = `
  <nav class="nav-bar" role="navigation" aria-label="Main navigation">
    <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="navLinks" role="list">
      <li><a href="index.html">HOME</a></li>
      <li><a href="about.html">ABOUT US</a></li>
      <li><a href="newsletter.html">NEWSLETTER</a></li>
      <li><a href="presenters.html">PRESENTERS</a></li>
      <li><a href="schedule.html">SCHEDULE</a></li>
      <li><a href="business.html">BUSINESS</a></li>
      <li><a href="contact.html">CONTACT</a></li>
    </ul>
    <div class="player-widget" id="playerWidget">
      <div class="player-meta">
        <span class="player-label">NOW PLAYING</span>
        <span class="player-track" id="playerTrack">Signature Radio UK</span>
      </div>
      <button class="player-btn" id="playerBtn" aria-label="Play live stream">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5,3 19,12 5,21" id="playIcon"/>
        </svg>
        <span id="playerBtnLabel">LISTEN</span>
      </button>
      <div class="volume-control" id="volumeControl" aria-label="Volume">
        <svg class="volume-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input type="range" id="volumeSlider" class="volume-slider" min="0" max="1" step="0.05" value="1" aria-label="Volume" />
      </div>
      <audio id="liveAudio" preload="none">
        <source src="https://centova87.shoutcastservices.com/proxy/reid/stream" type="audio/mpeg" />
      </audio>
    </div>
  </nav>`;

  /* ── Footer ──────────────────────────────────────── */
  const footerHTML = `
  <footer class="footer" role="contentinfo">
    <div class="container footer-grid">
      <div class="footer-col">
        <p class="footer-brand">SIGNATURE RADIO UK</p>
        <p><strong>Contact:</strong> 07885 297391</p>
        <p><strong>Email:</strong> <a href="mailto:studio@signatureradio.uk">studio@signatureradio.uk</a></p>
        <address>
          <strong>Address:</strong><br />
          145–147 East Street,<br />
          Bedminster, Bristol, BS3 4EJ
        </address>
      </div>
      <div class="footer-col footer-right">
        <p class="footer-tagline"><em>The Soundtrack Of Your Life</em></p>
        <p>Registered in England &amp; Wales</p>
        <p>Company Registration Number: 15051646</p>
        <p><em>Licensed via PRS and PPL</em></p>
        <p class="footer-copy">&copy; 2026 Signature Radio UK</p>
      </div>
    </div>
  </footer>`;

  // Inject ticker before body content
  const tickerTarget = document.getElementById('ticker-mount');
  if (tickerTarget) tickerTarget.outerHTML = tickerHTML;

  // Inject nav
  const navTarget = document.getElementById('nav-mount');
  if (navTarget) navTarget.outerHTML = navHTML;

  // Inject footer
  const footerTarget = document.getElementById('footer-mount');
  if (footerTarget) footerTarget.outerHTML = footerHTML;

  // Highlight active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

})();
