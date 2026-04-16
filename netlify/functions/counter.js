const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const COUNTER_KEY = 'sruk_visits';
const SEED = 292560;

async function redis(command) {
  const res = await fetch(`${UPSTASH_URL}/${command}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  return res.json();
}

async function ensureSeeded() {
  // SET NX sets the key only if it does not already exist
  await redis(`SET/${COUNTER_KEY}/${SEED}/NX`);
}

export default async function handler(req, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return new Response(
      JSON.stringify({ count: SEED, error: 'Counter not configured' }),
      { status: 200, headers }
    );
  }

  try {
    await ensureSeeded();
    const data = await redis(`INCR/${COUNTER_KEY}`);
    const count = data.result ?? SEED;
    return new Response(JSON.stringify({ count }), { status: 200, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ count: SEED, error: 'Counter unavailable' }),
      { status: 200, headers }
    );
  }
}

export const config = { path: '/api/counter' };
