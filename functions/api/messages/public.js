const ALLOWED_ORIGINS = ['https://signatureradio.uk', 'https://www.signatureradio.uk'];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
}

export async function onRequest({ request, env }) {
  const headers = getCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ messages: [] }), { status: 200, headers });
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
    const errText = await res.text();
    return new Response(JSON.stringify({ messages: [], error: `${res.status}: ${errText}` }), { status: 200, headers });
  }

  const messages = await res.json();
  return new Response(JSON.stringify({ messages }), { status: 200, headers });
}
