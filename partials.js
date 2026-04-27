/* ═══════════════════════════════════════════════════════
   partials.js — injects shared nav, player and footer
   into every page. Update once, applies everywhere.
═══════════════════════════════════════════════════════ */

(function injectPartials() {

  /* ── Ticker ─────────────────────────────────────── */
  const tickerText = 'Signature Radio UK - The Soundtrack Of Your Life - DAB Launching May 1st 2026 - Join The Revolution - Follow us @SignatureRadioUK';
  const sep = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
  // Four copies ensures no gap at any viewport width
  const tickerHTML = `
  <div class="ticker-wrap" aria-label="Station announcements">
    <div class="ticker-track" id="tickerTrack">
      <span>${tickerText}</span>${sep}<span>${tickerText}</span>${sep}<span>${tickerText}</span>${sep}<span>${tickerText}</span>${sep}
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
      <li class="nav-dashboard-item" id="navDashboardItem" style="display:none"><a href="presenter-dashboard.html" id="navDashboardLink">LIVE CHAT</a></li>
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

  // Inject presenter auth UI (bubble + panels)
  const authHTML = `
  <!-- Presenter bubble -->
  <div class="presenter-bubble" id="presenterBubble" role="complementary" aria-label="Presenter controls">
    <button class="presenter-bubble-btn" id="presenterBubbleBtn" aria-expanded="false" aria-controls="presenterLoginPanel">
      Are you a presenter? <span class="presenter-bubble-arrow">→</span>
    </button>
    <div class="presenter-bubble-loggedin" id="presenterBubbleLoggedIn" style="display:none">
      <span class="presenter-bubble-status">● ON AIR</span>
      <button class="presenter-bubble-signout" id="presenterSignOutBtn">Sign out</button>
    </div>
  </div>

  <!-- Login panel -->
  <div class="presenter-panel-overlay" id="presenterLoginPanel" hidden role="dialog" aria-modal="true" aria-labelledby="loginPanelTitle">
    <div class="presenter-panel">
      <button class="presenter-panel-close" id="presenterPanelClose" aria-label="Close">&times;</button>
      <h2 class="presenter-panel-title" id="loginPanelTitle">PRESENTER LOGIN</h2>
      <p class="presenter-panel-intro">Sign in with your Signature Radio credentials.</p>
      <form class="login-form" id="presenterLoginForm" novalidate>
        <div class="form-group">
          <label for="presenterEmail" class="form-label">Email</label>
          <input type="email" id="presenterEmail" class="form-input" autocomplete="email" required placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label for="presenterPassword" class="form-label">Password</label>
          <input type="password" id="presenterPassword" class="form-input" autocomplete="current-password" required placeholder="••••••••" />
        </div>
        <p class="login-error" id="presenterLoginError" role="alert" aria-live="polite"></p>
        <button type="submit" class="btn-primary" id="presenterLoginBtn">SIGN IN</button>
      </form>
    </div>
  </div>

  <!-- Password setup panel (shown when invite token detected in URL) -->
  <div class="presenter-panel-overlay" id="presenterSetupPanel" hidden role="dialog" aria-modal="true" aria-labelledby="setupPanelTitle">
    <div class="presenter-panel">
      <h2 class="presenter-panel-title" id="setupPanelTitle">SET YOUR PASSWORD</h2>
      <p class="presenter-panel-intro">Welcome to Signature Radio. Choose a password to complete your account setup.</p>
      <form class="login-form" id="presenterSetupForm" novalidate>
        <div class="form-group">
          <label for="setupPassword" class="form-label">New password</label>
          <input type="password" id="setupPassword" class="form-input" autocomplete="new-password" required placeholder="••••••••" minlength="8" />
        </div>
        <div class="form-group">
          <label for="setupPasswordConfirm" class="form-label">Confirm password</label>
          <input type="password" id="setupPasswordConfirm" class="form-input" autocomplete="new-password" required placeholder="••••••••" />
        </div>
        <p class="login-error" id="presenterSetupError" role="alert" aria-live="polite"></p>
        <button type="submit" class="btn-primary" id="presenterSetupBtn">SET PASSWORD &amp; SIGN IN</button>
      </form>
    </div>
  </div>`;

  const authMount = document.createElement('div');
  authMount.innerHTML = authHTML;
  document.body.appendChild(authMount);

  // Highlight active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Show the Dashboard nav link if a presenter session exists in localStorage.
  // presenter-auth.js manages the full Supabase session; this is a fast
  // synchronous check so the link appears without waiting for the SDK.
  (function syncDashboardLink() {
    const item = document.getElementById('navDashboardItem');
    if (!item) return;
    try {
      // Supabase stores its session under a key matching this pattern
      const keys = Object.keys(localStorage).filter(function (k) {
        return k.startsWith('sb-') && k.endsWith('-auth-token');
      });
      if (keys.length > 0) {
        const session = JSON.parse(localStorage.getItem(keys[0]));
        if (session && session.access_token) {
          item.style.display = '';
        }
      }
    } catch (e) {
      // localStorage unavailable or parse error — leave link hidden
    }
  })();

})();
