const TITLE_KEYS = [
  'songtitle', 'songTitle', 'song_title',
  'currentsong', 'currentSong', 'current_song',
  'tracktitle', 'trackTitle', 'track_title',
  'nowPlaying', 'nowplaying', 'song', 'title',
];

function cleanTrackTitle(value) {
  if (value && typeof value === 'object') {
    value = value.title || value.name || value.songtitle || value.songTitle || value.song_title || value.currentsong;
  }
  if (typeof value !== 'string') return null;

  let title = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  title = title.replace(/^\d{1,3}\s*[-.)]\s*/, '').trim();
  if (!title || /^(unknown|not available|no song|no data|auto ?dj|n\/a|none)$/i.test(title)) return null;
  return title;
}

function extractTrackTitle(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const sources = [payload, payload.stream, payload.stats, payload.now_playing];
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of TITLE_KEYS) {
      const title = cleanTrackTitle(source[key]);
      if (title) return title;
    }
  }
  return null;
}

export { extractTrackTitle };
