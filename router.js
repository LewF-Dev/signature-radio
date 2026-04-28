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

    // Skip: external, hash-only, mailto, target="_blank", download
    if (
      a.target === '_blank' ||
      a.hasAttribute('download') ||
      href.startsWith('mailto:') ||
      href.startsWith('http') && !href.startsWith(SAME_ORIGIN) ||
      href.startsWith('#')
    ) return;

    // Skip presenter dashboard — needs full load for auth guard
    const dest = href.split('/').pop() || 'index.html';
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

      // Update <title>
      document.title = doc.title;

      // Update active nav link
      updateActiveNav(url);

      // Scroll to top
      window.scrollTo(0, 0);

      // Re-run per-page initialisers
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

    // Always re-run scroll reveal
    if (window.initScrollReveal) window.initScrollReveal();
    else reinitScrollReveal();

    // Always re-run visit counter (only activates if element present)
    reinitCounter();

    // Page-specific
    if (page === 'index.html' || page === '') {
      // Message modal is guarded by data-modal-init so safe to call
      if (window.initMessageModal) window.initMessageModal();
    }

    if (page === 'business.html') {
      reinitSlideshow();
    }

    if (page === 'presenter-dashboard.html') {
      reinitDashboard();
    }

    // Re-run presenter auth (handles session state, bubble, message bar)
    reinitPresenterAuth();
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

  // ── Slideshow re-init ──────────────────────────────
  function reinitSlideshow() {
    // Trigger main.js slideshow init by dispatching a custom event
    // main.js listens for DOMContentLoaded equivalent — we call directly
    if (typeof window.SRUK_initSlideshow === 'function') {
      window.SRUK_initSlideshow();
    }
  }

  // ── Dashboard re-init ──────────────────────────────
  function reinitDashboard() {
    if (typeof window.SRUK_initDashboard === 'function') {
      window.SRUK_initDashboard();
    }
  }

  // ── Presenter auth re-init ─────────────────────────
  function reinitPresenterAuth() {
    if (typeof window.SRUK_initPresenterAuth === 'function') {
      window.SRUK_initPresenterAuth();
    }
  }

  // ── Active nav link ────────────────────────────────
  function updateActiveNav(url) {
    const page = url.split('/').pop().split('?')[0] || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
    });
  }

})();
