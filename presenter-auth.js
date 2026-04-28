/* ═══════════════════════════════════════════════════════
   presenter-auth.js
   Handles all presenter auth UI site-wide:
     - Invite token detection → password setup panel
     - Floating bubble → login panel
     - Email/password sign in
     - Session persistence across pages
═══════════════════════════════════════════════════════ */

window.SRUK_initPresenterAuth = async function initPresenterAuth() {
  // Only run full init once — on re-runs just update UI state
  if (window.SRUK && window.SRUK.presenterAuthReady) {
    // Re-apply logged-in state if session exists
    const bubble       = document.getElementById('presenterBubble');
    const bubbleBtn    = document.getElementById('presenterBubbleBtn');
    const bubbleLoggedIn = document.getElementById('presenterBubbleLoggedIn');
    const dashItem     = document.getElementById('navDashboardItem');
    const studioBar    = document.querySelector('.studio-message-bar');
    const keys = Object.keys(localStorage).filter(function (k) {
      return k.startsWith('sb-') && k.endsWith('-auth-token');
    });
    const hasSession = keys.length > 0 && (function () {
      try { return !!JSON.parse(localStorage.getItem(keys[0]))?.access_token; } catch (e) { return false; }
    })();
    if (hasSession) {
      if (bubbleBtn)      bubbleBtn.style.display      = 'none';
      if (bubbleLoggedIn) bubbleLoggedIn.style.display = 'flex';
      if (bubble)         bubble.style.display         = 'block';
      if (dashItem)       dashItem.style.display       = '';
      if (studioBar)      studioBar.style.display      = 'none';
    } else {
      if (bubble)         bubble.style.display         = 'block';
      if (bubbleBtn)      bubbleBtn.style.display      = '';
      if (bubbleLoggedIn) bubbleLoggedIn.style.display = 'none';
    }
    return;
  }

  const SUPABASE_URL      = window.SRUK_SUPABASE_URL      || '';
  const SUPABASE_ANON_KEY = window.SRUK_SUPABASE_ANON_KEY || '';

  // ── Elements ───────────────────────────────────────
  const bubble           = document.getElementById('presenterBubble');
  const bubbleBtn        = document.getElementById('presenterBubbleBtn');
  const bubbleLoggedIn   = document.getElementById('presenterBubbleLoggedIn');
  const signOutBtn       = document.getElementById('presenterSignOutBtn');
  const loginPanel    = document.getElementById('presenterLoginPanel');
  const loginClose    = document.getElementById('presenterPanelClose');
  const loginForm     = document.getElementById('presenterLoginForm');
  const loginEmailEl  = document.getElementById('presenterEmail');
  const loginPassEl   = document.getElementById('presenterPassword');
  const loginErrorEl  = document.getElementById('presenterLoginError');
  const loginBtn      = document.getElementById('presenterLoginBtn');
  const setupPanel    = document.getElementById('presenterSetupPanel');
  const setupForm     = document.getElementById('presenterSetupForm');
  const setupPassEl   = document.getElementById('setupPassword');
  const setupConfEl   = document.getElementById('setupPasswordConfirm');
  const setupErrorEl  = document.getElementById('presenterSetupError');
  const setupBtn      = document.getElementById('presenterSetupBtn');

  // ── Load Supabase SDK ──────────────────────────────
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (bubble) bubble.style.display = 'block';
    return;
  }

  let createClient;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClient = mod.createClient;
  } catch (e) {
    console.error('Failed to load Supabase SDK:', e);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.SRUK = window.SRUK || {};
  window.SRUK.presenterAuthReady = true;
  window.SRUK.supabase = supabase;

  // ── Check for invite token in URL hash ────────────
  const hash        = window.location.hash;
  const hashParams  = new URLSearchParams(hash.replace('#', ''));
  const tokenType   = hashParams.get('type');
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (tokenType === 'invite' && accessToken) {
    try {
      await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken || '',
      });
    } catch (e) {
      console.error('Failed to set invite session:', e);
    }
    history.replaceState(null, '', window.location.pathname);
    showSetupPanel();
    return;
  }

  // ── Sign out (from bubble) — wired early so it works on all paths ─
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async function () {
      await supabase.auth.signOut();
      clearLoginTime();
      window.location.reload();
    });
  }

  // ── Check existing session ─────────────────────────
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    recordLoginTime();
    onLoggedIn();
    return;
  }

  // No session — show the bubble
  showBubble();

  // ── Bubble toggle ──────────────────────────────────
  if (bubbleBtn) {
    bubbleBtn.addEventListener('click', function () {
      openLoginPanel();
    });
  }

  // ── Login panel ────────────────────────────────────
  function openLoginPanel() {
    if (!loginPanel) return;
    loginPanel.hidden = false;
    document.body.style.overflow = 'hidden';
    if (loginEmailEl) loginEmailEl.focus();
    if (bubbleBtn) bubbleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeLoginPanel() {
    if (!loginPanel) return;
    loginPanel.hidden = true;
    document.body.style.overflow = '';
    if (bubbleBtn) bubbleBtn.setAttribute('aria-expanded', 'false');
  }

  if (loginClose) loginClose.addEventListener('click', closeLoginPanel);

  if (loginPanel) {
    loginPanel.addEventListener('click', function (e) {
      if (e.target === loginPanel) closeLoginPanel();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (loginPanel && !loginPanel.hidden) closeLoginPanel();
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (loginErrorEl) loginErrorEl.textContent = '';
      if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'SIGNING IN…'; }

      const { error } = await supabase.auth.signInWithPassword({
        email:    loginEmailEl ? loginEmailEl.value.trim() : '',
        password: loginPassEl  ? loginPassEl.value         : '',
      });

      if (error) {
        if (loginErrorEl) loginErrorEl.textContent = 'Incorrect email or password.';
        if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'SIGN IN'; }
        return;
      }

      recordLoginTime();
      closeLoginPanel();
      onLoggedIn();
    });
  }

  // ── Password setup panel ───────────────────────────
  function showSetupPanel() {
    if (!setupPanel) return;
    setupPanel.hidden = false;
    document.body.style.overflow = 'hidden';
    if (setupPassEl) setupPassEl.focus();
    if (bubble) bubble.style.display = 'none';
  }

  function closeSetupPanel() {
    if (!setupPanel) return;
    setupPanel.hidden = true;
    document.body.style.overflow = '';
  }

  if (setupForm) {
    setupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (setupErrorEl) setupErrorEl.textContent = '';

      const pass    = setupPassEl ? setupPassEl.value : '';
      const confirm = setupConfEl ? setupConfEl.value : '';

      if (pass.length < 8) {
        if (setupErrorEl) setupErrorEl.textContent = 'Password must be at least 8 characters.';
        return;
      }

      if (pass !== confirm) {
        if (setupErrorEl) setupErrorEl.textContent = 'Passwords do not match.';
        return;
      }

      if (setupBtn) { setupBtn.disabled = true; setupBtn.textContent = 'SAVING…'; }

      const { error } = await supabase.auth.updateUser({ password: pass });

      if (error) {
        if (setupErrorEl) setupErrorEl.textContent = error.message || 'Failed to set password.';
        if (setupBtn) { setupBtn.disabled = false; setupBtn.textContent = 'SET PASSWORD & SIGN IN'; }
        return;
      }

      recordLoginTime();
      closeSetupPanel();
      onLoggedIn();
    });
  }

  // ── Store original login time ──────────────────────
  // session.created_at updates on token refresh, so we persist the
  // original login time in localStorage to keep the message window stable.
  function recordLoginTime() {
    if (!localStorage.getItem('sruk_presenter_login_at')) {
      localStorage.setItem('sruk_presenter_login_at', new Date().toISOString());
    }
  }

  function clearLoginTime() {
    localStorage.removeItem('sruk_presenter_login_at');
  }

  // ── Post-login state ───────────────────────────────
  function onLoggedIn() {
    // Swap bubble to logged-in state
    if (bubbleBtn)      bubbleBtn.style.display      = 'none';
    if (bubbleLoggedIn) bubbleLoggedIn.style.display = 'flex';
    if (bubble)         bubble.style.display         = 'block';

    // Show live chat nav link
    const dashItem = document.getElementById('navDashboardItem');
    if (dashItem) dashItem.style.display = '';

    // Hide message studio bar
    const studioBar = document.querySelector('.studio-message-bar');
    if (studioBar) studioBar.style.display = 'none';

    // Start site-wide real-time toasts — skip on dashboard to avoid
    // duplicate toasts (presenter-dashboard.js handles that page)
    const page = window.location.pathname.split('/').pop();
    if (page !== 'presenter-dashboard.html') {
      startSitewideRealtime();
    }
  }

  // ── Site-wide real-time toasts ─────────────────────
  function startSitewideRealtime() {
    // Ensure toast container exists on every page
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('aria-live', 'assertive');
      toastContainer.setAttribute('aria-atomic', 'false');
      document.body.appendChild(toastContainer);
    }

    supabase
      .channel('sitewide_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'listener_messages' },
        function (payload) {
          showToast(payload.new, toastContainer);
        }
      )
      .subscribe();
  }

  function showToast(msg, container) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    toast.innerHTML =
      '<p class="toast-label">New Message</p>' +
      '<p class="toast-name">' + escHtml(msg.name || 'Anonymous') + '</p>' +
      '<p class="toast-body">' + escHtml(msg.message) + '</p>';

    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', function () {
        toast.remove();
      }, { once: true });
    }, 8000);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showBubble() {
    if (bubble)         bubble.style.display         = 'block';
    if (bubbleBtn)      bubbleBtn.style.display      = '';
    if (bubbleLoggedIn) bubbleLoggedIn.style.display = 'none';
  }

};
window.SRUK_initPresenterAuth();


