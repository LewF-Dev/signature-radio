/*
 * GET /api/messages
 * Returns recent listener messages only to an authenticated Supabase user.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ALLOWED_ORIGINS = new Set([
  'https://signatureradio.uk',
  'https://www.signatureradio.uk',
  'http://127.0.0.1:8000',
  'http://localhost:8000',
]);

function getCorsHeaders(req) {
  const origin = req.headers.get('Origin') || '';
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return { headers, originAllowed: !origin || ALLOWED_ORIGINS.has(origin) };
}

export default async function handler(req) {
  const { headers, originAllowed } = getCorsHeaders(req);
  if (!originAllowed) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers });
  }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Message service unavailable' }), { status: 503, headers });
  }

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    const user = await userRes.json();
    if (!user.invited_at) {
      return new Response(JSON.stringify({ error: 'Presenter access required' }), { status: 403, headers });
    }

    const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const msgsRes = await fetch(`${SUPABASE_URL}/rest/v1/listener_messages?created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=50`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    if (!msgsRes.ok) {
      console.error('Supabase message fetch failed with status:', msgsRes.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 502, headers });
    }
    const messages = await msgsRes.json();
    return new Response(JSON.stringify({ messages }), { status: 200, headers });
  } catch (error) {
    console.error('Supabase message fetch request failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 502, headers });
  }
}

export const config = { path: '/api/messages' };
