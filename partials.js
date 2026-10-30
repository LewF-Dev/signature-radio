/* ═══════════════════════════════════════════════════════
   partials.js — injects shared nav, player and footer
   into every page. Update once, applies everywhere.
═══════════════════════════════════════════════════════ */

(function injectPartials() {

  /* ── Ticker ─────────────────────────────────────── */
  const tickerText = 'Signature Radio UK - The Soundtrack Of Your Life - Now Live on DAB Digital Radio - Join The Revolution - Follow us @SignatureRadioUK';
  const sep = '\u00a0\u00a0\u00a0\u00a0\u00a0';
  // Six copies ensures the track is always wider than the viewport at any screen size.
  // JS measures one unit and animates exactly that distance for a seamless loop.
  const tickerHTML = `
  <div class="ticker-wrap" aria-label="Station announcements">
    <div class="ticker-track" id="tickerTrack">
      <span class="ticker-unit">${tickerText}${sep}</span><span class="ticker-unit">${tickerText}${sep}</span><span class="ticker-unit">${tickerText}${sep}</span><span class="ticker-unit">${tickerText}${sep}</span><span class="ticker-unit">${tickerText}${sep}</span><span class="ticker-unit">${tickerText}${sep}</span>
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
      <li><a href="store.html">STORE</a></li>
      <li><a href="business.html">BUSINESS</a></li>
      <li><a href="contact.html">CONTACT</a></li>
      <li class="nav-phone-presenter-item" id="navPhonePresenterItem"><div class="hero-phone-presenter-slot" id="heroPhonePresenterSlot"></div></li>
      <li><a href="https://drive.google.com/drive/folders/1xrrHW_wQUVmA8ssQkFez8WtezYM5hQze" target="_blank" rel="noopener">ARCHIVE</a></li>
      <li class="nav-dashboard-item" id="navDashboardItem"><a href="presenter-dashboard.html" id="navDashboardLink">LIVE CHAT</a></li>
    </ul>
    <div class="nav-presenter-slot" id="navPresenterSlot" aria-label="Presenter access"></div>
    <div class="player-widget" id="playerWidget">
      <div class="player-meta">
        <span class="player-label">NOW PLAYING</span>
        <div class="player-track-wrap">
          <span class="player-track" id="playerTrackA">Signature Radio UK</span>
        </div>
        <span class="player-show" id="playerShowA" hidden></span>
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
      <audio id="liveAudio" preload="none" crossorigin="anonymous">
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
        <p><strong>Contact:</strong> 0117 442 0922</p>
        <p><strong>Email:</strong> <a href="mailto:studio@signatureradio.uk" target="_blank" rel="noopener">studio@signatureradio.uk</a></p>
        <address>
          <strong>Address:</strong><br />
          145–147 East Street,<br />
          Bedminster, Bristol, BS3 4EJ
        </address>
      </div>
      <div class="footer-col footer-right">
        <p class="footer-tagline"><em>The Soundtrack Of Your Life</em></p>
        <p>Registered in England &amp; Wales</p>
        <p>Company Registration Number: 15051546</p>
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

  // Persistent phone controls sit after the ticker. On the homepage the
  // masthead overlaps the hero image; on inner pages it becomes a compact bar.
  const phoneMasthead = document.createElement('div');
  phoneMasthead.className = 'page-phone-masthead';
  phoneMasthead.innerHTML = `
    <div class="hero-phone-control-row" id="pagePhoneControlRow">
      <div class="hero-phone-menu-slot" id="pagePhoneMenuSlot"></div>
      <div class="hero-phone-logo-slot" id="pagePhoneLogoSlot">
        <a class="hero-phone-home-link" href="index.html" aria-label="Signature Radio UK home">
          <div class="hero-logo-frame"><img src="signature-radio-logo-2-white_transparent_background.png" alt="" class="hero-logo" /></div>
        </a>
      </div>
      <div class="hero-phone-player-slot" id="pagePhonePlayerSlot"></div>
      <div class="hero-phone-menu-panel" id="pagePhoneMenuPanel" role="navigation" aria-label="Main navigation" aria-hidden="true" inert></div>
    </div>`;
  const ticker = document.querySelector('.ticker-wrap');
  if (ticker && ticker.parentNode) ticker.parentNode.insertBefore(phoneMasthead, ticker.nextSibling);

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

  syncPhoneHeroNav();
  syncPresenterPlacement();
  window.addEventListener('resize', function () {
    syncPhoneHeroNav();
    syncPresenterPlacement();
  });

  // Highlight active nav link based on current page
  syncActiveNav();

  // Show the Dashboard nav link if a presenter session exists in localStorage.
  // presenter-auth.js manages the full Supabase session; this is a fast
  // synchronous check so the link appears without waiting for the SDK.
  syncDashboardLink();

  // Expose sync helpers so router.js can call them after each navigation
  window.SRUK = window.SRUK || {};
  window.SRUK.syncActiveNav    = syncActiveNav;
  window.SRUK.syncDashboardLink = syncDashboardLink;
  window.SRUK.syncPresenterPlacement = syncPresenterPlacement;

  function syncActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      const aPage = href.split('/').pop() || 'index.html';
      a.classList.toggle('active', aPage === page);
    });
  }

  function syncDashboardLink() {
    const item = document.getElementById('navDashboardItem');
    if (!item) return;
    const keys = Object.keys(localStorage).filter(function (k) {
      return k.startsWith('sb-') && k.endsWith('-auth-token');
    });
    const hasSession = keys.length > 0 && (function () {
      try { return !!JSON.parse(localStorage.getItem(keys[0]))?.access_token; } catch (e) { return false; }
    })();
    item.style.display = hasSession ? '' : 'none';
  }

  function syncPresenterPlacement() {
    const bubble = document.getElementById('presenterBubble');
    const slot = document.getElementById('navPresenterSlot');
    if (!bubble || !slot) return;

    const phoneMenuSlot = document.getElementById('heroPhonePresenterSlot');
    const usePhoneHero = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
    const shouldUseNav = window.matchMedia('(max-width: 1024px)').matches;
    if (usePhoneHero && phoneMenuSlot) {
      if (bubble.parentNode !== phoneMenuSlot) phoneMenuSlot.appendChild(bubble);
    } else if (shouldUseNav) {
      if (bubble.parentNode !== slot) slot.appendChild(bubble);
    } else if (bubble.parentNode !== authMount) {
      authMount.insertBefore(bubble, authMount.firstChild);
    }
  }

  function syncPhoneHeroNav() {
    const nav = document.querySelector('.nav-bar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const presenterSlot = document.getElementById('navPresenterSlot');
    const player = document.getElementById('playerWidget');
    const playerMeta = player ? player.querySelector('.player-meta') : null;
    const heroNowPlayingMeta = document.getElementById('heroNowPlayingMeta');
    const heroNowPlaying = document.getElementById('heroNowPlayingSlot');
    const controlRow = document.getElementById('pagePhoneControlRow');
    const menuSlot = document.getElementById('pagePhoneMenuSlot');
    const playerSlot = document.getElementById('pagePhonePlayerSlot');
    const menuPanel = document.getElementById('pagePhoneMenuPanel');

    if (!nav || !toggle || !links || !presenterSlot || !player ||
        !controlRow || !menuSlot || !playerSlot || !menuPanel) return;

    const usePhoneHero = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
    if (usePhoneHero) {
      if (toggle.parentNode !== menuSlot) menuSlot.appendChild(toggle);
      if (player.parentNode !== playerSlot) playerSlot.appendChild(player);
      if (playerMeta && heroNowPlayingMeta && playerMeta.parentNode !== heroNowPlayingMeta) {
        heroNowPlayingMeta.appendChild(playerMeta);
      }
      const audio = player.querySelector('audio');
      if (heroNowPlaying && audio) heroNowPlaying.classList.toggle('is-playing', !audio.paused);
      if (links.parentNode !== menuPanel) menuPanel.appendChild(links);
      const menuOpen = links.classList.contains('open');
      menuPanel.classList.toggle('is-open', menuOpen);
      menuPanel.setAttribute('aria-hidden', menuOpen ? 'false' : 'true');
      menuPanel.inert = !menuOpen;
      return;
    }

    if (toggle.parentNode !== nav) nav.appendChild(toggle);
    if (links.parentNode !== nav) nav.appendChild(links);
    if (presenterSlot.parentNode !== nav) nav.appendChild(presenterSlot);
    if (player.parentNode !== nav) nav.appendChild(player);
    if (playerMeta && playerMeta.parentNode !== player) player.insertBefore(playerMeta, player.firstChild);
    menuPanel.classList.remove('is-open');
    menuPanel.setAttribute('aria-hidden', 'true');
    menuPanel.inert = true;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
  }

})();