/* ═══════════════════════════════════════════════════════
   Message modal (listener-facing, index.html only)
═══════════════════════════════════════════════════════ */
(function initMessageModal() {
  const openBtn   = document.getElementById('openMessageModal');
  const modal     = document.getElementById('messageModal');
  if (!openBtn || !modal) return;
  if (openBtn.dataset.modalInit) return;
  openBtn.dataset.modalInit = '1';
  const closeBtn  = document.getElementById('closeMessageModal');
  const form      = document.getElementById('messageForm');
  const nameEl    = document.getElementById('msgName');
  const textEl    = document.getElementById('msgText');
  const charCount = document.getElementById('charCount');
  const errorEl   = document.getElementById('msgError');
  const submitBtn = document.getElementById('msgSubmitBtn');
  const successEl = document.getElementById('msgSuccess');

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (textEl) textEl.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  if (textEl && charCount) {
    textEl.addEventListener('input', function () {
      charCount.textContent = textEl.value.length + ' / 500';
    });
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errorEl) errorEl.textContent = '';

      const message = textEl ? textEl.value.trim() : '';
      if (!message) {
        if (errorEl) errorEl.textContent = 'Please write a message before sending.';
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SENDING…'; }

      try {
        const res = await fetch('/api/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    nameEl ? nameEl.value.trim() : '',
            message: message,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Send failed');

        form.hidden = true;
        if (successEl) successEl.hidden = false;

        setTimeout(function () {
          closeModal();
          form.reset();
          form.hidden = false;
          if (successEl) successEl.hidden = true;
          if (charCount) charCount.textContent = '0 / 500';
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'SEND MESSAGE'; }
        }, 3000);

      } catch (err) {
        if (errorEl) errorEl.textContent = err.message || 'Something went wrong. Please try again.';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'SEND MESSAGE'; }
      }
    });
  }
})();
