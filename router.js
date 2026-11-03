/* ═══════════════════════════════════════════════════════
   router.js
   SPA-style navigation — intercepts internal link clicks,
   fetches the new page, swaps only <main>, and re-runs
   per-page initialisers. The player, nav, ticker and
   footer are never destroyed so audio continues unbroken.
═══════════════════════════════════════════════════════ */

(function initRouter() {

  const SAME_ORIGIN = window.location.origin;
  let activeNavigationId = 0;
  const ROUTE_FILES = {
    home: 'index.html',
    about: 'about.html',
    newsletter: 'newsletter.html',
    presenters: 'presenters.html',
    schedule: 'schedule.html',
    store: 'store.html',
    business: 'business.html',
    contact: 'contact.html',
    'live-chat': 'presenter-dashboard.html',
    'presenter-dashboard': 'presenter-dashboard.html'
  };

  // Pages that require a full reload (auth token in hash, etc.)
  const FULL_RELOAD_PAGES = [];

  // ── Intercept clicks ───────────────────────────────
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;

    // Local file previews cannot fetch sibling pages with the SPA router.
    // Let the browser perform normal file-to-file navigation instead.
    if (window.location.protocol === 'file:') return;

    const href = a.getAttribute('href');
    if (!href) return;

    // Skip: external, hash-only, mailto, tel, target="_blank", download
    if (
      a.target === '_blank' ||
      a.hasAttribute('download') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) return;

    // Skip absolute URLs pointing to a different origin
    if (href.startsWith('http') && !href.startsWith(SAME_ORIGIN)) return;

    const dest = getPageFromUrl(href);
    if (FULL_RELOAD_PAGES.includes(dest)) return;

    e.preventDefault();
    navigate(href);
  });

  // ── Handle browser back/forward ────────────────────
  window.addEventListener('popstate', function (e) {
    navigate((e.state && e.state.url) || window.location.href, false);
  });

  // Record initial state
  history.replaceState({ url: window.location.href }, '', window.location.href);

  // ── Navigate ───────────────────────────────────────
  async function navigate(url, pushState) {
    const target = new URL(url, window.location.href);
    if (target.origin !== SAME_ORIGIN) {
      window.location.href = target.href;
      return;
    }

    const targetUrl = target.href;
    const navigationId = ++activeNavigationId;

    if (pushState !== false) {
      history.pushState({ url: targetUrl }, '', targetUrl);
    }

    try {
      // Fetch the physical HTML filename so clean routes work in local static
      // previews too; the address bar keeps the human-friendly route.
      const fetchTarget = new URL(getPageFromUrl(targetUrl), target.origin);
      fetchTarget.search = target.search;
      const res  = await fetch(fetchTarget.href);
      if (!res.ok) throw new Error('Page request failed: ' + res.status);
      const html = await res.text();
      if (navigationId !== activeNavigationId) return;

      const doc  = new DOMParser().parseFromString(html, 'text/html');

      // Swap <main>
      const newMain = doc.querySelector('main');
      const curMain = document.querySelector('main');
      if (!newMain || !curMain) throw new Error('Page is missing its main content.');

      // Only clean up and mutate the page once the latest navigation is ready.
      cleanup();
      curMain.replaceWith(newMain);

      // 1. Update <title> — read from parsed <title> element directly
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      // Sync homepage hero. It lives outside <main>, so SPA navigation must
      // add/remove it separately when moving between inner pages and Home.
      const destPage = getPageFromUrl(targetUrl);
      syncHomepageHero(doc, destPage);
      if (window.SRUK && typeof window.SRUK.refreshPlayerHero === 'function') {
        window.SRUK.refreshPlayerHero();
      }
      if (window.SRUK && typeof window.SRUK.syncPhoneHeroNav === 'function') {
        window.SRUK.syncPhoneHeroNav();
      }

      // 2. Update active nav link (router's own + partials.js helper)
      updateActiveNav(targetUrl);
      if (window.SRUK && typeof window.SRUK.syncActiveNav === 'function') {
        window.SRUK.syncActiveNav();
      }
      if (window.SRUK && typeof window.SRUK.syncDashboardLink === 'function') {
        window.SRUK.syncDashboardLink();
      }

      // 3. Scroll to top — assign scrollTop directly to bypass CSS scroll-behavior: smooth
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 4. Re-run per-page initialisers (includes presenter bubble sync)
      reinit(targetUrl);

    } catch (err) {
      if (navigationId !== activeNavigationId) return;
      // On fetch failure fall back to full navigation
      window.location.href = targetUrl;
    }
  }

  // ── Cleanup before page swap ───────────────────────
  function cleanup() {
    const phoneMenuPanel = document.getElementById('pagePhoneMenuPanel');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (phoneMenuPanel) {
      phoneMenuPanel.classList.remove('is-open');
      phoneMenuPanel.setAttribute('aria-hidden', 'true');
      phoneMenuPanel.inert = true;
    }
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (navLinks) navLinks.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');

    if (window.SRUK) {
      if (typeof window.SRUK.cleanupHeroRain     === 'function') window.SRUK.cleanupHeroRain();
      if (typeof window.SRUK.cleanupHeroImageTransition === 'function') window.SRUK.cleanupHeroImageTransition();
      if (typeof window.SRUK.cleanupVideo        === 'function') window.SRUK.cleanupVideo();
      if (typeof window.SRUK.cleanupSlideshow    === 'function') window.SRUK.cleanupSlideshow();
      if (typeof window.SRUK.cleanupDashboard    === 'function') window.SRUK.cleanupDashboard();
      if (typeof window.SRUK.cleanupCoverflow    === 'function') window.SRUK.cleanupCoverflow();
      if (typeof window.SRUK.stopSitewideRealtime === 'function') window.SRUK.stopSitewideRealtime();
    }
    // Close any open modals
    document.querySelectorAll('.modal-overlay:not([hidden]), .presenter-panel-overlay:not([hidden])')
      .forEach(function (el) { el.hidden = true; });
    document.body.style.overflow = '';
  }

  // ── Homepage hero sync ────────────────────────────
  function syncHomepageHero(doc, page) {
    const shouldShowHero = page === 'index.html' || page === '';
    document.body.classList.toggle('home-page', shouldShowHero);
    const curHero = document.getElementById('siteHero');

    if (!shouldShowHero) {
      if (curHero) curHero.remove();
      return;
    }

    const newHero = doc.getElementById('siteHero');
    if (!newHero) return;

    const main = document.querySelector('main');

    if (curHero) {
      curHero.replaceWith(newHero);
    } else if (main && main.parentNode) {
      // Match index.html: keep the persistent navbar above the hero.
      main.parentNode.insertBefore(newHero, main);
    }
  }

  // ── Re-run initialisers after swap ─────────────────
  function reinit(url) {
    const page = getPageFromUrl(url);

    // Always re-run scroll reveal on new content
    reinitScrollReveal();

    // Always re-run visit counter (only activates if element present)
    reinitCounter();

    // Page-specific
    if (page === 'index.html' || page === '') {
      if (typeof window.SRUK_initHeroRain === 'function') window.SRUK_initHeroRain();
      if (typeof window.SRUK_initHeroImageTransition === 'function') window.SRUK_initHeroImageTransition();
      if (typeof window.SRUK_initVideo === 'function') window.SRUK_initVideo();
      if (window.initMessageModal) window.initMessageModal();
    }

    if (page === 'business.html') {
      if (typeof window.SRUK_initSlideshow === 'function') window.SRUK_initSlideshow();
    }

    if (page === 'store.html') {
      if (typeof window.SRUK_initStore === 'function') {
        window.SRUK_initStore();
      } else {
        var storeScript = document.createElement('script');
        storeScript.src = 'store.js';
        document.body.appendChild(storeScript);
      }
    }

    if (page === 'presenter-dashboard.html') {
      if (typeof window.SRUK_initDashboard === 'function') {
        window.SRUK_initDashboard();
      } else {
        // Script not yet loaded (SPA navigation from another page) — load it now
        var s = document.createElement('script');
        s.src = 'presenter-dashboard.js';
        s.onload = function () {
          if (typeof window.SRUK_initDashboard === 'function') window.SRUK_initDashboard();
        };
        document.body.appendChild(s);
      }
    }

    // 4. Re-sync presenter bubble and session state on every navigation
    if (typeof window.SRUK_initPresenterAuth === 'function') {
      window.SRUK_initPresenterAuth();
    }
  }

  // ── Scroll reveal re-init ──────────────────────────
  function reinitScrollReveal() {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!els.length) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { observer.observe(el); });
  }

  // ── Visit counter re-init ──────────────────────────
  function reinitCounter() {
    const el = document.getElementById('visitCounter');
    if (!el) return;
    fetch('/api/counter')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.count) el.textContent = Number(d.count).toLocaleString('en-GB');
      })
      .catch(function () {});
  }

  // ── Active nav link ────────────────────────────────
  function updateActiveNav(url) {
    const page = getPageFromUrl(url).replace(/\.html$/, '').replace(/^index$/, 'home');
    const brandHome = document.querySelector('.nav-brand-home');
    if (brandHome) brandHome.classList.toggle('active', page === 'home');

    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      const aPage = getPageFromUrl(href).replace(/\.html$/, '').replace(/^index$/, 'home');
      a.classList.toggle('active', aPage === page);
    });
  }

  function getPageFromUrl(url) {
    try {
      const segment = new URL(url, window.location.href).pathname.split('/').filter(Boolean).pop() || 'home';
      if (segment === 'index' || segment === 'index.html') return 'index.html';
      return ROUTE_FILES[segment] || segment;
    } catch (e) {
      const segment = url.split('/').pop().split('?')[0] || 'home';
      if (segment === 'index' || segment === 'index.html') return 'index.html';
      return ROUTE_FILES[segment] || segment;
    }
  }

})();
