/* ═══════════════════════════════════════════════════════
   GET /api/nowplaying
   Fetches live track metadata from CentovaCast and
   enriches it with the current show from the schedule.

   Response shape:
   {
     title:     string,   // track title or fallback
     listeners: number,
     status:    'live' | 'autodj' | 'offline',
     show:      string | null,
     presenter: string | null,
   }
═══════════════════════════════════════════════════════ */

import { getCurrentShow } from '../../schedule-data.js';

const RPC_URL =
  'http://centova87.shoutcastservices.com:8282/external/rpc.php' +
  '?m=streaminfo.get&username=reid';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export default async function handler(req) {
  const show = getCurrentShow();

  try {
    const res = await fetch(RPC_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const data = await res.json();
    const stream = data?.data?.[0];

    // source: 'live' means a presenter is connected, otherwise AutoDJ
    const isLive   = stream?.source === 'live';
    const rawTitle = (stream?.track?.text || '').trim();

    // Strip numeric prefix Shoutcast sometimes adds e.g. "107 Artist - Title"
    let title = rawTitle;
    const prefixMatch = title.match(/^\d+\s+(.+)/);
    if (prefixMatch) title = prefixMatch[1].trim();

    // Fallback chain: track title → show name → station name
    const displayTitle = title || (show ? show.show : 'Signature Radio UK');

    return new Response(
      JSON.stringify({
        title:     displayTitle,
        listeners: stream?.listeners ?? 0,
        status:    isLive ? 'live' : 'autodj',
        show:      show ? show.show      : null,
        presenter: show ? show.presenter : null,
      }),
      { status: 200, headers: HEADERS }
    );

  } catch (err) {
    // On any error still return the schedule info if available
    return new Response(
      JSON.stringify({
        title:     show ? show.show : 'Signature Radio UK',
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
