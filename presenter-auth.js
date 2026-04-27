/* ═══════════════════════════════════════════════════════
   presenter-auth.js
   Handles presenter login, logout, and real-time message
   delivery via Supabase. Loaded on:
     - presenter-login.html
     - presenter-dashboard.html
   The Supabase JS client is loaded from CDN via a dynamic
   import so it only runs when this script is present.
═══════════════════════════════════════════════════════ */

(async function initPresenterAuth() {

  // ── Config ────────────────────────────────────────
  // These are public-safe values (anon key + project URL).
  // Sensitive operations use the service role key server-side only.
  const SUPABASE_URL     = window.SRUK_SUPABASE_URL     || '';
  const SUPABASE_ANON_KEY = window.SRUK_SUPABASE_ANON_KEY || '';

  const page = window.location.pathname.split('/').pop();
  const isLoginPage     = page === 'presenter-login.html';
  const isDashboardPage = page === 'presenter-dashboard.html';

  if (!isLoginPage && !isDashboardPage) return;

  // ── Load Supabase client from CDN ─────────────────
  let createClient;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClient = mod.createClient;
  } catch (e) {
    console.error('Failed to load Supabase SDK:', e);
    showConfigError('Could not load authentication library. Please refresh.');
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Supabase not yet configured — show a clear message in dev
    showConfigError(
      'Supabase is not configured. Set <code>window.SRUK_SUPABASE_URL</code> and ' +
      '<code>window.SRUK_SUPABASE_ANON_KEY</code> in a <code>supabase-config.js</code> file.'
    );
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Login page ────────────────────────────────────
  if (isLoginPage) {
    // If already logged in, go straight to dashboard
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.href = 'presenter-dashboard.html';
      return;
    }

    const form      = document.getElementById('loginForm');
    const emailEl   = document.getElementById('loginEmail');
    const passEl    = document.getElementById('loginPassword');
    const errorEl   = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginBtn');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'SIGNING IN…';

      const { error } = await supabase.auth.signInWithPassword({
        email:    emailEl.value.trim(),
        password: passEl.value,
      });

      if (error) {
        errorEl.textContent = error.message || 'Sign in failed. Check your credentials.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'SIGN IN';
        return;
      }

      window.location.href = 'presenter-dashboard.html';
    });

    return;
  }

  // ── Dashboard page ────────────────────────────────
  if (isDashboardPage) {
    // Guard: redirect to login if no session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = 'presenter-login.html';
      return;
    }

    const logoutBtn    = document.getElementById('logoutBtn');
    const messageList  = document.getElementById('messageList');
    const emptyMsg     = document.getElementById('messageEmpty');
    const statusDot    = document.getElementById('statusDot');
    const statusLabel  = document.getElementById('statusLabel');
    const toastContainer = document.getElementById('toastContainer');

    // ── Sign out ──────────────────────────────────
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        await supabase.auth.signOut();
        window.location.href = 'presenter-login.html';
      });
    }

    // ── Load message history ──────────────────────
    async function loadHistory() {
      const { data, error } = await supabase
        .from('listener_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to load message history:', error);
        return;
      }

      if (data && data.length > 0) {
        if (emptyMsg) emptyMsg.remove();
        // Render oldest-first so newest ends up at top after prepend logic
        data.slice().reverse().forEach(function (msg) {
          prependCard(msg, false);
        });
      }
    }

    // ── Render a message card ─────────────────────
    function prependCard(msg, animate) {
      if (emptyMsg && emptyMsg.parentNode) emptyMsg.remove();

      const card = document.createElement('div');
      card.className = 'message-card' + (animate ? '' : ' no-anim');
      card.dataset.id = msg.id;

      const time = new Date(msg.created_at).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit',
      });

      card.innerHTML =
        '<div class="message-card-meta">' +
          '<span class="message-card-name">' + escHtml(msg.name || 'Anonymous') + '</span>' +
          '<span class="message-card-time">' + time + '</span>' +
        '</div>' +
        '<p class="message-card-body">' + escHtml(msg.message) + '</p>';

      messageList.insertBefore(card, messageList.firstChild);
    }

    // ── Show a toast popup ────────────────────────
    function showToast(msg) {
      if (!toastContainer) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');

      toast.innerHTML =
        '<p class="toast-label">New Message</p>' +
        '<p class="toast-name">' + escHtml(msg.name || 'Anonymous') + '</p>' +
        '<p class="toast-body">' + escHtml(msg.message) + '</p>';

      toastContainer.appendChild(toast);

      // Auto-dismiss after 8 seconds
      setTimeout(function () {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', function () {
          toast.remove();
        }, { once: true });
      }, 8000);
    }

    // ── Real-time subscription ────────────────────
    function subscribeRealtime() {
      const channel = supabase
        .channel('listener_messages_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'listener_messages' },
          function (payload) {
            prependCard(payload.new, true);
            showToast(payload.new);
          }
        )
        .subscribe(function (status) {
          if (status === 'SUBSCRIBED') {
            if (statusDot)  statusDot.className  = 'status-dot connected';
            if (statusLabel) statusLabel.textContent = 'Live — receiving messages';
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            if (statusDot)  statusDot.className  = 'status-dot error';
            if (statusLabel) statusLabel.textContent = 'Connection lost — refresh to reconnect';
          }
        });

      return channel;
    }

    await loadHistory();
    subscribeRealtime();
  }

  // ── Helpers ───────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showConfigError(html) {
    const main = document.querySelector('main');
    if (!main) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#1a1a1a;border-left:3px solid #cc0000;padding:1rem 1.25rem;margin:2rem auto;max-width:600px;font-size:0.88rem;color:rgba(255,255,255,0.8);';
    banner.innerHTML = '⚠️ ' + html;
    main.prepend(banner);
  }

})();


/* ═══════════════════════════════════════════════════════
   Message modal (index.html)
   Runs on every page but only activates when the modal
   elements are present.
═══════════════════════════════════════════════════════ */
(function initMessageModal() {
  const openBtn   = document.getElementById('openMessageModal');
  const modal     = document.getElementById('messageModal');
  const closeBtn  = document.getElementById('closeMessageModal');
  const form      = document.getElementById('messageForm');
  const nameEl    = document.getElementById('msgName');
  const textEl    = document.getElementById('msgText');
  const charCount = document.getElementById('charCount');
  const errorEl   = document.getElementById('msgError');
  const submitBtn = document.getElementById('msgSubmitBtn');
  const successEl = document.getElementById('msgSuccess');

  if (!openBtn || !modal) return;

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
  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Character counter
  if (textEl && charCount) {
    textEl.addEventListener('input', function () {
      charCount.textContent = textEl.value.length + ' / 500';
    });
  }

  // Submit
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errorEl.textContent = '';

      const message = (textEl ? textEl.value.trim() : '');
      if (!message) {
        errorEl.textContent = 'Please write a message before sending.';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING…';

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

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Send failed');
        }

        // Show success state
        form.hidden = true;
        if (successEl) successEl.hidden = false;

        // Auto-close after 3 seconds
        setTimeout(function () {
          closeModal();
          // Reset form for next use
          form.reset();
          form.hidden = false;
          if (successEl) successEl.hidden = true;
          if (charCount) charCount.textContent = '0 / 500';
          submitBtn.disabled = false;
          submitBtn.textContent = 'SEND MESSAGE';
        }, 3000);

      } catch (err) {
        errorEl.textContent = err.message || 'Something went wrong. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND MESSAGE';
      }
    });
  }
})();
