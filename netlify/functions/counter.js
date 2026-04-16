const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const COUNTER_KEY = 'sruk_visits';
const SEED = 292560;

// Send a pipeline of commands in one HTTP request.
// Returns an array of { result } / { error } objects.
async function pipeline(commands) {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis pipeline error: ${res.status}`);
  return res.json();
}

export default async function handler(req, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return new Response(
      JSON.stringify({ count: SEED }),
      { status: 200, headers }
    );
  }

  try {
    // SET NX seeds the counter only if the key does not exist yet.
    // INCR then increments it. Both run in one round trip.
    const results = await pipeline([
      ['SET', COUNTER_KEY, SEED, 'NX'],
      ['INCR', COUNTER_KEY],
    ]);

    // results[1] is the INCR response — the new counter value
    const count = results[1]?.result ?? SEED;

    return new Response(JSON.stringify({ count }), { status: 200, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ count: SEED }),
      { status: 200, headers }
    );
  }
}

export const config = { path: '/api/counter' };
