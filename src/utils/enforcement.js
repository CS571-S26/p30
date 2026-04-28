/**
 * Enforcement schedule parser for City of Madison ADA parking data.
 *
 * Known `enforced` field values in the dataset:
 *   '24 Hours'
 *   '7:30a-1p Su Only'
 *   '8:30a-6p M-F, 8a-6p Sa'
 *   '8a-6p M-F'
 *   'Sa-Su'
 *
 * Day indices match Date.getDay(): 0 = Sunday, 1 = Monday, … 6 = Saturday.
 */

/**
 * Returns the visit status for a spot given a planned arrival.
 *
 * @param {object} spot         - Spot object with .enforced and .timeLimitMin fields
 * @param {number} dayIndex     - Day of week (0 = Sun … 6 = Sat)
 * @param {number} arrivalMins  - Arrival time as minutes from midnight (e.g. 870 = 2:30 pm)
 * @param {number|null} stayMins - Planned stay in minutes; null means "not sure"
 * @returns {'free' | 'fits' | 'exceeds'}
 */
export function getVisitStatus(spot, dayIndex, arrivalMins, stayMins) {
  const enforced = isEnforcedAt(spot.enforced, dayIndex, arrivalMins);
  if (!enforced) return 'free';

  // Spot is enforced — check whether the stay fits within the time limit
  if (stayMins === null || stayMins === undefined) return 'fits'; // unknown stay → show as "enforced"
  const limitMins = parseInt(spot.timeLimitMin);
  if (isNaN(limitMins) || limitMins <= 0) return 'fits'; // no limit data → assume ok
  return stayMins <= limitMins ? 'fits' : 'exceeds';
}

/**
 * Returns true if enforcement is active at the given day and time.
 */
export function isEnforcedAt(enforcedStr, dayIndex, minutesFromMidnight) {
  const s = (enforcedStr || '').trim();
  if (!s) return false;
  if (s === '24 Hours') return true;

  // Multiple schedule windows separated by comma: "8:30a-6p M-F, 8a-6p Sa"
  return s
    .split(',')
    .map(seg => seg.trim())
    .some(seg => matchesSegment(seg, dayIndex, minutesFromMidnight));
}

// ─── Internal helpers ────────────────────────────────────────────────────────

// Parse "8a", "8:30a", "6p", "1p" → minutes from midnight
function parseTimeMins(str) {
  const m = (str || '').trim().match(/^(\d+)(?::(\d+))?\s*(a|p)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const ap = m[3].toLowerCase();
  if (ap === 'p' && h !== 12) h += 12;
  if (ap === 'a' && h === 12) h = 0;
  return h * 60 + min;
}

// Day abbreviation → index matching Date.getDay()
const DAY_ABBR = { Su: 0, M: 1, Tu: 2, W: 3, Th: 4, F: 5, Sa: 6 };

// Expand a day specifier ("M-F", "Sa-Su", "Su", "Su Only") → Set of day indices.
// Handles wrapping ranges: "Sa-Su" yields {6, 0}.
function parseDays(dayStr) {
  const days = new Set();
  const parts = dayStr
    .replace(/\s*Only$/i, '')
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean);

  for (const part of parts) {
    const dash = part.indexOf('-');
    if (dash > 0) {
      const fromAbbr = part.slice(0, dash);
      const toAbbr = part.slice(dash + 1);
      const from = DAY_ABBR[fromAbbr];
      const to = DAY_ABBR[toAbbr];
      if (from === undefined || to === undefined) continue;
      // Walk forward, wrapping around the week (max 7 steps)
      let d = from;
      for (let i = 0; i <= 7; i++) {
        days.add(d % 7);
        if (d % 7 === to) break;
        d++;
      }
    } else {
      const d = DAY_ABBR[part];
      if (d !== undefined) days.add(d);
    }
  }
  return days;
}

// Check a single schedule segment, e.g. "8:30a-6p M-F" or "Sa-Su"
function matchesSegment(seg, dayIndex, minutesFromMidnight) {
  // Pattern: TIME-TIME DAYS (e.g. "8:30a-6p M-F", "7:30a-1p Su Only")
  const tdMatch = seg.match(/^(\d+(?::\d+)?[ap])-(\d+(?::\d+)?[ap])\s+(.+)$/i);
  if (tdMatch) {
    const start = parseTimeMins(tdMatch[1]);
    const end = parseTimeMins(tdMatch[2]);
    const days = parseDays(tdMatch[3]);
    if (!days.has(dayIndex)) return false;
    if (start === null || end === null) return true; // day matched, no time → all day
    return minutesFromMidnight >= start && minutesFromMidnight < end;
  }

  // Day-only pattern: "Sa-Su" (enforced all day on those days)
  const days = parseDays(seg);
  return days.has(dayIndex);
}
