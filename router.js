/* ═══════════════════════════════════════════════════════
   router.js
   SPA-style navigation — intercepts internal link clicks,
   fetches the new page, swaps only <main>, and re-runs
   per-page initialisers. The player, nav, ticker and
   footer are never destroyed so audio continues unbroken.
═══════════════════════════════════════════════════════ */

(function initRouter() {

  const SAME_ORIGIN = window.location.origin;

  // Pages that require a full reload (auth token in hash, etc.)
  const FULL_RELOAD_PAGES = [];

  // ── Intercept clicks ───────────────────────────────
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;

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

    const dest = href.split('/').pop().split('?')[0] || 'index.html';
    if (FULL_RELOAD_PAGES.includes(dest)) return;

    e.preventDefault();
    navigate(href);
  });

  // ── Handle browser back/forward ────────────────────
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.url) {
      navigate(e.state.url, false);
    }
  });

  // Record initial state
  history.replaceState({ url: window.location.href }, '', window.location.href);

  // ── Navigate ───────────────────────────────────────
  async function navigate(url, pushState) {
    if (pushState !== false) {
      history.pushState({ url }, '', url);
    }

    // Run any cleanup before swapping
    cleanup();

    try {
      const res  = await fetch(url);
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');

      // Swap <main>
      const newMain = doc.querySelector('main');
      const curMain = document.querySelector('main');
      if (newMain && curMain) {
        curMain.replaceWith(newMain);
      }

      // 1. Update <title> — read from parsed <title> element directly
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      // Show homepage hero only on index, hide on all other pages
      const destPage = url.split('/').pop().split('?')[0] || 'index.html';
      const hero = document.getElementById('siteHero');
      if (hero) hero.style.display = (destPage === 'index.html' || destPage === '') ? '' : 'none';

      // 2. Update active nav link (router's own + partials.js helper)
      updateActiveNav(url);
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
      reinit(url);

    } catch (err) {
      // On fetch failure fall back to full navigation
      window.location.href = url;
    }
  }

  // ── Cleanup before page swap ───────────────────────
  function cleanup() {
    if (window.SRUK) {
      if (typeof window.SRUK.cleanupSlideshow  === 'function') window.SRUK.cleanupSlideshow();
      if (typeof window.SRUK.cleanupDashboard  === 'function') window.SRUK.cleanupDashboard();
    }
    // Close any open modals
    document.querySelectorAll('.modal-overlay:not([hidden]), .presenter-panel-overlay:not([hidden])')
      .forEach(function (el) { el.hidden = true; });
    document.body.style.overflow = '';
  }

  // ── Re-run initialisers after swap ─────────────────
  function reinit(url) {
    const page = url.split('/').pop().split('?')[0] || 'index.html';

    // Always re-run scroll reveal on new content
    reinitScrollReveal();

    // Always re-run visit counter (only activates if element present)
    reinitCounter();

    // Page-specific
    if (page === 'index.html' || page === '') {
      if (window.initMessageModal) window.initMessageModal();
    }

    if (page === 'business.html') {
      if (typeof window.SRUK_initSlideshow === 'function') window.SRUK_initSlideshow();
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
    // Resolve to a pathname so both relative and absolute hrefs work
    let page;
    try {
      page = new URL(url, window.location.href).pathname.split('/').pop().split('?')[0] || 'index.html';
    } catch (e) {
      page = url.split('/').pop().split('?')[0] || 'index.html';
    }

    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      const aPage = href.split('/').pop().split('?')[0] || 'index.html';
      a.classList.toggle('active', aPage === page);
    });
  }

})();
