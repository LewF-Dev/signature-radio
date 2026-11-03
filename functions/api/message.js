const ALLOWED_ORIGINS = new Set(['https://signatureradio.uk', 'https://www.signatureradio.uk', 'http://127.0.0.1:8000', 'http://localhost:8000']);

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return { headers, originAllowed: !origin || ALLOWED_ORIGINS.has(origin) };
}

export async function onRequest({ request, env }) {
  const { headers, originAllowed } = getCorsHeaders(request);
  if (!originAllowed) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }
  if (Number(request.headers.get('Content-Length') || 0) > 8192) {
    return new Response(JSON.stringify({ error: 'Request is too large' }), { status: 413, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers });
  }
  if (body.name != null && typeof body.name !== 'string') {
    return new Response(JSON.stringify({ error: 'Name must be text' }), { status: 400, headers });
  }
  if (typeof body.message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message must be text' }), { status: 400, headers });
  }
  const name    = (body.name || '').trim().slice(0, 80);
  const message = body.message.trim().slice(0, 500);

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers });
  }

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
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
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
