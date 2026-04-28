/* ═══════════════════════════════════════════════════════
   GET /api/messages/public
   Returns messages from the last 12 hours. No auth required.
   Uses the service role key server-side so RLS is bypassed.
═══════════════════════════════════════════════════════ */

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: HEADERS,
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: HEADERS,
    });
  }

  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/listener_messages?created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=50`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: HEADERS,
    });
  }

  const messages = await res.json();
  return new Response(JSON.stringify({ messages }), {
    status: 200,
    headers: HEADERS,
  });
}

export const config = { path: '/api/messages/public' };
