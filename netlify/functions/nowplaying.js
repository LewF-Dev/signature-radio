/* ═══════════════════════════════════════════════════════
   GET /api/nowplaying
   Fetches live track metadata from Shoutcast stats endpoint
   and enriches it with the current show from the schedule.
═══════════════════════════════════════════════════════ */

import { getCurrentShow } from '../../schedule-data.js';
import { extractTrackTitle } from '../../nowplaying-utils.js';

const STATS_URL = 'https://centova87.shoutcastservices.com/proxy/reid/stats?sid=1&json=1';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export default async function handler(req) {
  const show = getCurrentShow();

  try {
    const res = await fetch(STATS_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const data = await res.json();

    const track = extractTrackTitle(data);
    const displayTitle = track || (show ? show.show : 'Signature Radio UK');

    return new Response(
      JSON.stringify({
        title:     displayTitle,
        track,
        listeners: data.currentlisteners ?? 0,
        status:    data.streamstatus === 1 ? 'live' : 'autodj',
        show:      show ? show.show      : null,
        presenter: show ? show.presenter : null,
      }),
      { status: 200, headers: HEADERS }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        title:     show ? show.show : 'Signature Radio UK',
        track:     null,
        listeners: 0,
        status:    'unknown',
        show:      show ? show.show      : null,
        presenter: show ? show.presenter : null,
      }),
      { status: 200, headers: HEADERS }
    );
  }
}

export const config = { path: '/api/nowplaying' };
