const COUNTER_KEY = 'sruk_visits';
const SEED = 292560;

const ALLOWED_ORIGINS = ['https://signatureradio.uk', 'https://www.signatureradio.uk'];

function getCorsHeaders(request) {
  const origin = (request && request.headers.get('Origin')) || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
}

async function pipeline(url, token, commands) {
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis pipeline error: ${res.status}`);
  return res.json();
}

export async function onRequest({ request, env }) {
  const headers = getCorsHeaders(request);
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return new Response(JSON.stringify({ count: SEED }), { status: 200, headers });
  }

  try {
    const results = await pipeline(url, token, [
      ['SET', COUNTER_KEY, SEED, 'NX'],
      ['INCR', COUNTER_KEY],
    ]);
    const count = results[1]?.result ?? SEED;
    return new Response(JSON.stringify({ count }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ count: SEED }), { status: 200, headers });
  }
}
