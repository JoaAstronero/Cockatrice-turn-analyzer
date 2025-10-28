// Lógica de parsing y cálculo (ESM) exportada para uso en frontend

/**
 * Formatea segundos a mm:ss.SS
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return `${m.toString().padStart(2, "0")}:${s.padStart(5, "0")}`;
}

export function parseLines(rawLog) {
  if (!rawLog) return [];
  return rawLog
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^\[(\d{1,2}):(\d{2}):(\d{2})\]\s*(.*)$/);
      if (!m) return null;
      const [, h, mm, s, rest] = m;
      return {
        time: Number(h) * 3600 + Number(mm) * 60 + Number(s),
        text: rest,
        raw,
      };
    })
    .filter(Boolean);
}

const MIN_TURN_DURATION = 2;

export function extractTurns(parsedLines) {
  // We need to handle logs that cross midnight. parsedLines contain times as
  // seconds-since-midnight; to get a monotonic timeline we compute an
  // absolute time by adding 24h offsets whenever the clock goes backwards.
  const turns = [];
  let currentTurn = null;
  let ignoredTurns = 0;

  let prevTime = null;
  let dayOffset = 0;

  for (const entry of parsedLines) {
    // compute absolute monotonic time
    if (prevTime !== null && entry.time < prevTime) {
      // clock wrapped to next day
      dayOffset += 24 * 3600;
    }
    const absTime = entry.time + dayOffset;
    prevTime = entry.time;

    const turnMatch = entry.text.match(/^(.+?)'s turn\.?$/);
    if (turnMatch) {
      if (currentTurn) {
        currentTurn.end = absTime;
        // ensure end >= start
        if (currentTurn.end < currentTurn.start) currentTurn.end += 24 * 3600;
        currentTurn.duration = currentTurn.end - currentTurn.start;
        if (currentTurn.duration >= MIN_TURN_DURATION) {
          turns.push(currentTurn);
        } else {
          ignoredTurns++;
        }
      }
      currentTurn = { player: turnMatch[1], start: absTime, end: null };
    }
  }

  if (currentTurn) {
    // use last absolute time as end
    const lastEntry = parsedLines[parsedLines.length - 1];
    // compute absolute last time (may need the same dayOffset behavior)
    // Recompute by iterating to the last to get correct offset
    let pd = null;
    let off = 0;
    for (const e of parsedLines) {
      if (pd !== null && e.time < pd) off += 24 * 3600;
      pd = e.time;
    }
    const lastAbs = lastEntry.time + off;

    currentTurn.end = lastAbs;
    if (currentTurn.end < currentTurn.start) currentTurn.end += 24 * 3600;
    currentTurn.duration = currentTurn.end - currentTurn.start;
    if (currentTurn.duration >= MIN_TURN_DURATION) turns.push(currentTurn);
    else ignoredTurns++;
  }

  return { turns, ignored: ignoredTurns };
}

// Helper: desviación estándar
function stddev(arr) {
  if (!arr.length) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance =
    arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / arr.length;
  return Math.sqrt(variance);
}

export function computeStats(turns) {
  const stats = {};
  for (const t of turns) {
    if (!stats[t.player]) stats[t.player] = [];
    stats[t.player].push(t.duration);
  }

  let allDurations = [];
  for (const p in stats) allDurations = allDurations.concat(stats[p]);
  const globalAvg =
    allDurations.reduce((a, b) => a + b, 0) / (allDurations.length || 1);

  // byPlayer: include avg, min, max, stddev, ipr (to compute later), percent faster, outliers
  const byPlayer = {};
  for (const p in stats) {
    const durations = stats[p];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const sd = stddev(durations);
    const aboveGlobal = durations.filter((d) => d > globalAvg).length;
    const belowGlobal = durations.filter((d) => d < globalAvg).length;
    const percentFaster = Math.round(
      (durations.filter((d) => d < globalAvg).length / durations.length) * 100
    );
    // IPR = average of (globalAvg - duration) -> positive means faster than global avg
    const deltas = durations.map((d) => globalAvg - d);
    const ipr = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    // outliers: > 3*sd from player avg OR > 300s threshold
    const outliers = durations.filter(
      (d) => Math.abs(d - avg) > 3 * sd || d > 300
    );

    byPlayer[p] = {
      count: durations.length,
      avg,
      min: Math.min(...durations),
      max: Math.max(...durations),
      stddev: sd,
      ipr,
      percentFaster,
      outliersCount: outliers.length,
      durations,
    };
  }

  // global summary
  const longest = Math.max(...allDurations);
  const shortest = Math.min(...allDurations);
  const moreThanAvg = allDurations.filter((d) => d > globalAvg).length;
  const lessThanAvg = allDurations.filter((d) => d < globalAvg).length;

  // annotate turns with helpful flags: outlier, fasterThanGlobal, delta
  const globalStd = stddev(allDurations);
  for (const t of turns) {
    const pStats = byPlayer[t.player];
    const playerAvg = pStats ? pStats.avg : 0;
    const isOutlier =
      Math.abs(t.duration - playerAvg) > 3 * (pStats?.stddev || 0) ||
      t.duration > 300;
    const deltaToGlobal = globalAvg - t.duration;
    const fasterThanGlobal = t.duration < globalAvg;
    t.isOutlier = Boolean(isOutlier);
    t.deltaToGlobal = deltaToGlobal;
    t.fasterThanGlobal = Boolean(fasterThanGlobal);
  }

  return {
    byPlayer,
    global: {
      avg: globalAvg,
      stddev: globalStd,
      longest,
      shortest,
      moreThanAvg,
      lessThanAvg,
    },
  };
}
