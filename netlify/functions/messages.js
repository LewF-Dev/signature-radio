/* ═══════════════════════════════════════════════════════
   GET /api/messages
   Returns recent listener messages. Requires a valid
   Supabase JWT in the Authorization header — presenters only.
═══════════════════════════════════════════════════════ */

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY   = process.env.SUPABASE_ANON_KEY;

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

  // Verify the caller is an authenticated Supabase user
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: HEADERS,
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: HEADERS,
    });
  }

  // Validate the JWT by calling Supabase's /auth/v1/user endpoint
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: HEADERS,
    });
  }

  // Fetch the 50 most recent messages using the service role key
  const msgsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/listener_messages?order=created_at.desc&limit=50`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!msgsRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
      status: 500,
      headers: HEADERS,
    });
  }

  const messages = await msgsRes.json();
  return new Response(JSON.stringify({ messages }), {
    status: 200,
    headers: HEADERS,
  });
}

export const config = { path: '/api/messages' };
