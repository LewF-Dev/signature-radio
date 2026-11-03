/* ═══════════════════════════════════════════════════════
   partials.js — injects shared nav, player and footer
   into every page. Update once, applies everywhere.
═══════════════════════════════════════════════════════ */

(function injectPartials() {

  // Keep larger touch tablets in the same composition when rotated.
  const tabletLayoutQuery = window.matchMedia('(min-width: 768px) and (max-width: 1024px), (min-width: 768px) and (max-width: 1366px) and (pointer: coarse)');
  const landscapePhoneQuery = window.matchMedia('(max-width: 1024px) and (max-height: 520px) and (orientation: landscape)');

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
  const navIconPaths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    newsletter: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    presenters: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0m-7 7v4m-4 0h8"/>',
    schedule: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 4h2m4 0h2m-8 4h2"/>',
    store: '<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    business: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18m-11 0v2h4v-2"/>',
    contact: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    archive: '<path d="M3 4h18v5H3zM5 9v11h14V9m-9 4h4"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'
  };
  const navIcon = function (name) {
    return `<svg class="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${navIconPaths[name]}</svg>`;
  };
  const navHTML = `
  <nav class="nav-bar" role="navigation" aria-label="Main navigation">
    <a class="nav-brand-home" href="/home" aria-label="Home" title="Home"><img src="favicon.png?v=transparent-v2-20261103" alt="" aria-hidden="true"></a>
    <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="navLinks" role="list">
      <li class="nav-home-menu-item"><a href="/home"><span class="nav-link-content">${navIcon('home')}<span class="nav-link-label">HOME</span></span></a></li>
      <li><a href="/about"><span class="nav-link-content">${navIcon('about')}<span class="nav-link-label">ABOUT US</span></span></a></li>
      <li><a href="/newsletter"><span class="nav-link-content">${navIcon('newsletter')}<span class="nav-link-label">NEWSLETTER</span></span></a></li>
      <li><a href="/presenters"><span class="nav-link-content">${navIcon('presenters')}<span class="nav-link-label">PRESENTERS</span></span></a></li>
      <li><a href="/schedule"><span class="nav-link-content">${navIcon('schedule')}<span class="nav-link-label">SCHEDULE</span></span></a></li>
      <li><a href="/store"><span class="nav-link-content">${navIcon('store')}<span class="nav-link-label">STORE</span></span></a></li>
      <li><a href="/business"><span class="nav-link-content">${navIcon('business')}<span class="nav-link-label">BUSINESS</span></span></a></li>
      <li><a href="/contact"><span class="nav-link-content">${navIcon('contact')}<span class="nav-link-label">CONTACT</span></span></a></li>
      <li><a href="https://drive.google.com/drive/folders/1xrrHW_wQUVmA8ssQkFez8WtezYM5hQze" target="_blank" rel="noopener"><span class="nav-link-content">${navIcon('archive')}<span class="nav-link-label">ARCHIVE</span></span></a></li>
      <li class="nav-dashboard-item" id="navDashboardItem"><a href="/live-chat" id="navDashboardLink"><span class="nav-link-content">${navIcon('chat')}<span class="nav-link-label">LIVE CHAT</span></span></a></li>
    </ul>
    <div class="player-widget" id="playerWidget">
      <div class="player-meta">
        <span class="player-label">NOW PLAYING</span>
        <div class="player-track-wrap">
          <span class="player-track" id="playerTrackA" aria-label="Signature Radio UK"><span class="player-track-copy">Signature Radio UK</span><span class="player-track-copy player-track-copy--duplicate" aria-hidden="true">Signature Radio UK</span></span>
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
        <a class="hero-phone-home-link" href="/home" aria-label="Signature Radio UK home">
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

  // A versioned, once-per-visitor notice survives SPA navigation without blocking listening.
  (function initExperienceNotice() {
    const noticeVersion = 'site-refinements-v9';
    const storageKey = 'sruk_experience_notice';

    function hasSeenNotice() {
      try { if (localStorage.getItem(storageKey) === noticeVersion) return true; } catch (error) {}
      try { return sessionStorage.getItem(storageKey) === noticeVersion; } catch (error) { return false; }
    }

    function rememberNotice() {
      try { localStorage.setItem(storageKey, noticeVersion); } catch (error) {}
      try { sessionStorage.setItem(storageKey, noticeVersion); } catch (error) {}
    }

    if (hasSeenNotice()) return;

    const notice = document.createElement('aside');
    notice.className = 'experience-notice';
    notice.id = 'experienceNotice';
    notice.hidden = true;
    notice.setAttribute('aria-label', 'Site improvements');
    notice.innerHTML = `
      <div class="experience-notice-copy" role="status" aria-live="polite">
        <h2>Always improving</h2>
        <p>Expect occasional updates as we refine the site and make your Signature Radio experience even better.</p>
      </div>
      <button class="experience-notice-dismiss" type="button" aria-label="Close site update">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>`;

    const phoneNoticeQuery = window.matchMedia('(max-width: 767px)');
    function placeNotice() {
      const announcement = document.querySelector('.home-page #siteHero + main .announcement');
      if (phoneNoticeQuery.matches && announcement) {
        notice.classList.add('is-in-flow');
        announcement.parentNode.insertBefore(notice, announcement);
      } else {
        notice.classList.remove('is-in-flow');
        if (notice.parentNode !== document.body) document.body.appendChild(notice);
      }
    }
    placeNotice();
    phoneNoticeQuery.addEventListener('change', placeNotice);

    let dismissTimer = 0;
    let remainingTime = 14000;
    let countdownStarted = 0;
    let dismissing = false;

    function pauseCountdown() {
      if (!dismissTimer) return;
      window.clearTimeout(dismissTimer);
      dismissTimer = 0;
      remainingTime = Math.max(0, remainingTime - (Date.now() - countdownStarted));
    }

    function dismissNotice() {
      if (notice.hidden || dismissing) return;
      pauseCountdown();
      dismissing = true;
      notice.classList.add('is-dismissing');
      // Return keyboard focus to the page without moving the viewport.
      if (notice.contains(document.activeElement)) notice.querySelector('button').blur();
      const exitDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 :
        (notice.classList.contains('is-in-flow') ? 180 : 250);
      window.setTimeout(function () { notice.hidden = true; }, exitDelay);
    }

    function resumeCountdown() {
      if (notice.hidden || dismissing || dismissTimer || document.visibilityState === 'hidden' ||
          notice.matches(':hover, :focus-within')) return;
      countdownStarted = Date.now();
      dismissTimer = window.setTimeout(dismissNotice, remainingTime);
    }

    function showNotice() {
      // Another open tab may already have shown this version.
      if (hasSeenNotice()) return;
      const blocked = document.visibilityState === 'hidden' ||
        document.body.classList.contains('mobile-nav-open') ||
        document.querySelector('dialog[open], .modal-overlay:not([hidden]), .presenter-panel-overlay:not([hidden])');
      if (blocked) {
        window.setTimeout(showNotice, 1500);
        return;
      }
      notice.hidden = false;
      placeNotice();
      rememberNotice();
      resumeCountdown();
    }

    notice.querySelector('button').addEventListener('click', dismissNotice);
    notice.addEventListener('mouseenter', pauseCountdown);
    notice.addEventListener('mouseleave', resumeCountdown);
    notice.addEventListener('focusin', pauseCountdown);
    notice.addEventListener('focusout', function () { window.setTimeout(resumeCountdown, 0); });
    notice.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') dismissNotice();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') pauseCountdown();
      else resumeCountdown();
    });
    window.setTimeout(showNotice, 3500);
  })();

  // Inject presenter auth UI (bubble + panels)
  const authHTML = `
  <!-- Presenter bubble -->
  <div class="presenter-bubble" id="presenterBubble" role="complementary" aria-label="Presenter controls">
    <button class="presenter-bubble-btn" id="presenterBubbleBtn" aria-expanded="false" aria-controls="presenterLoginPanel">
      <span class="presenter-bubble-content">
        <span class="presenter-bubble-icon" aria-hidden="true">
          <img src="assets/dj-logo-white.png" alt="" width="44" height="44" />
        </span>
        <span class="presenter-bubble-label">Presenter login</span>
      </span>
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

  initPresenterFooterAvoidance();
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
  window.SRUK.syncPhoneHeroNav = syncPhoneHeroNav;

  function syncActiveNav() {
    const routeFor = function (url) {
      const segment = new URL(url, window.location.href).pathname.split('/').filter(Boolean).pop() || 'home';
      if (segment === 'index' || segment === 'index.html') return 'home';
      return segment.replace(/\.html$/, '');
    };
    const page = routeFor(window.location.href);
    const brandHome = document.querySelector('.nav-brand-home');
    if (brandHome) brandHome.classList.toggle('active', page === 'home');
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      const aPage = routeFor(href);
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
    if (!bubble) return;

    const label = bubble.querySelector('.presenter-bubble-label');
    if (label) label.textContent = 'Presenter login';
    if (bubble.parentNode !== authMount) authMount.insertBefore(bubble, authMount.firstChild);
  }

  function initPresenterFooterAvoidance() {
    const footer = document.querySelector('.footer');
    const bubble = document.getElementById('presenterBubble');
    if (!footer || !bubble || !('IntersectionObserver' in window)) return;

    let tabArrivalTimer = 0;
    let tabDepartureTimer = 0;
    let buttonArrivalTimer = 0;
    let scrollSyncScheduled = false;

    function syncFooterBubbleMode() {
      const footerBounds = footer.getBoundingClientRect();
      const footerIsVisible = footerBounds.top < window.innerHeight && footerBounds.bottom > 0;
      const useCompactDock = footerIsVisible && window.matchMedia('(max-width: 767px)').matches;

      footer.classList.toggle('has-presenter-login', useCompactDock);

      if (useCompactDock) {
        window.clearTimeout(tabArrivalTimer);
        window.clearTimeout(tabDepartureTimer);
        window.clearTimeout(buttonArrivalTimer);
        bubble.classList.remove('is-slinging-away', 'is-tab-slinging-away', 'is-button-peeking');
        bubble.classList.add('is-footer-visible', 'is-footer-mobile-dock');
        bubble.style.setProperty('--presenter-footer-top', (footerBounds.top + window.scrollY + 12) + 'px');
      } else if (footerIsVisible) {
        window.clearTimeout(tabDepartureTimer);
        window.clearTimeout(buttonArrivalTimer);
        bubble.classList.remove('is-footer-mobile-dock');
        bubble.classList.remove('is-tab-slinging-away', 'is-button-peeking');
        bubble.style.removeProperty('--presenter-footer-top');

        const alreadyInTabMode = bubble.classList.contains('is-footer-visible');
        const alreadySlinging = bubble.classList.contains('is-slinging-away');
        if (!alreadyInTabMode && !alreadySlinging) {
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reducedMotion) {
            bubble.classList.add('is-footer-visible');
          } else {
            bubble.classList.add('is-slinging-away');
            tabArrivalTimer = window.setTimeout(function () {
              bubble.classList.remove('is-slinging-away');
              bubble.classList.add('is-footer-visible');
            }, 620);
          }
        }
      } else {
        window.clearTimeout(tabArrivalTimer);
        if (bubble.classList.contains('is-slinging-away')) {
          bubble.classList.remove('is-slinging-away');
        }
        bubble.classList.remove('is-footer-mobile-dock');
        bubble.style.removeProperty('--presenter-footer-top');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
          window.clearTimeout(tabDepartureTimer);
          window.clearTimeout(buttonArrivalTimer);
          bubble.classList.remove('is-tab-slinging-away', 'is-button-peeking', 'is-footer-visible');
        } else if (bubble.classList.contains('is-footer-visible') && !bubble.classList.contains('is-tab-slinging-away')) {
          window.clearTimeout(tabDepartureTimer);
          window.clearTimeout(buttonArrivalTimer);
          bubble.classList.add('is-tab-slinging-away');
          tabDepartureTimer = window.setTimeout(function () {
            bubble.classList.remove('is-tab-slinging-away', 'is-footer-visible');
            bubble.classList.add('is-button-peeking');
            buttonArrivalTimer = window.setTimeout(function () {
              bubble.classList.remove('is-button-peeking');
            }, 560);
          }, 480);
        }
      }
    }

    const footerObserver = new IntersectionObserver(syncFooterBubbleMode, { threshold: 0 });
    footerObserver.observe(footer);
    window.addEventListener('scroll', function () {
      if (scrollSyncScheduled) return;
      scrollSyncScheduled = true;
      window.requestAnimationFrame(function () {
        scrollSyncScheduled = false;
        syncFooterBubbleMode();
      });
    }, { passive: true });
    window.addEventListener('resize', syncFooterBubbleMode);
  }

  function syncPhoneHeroNav() {
    const nav = document.querySelector('.nav-bar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const player = document.getElementById('playerWidget');
    const playerMeta = player ? player.querySelector('.player-meta') : null;
    const heroNowPlayingMeta = document.getElementById('heroNowPlayingMeta');
    const heroNowPlaying = document.getElementById('heroNowPlayingSlot');
    const hero = document.getElementById('siteHero');
    const heroImage = hero ? hero.querySelector('.hero-image') : null;
    const heroBrand = hero ? hero.querySelector('.hero-brand') : null;
    const heroIntro = hero ? hero.querySelector('.hero-intro') : null;
    const heroAboutLink = hero ? document.getElementById('heroAboutLink') : null;
    const heroDiscoveryControl = hero ? hero.querySelector('.hero-discovery-control') : null;
    const heroTitleLastLine = hero ? hero.querySelector('.hero-title-last-line') : null;
    const controlRow = document.getElementById('pagePhoneControlRow');
    const menuSlot = document.getElementById('pagePhoneMenuSlot');
    const playerSlot = document.getElementById('pagePhonePlayerSlot');
    const menuPanel = document.getElementById('pagePhoneMenuPanel');

    if (!nav || !toggle || !links || !player ||
        !controlRow || !menuSlot || !playerSlot || !menuPanel) return;

    const usePhoneHero = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches || landscapePhoneQuery.matches;
    const useTabletLayout = tabletLayoutQuery.matches || landscapePhoneQuery.matches;
    document.body.classList.toggle('tablet-layout', useTabletLayout);
    document.body.classList.toggle('phone-landscape', landscapePhoneQuery.matches);
    const useDesktopHomeHero = document.body.classList.contains('home-page') &&
      window.matchMedia('(min-width: 768px)').matches;
    const useComputerHomeHero = document.body.classList.contains('home-page') &&
      !useTabletLayout && window.matchMedia('(min-width: 1025px)').matches;
    if (heroAboutLink) {
      heroAboutLink.setAttribute('href', useComputerHomeHero ? '/newsletter' : '#about');
      heroAboutLink.setAttribute('aria-label', useComputerHomeHero
        ? 'Visit the Signature Radio UK newsletter'
        : 'Open information about Signature Radio UK');
    }
    if (usePhoneHero || useTabletLayout) {
      if (heroNowPlaying && hero && heroNowPlaying.parentNode !== hero) {
        hero.insertBefore(heroNowPlaying, heroImage || null);
      }
      if (heroDiscoveryControl && heroTitleLastLine) {
        if (heroAboutLink && heroAboutLink.parentNode !== heroDiscoveryControl) {
          heroDiscoveryControl.insertBefore(heroAboutLink, heroDiscoveryControl.querySelector('.hero-whats-new-arrow'));
        }
        if (heroDiscoveryControl.parentNode !== heroTitleLastLine) {
          heroTitleLastLine.appendChild(heroDiscoveryControl);
        }
      } else if (heroAboutLink && heroTitleLastLine && heroAboutLink.parentNode !== heroTitleLastLine) {
        heroTitleLastLine.appendChild(heroAboutLink);
      }
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
    if (player.parentNode !== nav) nav.appendChild(player);
    if (useDesktopHomeHero && heroIntro && heroNowPlaying) {
      if (heroNowPlaying.parentNode !== hero) {
        hero.appendChild(heroNowPlaying);
      }
      if (heroAboutLink && heroBrand) {
        if (useComputerHomeHero && heroDiscoveryControl) {
          if (heroAboutLink.parentNode !== heroDiscoveryControl) {
            heroDiscoveryControl.insertBefore(heroAboutLink, heroDiscoveryControl.querySelector('.hero-whats-new-arrow'));
          }
          if (heroDiscoveryControl.parentNode !== hero) hero.appendChild(heroDiscoveryControl);
        } else {
          if (heroDiscoveryControl && heroIntro &&
              (heroDiscoveryControl.parentNode === heroBrand || heroDiscoveryControl.parentNode === hero)) {
            heroIntro.appendChild(heroDiscoveryControl);
          }
          if (heroAboutLink.parentNode !== heroBrand) heroBrand.appendChild(heroAboutLink);
        }
      }
    } else if (heroNowPlaying && hero && heroNowPlaying.parentNode !== hero) {
      hero.insertBefore(heroNowPlaying, heroImage || null);
    }
    if (useDesktopHomeHero && playerMeta && heroNowPlayingMeta) {
      if (playerMeta.parentNode !== heroNowPlayingMeta) heroNowPlayingMeta.appendChild(playerMeta);
    } else if (playerMeta && playerMeta.parentNode !== player) {
      player.insertBefore(playerMeta, player.firstChild);
    }
    menuPanel.classList.remove('is-open');
    menuPanel.setAttribute('aria-hidden', 'true');
    menuPanel.inert = true;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
  }

})();
