/* ═══════════════════════════════════════════════════════
   POST /api/message
   Accepts a listener message and writes it to Supabase.
   No auth required for submission — listeners are anonymous.
═══════════════════════════════════════════════════════ */

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: HEADERS,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: HEADERS,
    });
  }

  const name    = (body.name    || '').trim().slice(0, 80);
  const message = (body.message || '').trim().slice(0, 500);

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: HEADERS,
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    // Env vars not configured — return success silently in dev
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: HEADERS,
    });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/listener_messages`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ name: name || 'Anonymous', message }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Supabase insert error:', text);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: HEADERS,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: HEADERS,
  });
}

export const config = { path: '/api/message' };
