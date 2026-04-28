/* ═══════════════════════════════════════════════════════
   schedule-data.js
   Single source of truth for the Sunday show schedule.
   Used by the nowplaying Netlify Function to determine
   the current show based on the time of day.

   Times are in UK local time (Europe/London).
   day: 0 = Sunday, 1 = Monday ... 6 = Saturday
═══════════════════════════════════════════════════════ */

const SCHEDULE = [
  {
    day:       0,
    startHour: 10, startMin: 0,
    endHour:   12, endMin:   0,
    show:      "Arnie's Disco Show",
    presenter: "Arnie",
    genre:     "Classic 70s & 80s Disco",
  },
  {
    day:       0,
    startHour: 12, startMin: 0,
    endHour:   14, endMin:   0,
    show:      "DJ Bandyt Reggae Revival Show",
    presenter: "DJ Bandyt",
    genre:     "Reggae Revival",
  },
  {
    day:       0,
    startHour: 14, startMin: 0,
    endHour:   16, endMin:   0,
    show:      "Bennjamin Sky – The BARE Sound Show",
    presenter: "Bennjamin Sky",
    genre:     "Soul, Reggae & Smooth Grooves",
  },
  {
    day:       0,
    startHour: 16, startMin: 0,
    endHour:   17, endMin:   0,
    show:      "The Signature Mix",
    presenter: "Signature Radio UK",
    genre:     "Signature Radio UK Selection",
  },
  {
    day:       0,
    startHour: 17, startMin: 0,
    endHour:   18, endMin:   0,
    show:      "DJ Kordova – Urban Dior",
    presenter: "DJ Kordova",
    genre:     "Eclectic Mix",
  },
  {
    day:       0,
    startHour: 18, startMin: 0,
    endHour:   19, endMin:   0,
    show:      "The Ministry of Dub Show",
    presenter: "Ministry of Dub",
    genre:     "Dub & Roots",
  },
  {
    day:       0,
    startHour: 19, startMin: 0,
    endHour:   20, endMin:   0,
    show:      "Kevin Deal",
    presenter: "Kevin Deal",
    genre:     "Soulful House & Garage",
  },
  {
    day:       0,
    startHour: 20, startMin: 0,
    endHour:   21, endMin:   0,
    show:      "Saul Boogie",
    presenter: "Saul Boogie",
    genre:     "90s New Jack Swing, Hip Hop & R&B",
  },
  {
    day:       0,
    startHour: 21, startMin: 0,
    endHour:   23, endMin:   0,
    show:      "DJ Kaie – The K-Suite",
    presenter: "DJ Kaie",
    genre:     "Slow Jams",
  },
];

/* Returns the current show object or null if nothing scheduled */
function getCurrentShow() {
  const now = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  const day  = now.getDay();
  const hour = now.getHours();
  const min  = now.getMinutes();
  const mins = hour * 60 + min;

  return SCHEDULE.find(function (s) {
    if (s.day !== day) return false;
    const start = s.startHour * 60 + s.startMin;
    const end   = s.endHour   * 60 + s.endMin;
    return mins >= start && mins < end;
  }) || null;
}

module.exports = { SCHEDULE, getCurrentShow };
