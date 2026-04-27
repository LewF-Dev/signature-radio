/* ═══════════════════════════════════════════════════════
   presenter-dashboard.js
   Runs only on presenter-dashboard.html.
   Handles message history, real-time subscription,
   toast popups, and sign out.
═══════════════════════════════════════════════════════ */

(async function initDashboard() {

  const SUPABASE_URL      = window.SRUK_SUPABASE_URL      || '';
  const SUPABASE_ANON_KEY = window.SRUK_SUPABASE_ANON_KEY || '';

  const messageList  = document.getElementById('messageList');
  const emptyMsg     = document.getElementById('messageEmpty');
  const statusDot    = document.getElementById('statusDot');
  const statusLabel  = document.getElementById('statusLabel');
  const toastContainer = document.getElementById('toastContainer');
  const logoutBtn    = document.getElementById('logoutBtn');

  if (!messageList) return;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    setStatus('error', 'Supabase not configured');
    return;
  }

  // ── Load Supabase SDK ──────────────────────────────
  let createClient;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClient = mod.createClient;
  } catch (e) {
    setStatus('error', 'Failed to load Supabase SDK');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Auth guard ─────────────────────────────────────
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // Use the stored login time so the window stays stable across token refreshes.
  // Falls back to session.created_at if localStorage entry is missing.
  const sessionStart = localStorage.getItem('sruk_presenter_login_at')
    || new Date(session.created_at).toISOString();

  // ── Sign out ───────────────────────────────────────
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      await supabase.auth.signOut();
      localStorage.removeItem('sruk_presenter_login_at');
      window.location.href = 'index.html';
    });
  }

  // ── Load message history ───────────────────────────
  const { data, error } = await supabase
    .from('listener_messages')
    .select('*')
    .gte('created_at', sessionStart)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error && data && data.length > 0) {
    if (emptyMsg) emptyMsg.remove();
    data.slice().reverse().forEach(function (msg) {
      prependCard(msg, false);
    });
  }

  // ── Real-time subscription ─────────────────────────
  supabase
    .channel('dashboard_messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'listener_messages' },
      function (payload) {
        // Ignore messages that arrived before this session started
        if (new Date(payload.new.created_at) < new Date(sessionStart)) return;
        if (emptyMsg && emptyMsg.parentNode) emptyMsg.remove();
        prependCard(payload.new, true);
        showToast(payload.new);
      }
    )
    .subscribe(function (status) {
      if (status === 'SUBSCRIBED') {
        setStatus('connected', 'Live — receiving messages');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setStatus('error', 'Connection lost — refresh to reconnect');
      }
    });

  // ── Helpers ────────────────────────────────────────
  function setStatus(type, text) {
    if (statusDot)   statusDot.className  = 'status-dot' + (type ? ' ' + type : '');
    if (statusLabel) statusLabel.textContent = text;
  }

  function prependCard(msg, animate) {
    const card = document.createElement('div');
    card.className = 'message-card';
    if (!animate) card.style.animation = 'none';

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

})();
