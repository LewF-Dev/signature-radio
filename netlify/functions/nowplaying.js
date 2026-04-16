const STATS_URL = 'http://centova87.shoutcastservices.com:8282/stats?sid=1&json=1';

export default async function handler(req, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    const res = await fetch(STATS_URL);
    if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
    const data = await res.json();

    // Clean up the raw songtitle — Shoutcast often prefixes with a number
    // e.g. "107 Odyssey - native-new-yorker" → "Odyssey - Native New Yorker"
    let title = (data.songtitle || '').trim();
    const prefixMatch = title.match(/^\d+\s+(.+)/);
    if (prefixMatch) title = prefixMatch[1].trim();

    return new Response(
      JSON.stringify({
        title:     title || 'Signature Radio UK',
        listeners: data.currentlisteners ?? 0,
        status:    data.streamstatus === 1 ? 'live' : 'offline',
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        title:     'Signature Radio UK',
        listeners: 0,
        status:    'unknown',
      }),
      { status: 200, headers }
    );
  }
}

export const config = { path: '/api/nowplaying' };
