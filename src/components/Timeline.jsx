import React, { useRef, useState } from "react";
import { formatTime } from "../lib/turns";
import "./timeline.css";

function pickColorForPlayer(index) {
  // generate HSL colors spaced by index
  const hue = (index * 47) % 360; // 47 is prime-ish spacing
  return `hsla(${hue}, 70%, 45%, 0.45)`;
}

export default function Timeline({ turns, statsObj }) {
  if (!turns || !turns.length)
    return (
      <div className="alert alert-secondary">No hay turnos para mostrar.</div>
    );

  const players = [...new Set(turns.map((t) => t.player))];
  const minStart = Math.min(...turns.map((t) => t.start));
  const maxEnd = Math.max(...turns.map((t) => t.end));
  const range = Math.max(1, maxEnd - minStart);

  const playerIndex = Object.fromEntries(players.map((p, i) => [p, i]));

  // configurable color state: auto | fixed | custom
  const [mode, setMode] = useState("auto");
  const [playerColors, setPlayerColors] = useState(() => {
    const map = {};
    players.forEach((p, i) => {
      map[p] = pickColorForPlayer(i);
    });
    return map;
  });

  const rootRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [compact, setCompact] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(false);

  function handleSegmentEnter(e, t) {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    // Prefer anchoring tooltip to the segment center/top for precision
    const targetRect = e.currentTarget.getBoundingClientRect();
    const segCenterX = targetRect.left + targetRect.width / 2;
    // position tooltip above the segment if space; otherwise below
    const aboveTop = targetRect.top - 8; // 8px gap
    const belowTop = targetRect.bottom + 8;
    let top = aboveTop;
    const rootRect = rect;
    // choose above if enough space, else below
    if (aboveTop - rootRect.top < 40) {
      top = belowTop;
    }

    let left = segCenterX - rootRect.left;
    // clamp horizontally with xPadding
    const xPad = 12; // breathing space
    const minX = xPad;
    const maxX = rect.width - xPad;
    if (left < minX) left = minX;
    if (left > maxX) left = maxX;
    const content = {
      player: t.player,
      start: new Date(t.start * 1000).toISOString().substr(11, 8),
      dur: formatTime(t.duration),
      outlier: t.isOutlier,
    };
    setTooltip({ left, top, content });
  }

  function handleSegmentLeave() {
    setTooltip(null);
  }

  // ticks (start, 25%, 50%, 75%, end) - we'll compute pixel positions later
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    pos: p * 100,
    time: Math.round(minStart + p * range),
  }));

  const globalAvg = statsObj?.global?.avg || 0;
  const globalStd = statsObj?.global?.stddev || 0;

  // global consolidated timeline: sort turns by start
  const sorted = [...turns].sort((a, b) => a.start - b.start);

  // compute density: smallest segment width in px (if we can access DOM)
  let minSegPx = Infinity;
  try {
    const root = rootRef.current;
    if (root) {
      const bar = root.querySelector(".global-bar");
      if (bar) {
        const barRect = bar.getBoundingClientRect();
        const barW = Math.max(1, barRect.width);
        for (const t of sorted) {
          const wpx = (t.duration / range) * barW;
          if (wpx < minSegPx) minSegPx = wpx;
        }
      }
    }
  } catch (e) {
    minSegPx = Infinity;
  }

  // prepare clustered segments if enabled and density is high
  let globalRenderSegments = sorted.map((t) => ({ type: "seg", t }));
  if (clusterEnabled && rootRef.current) {
    const bar = rootRef.current.querySelector(".global-bar");
    if (bar) {
      const barRect = bar.getBoundingClientRect();
      const barW = Math.max(1, barRect.width);
      const thresholdPx = 6; // segments narrower than this will be clustered
      const clusters = [];
      let current = null;
      for (const t of sorted) {
        const wpx = (t.duration / range) * barW;
        if (wpx < thresholdPx) {
          if (!current)
            current = {
              type: "cluster",
              start: t.start,
              end: t.end,
              members: [t],
            };
          else {
            current.end = t.end;
            current.members.push(t);
          }
        } else {
          if (current) {
            clusters.push(current);
            current = null;
          }
          clusters.push({ type: "seg", t });
        }
      }
      if (current) clusters.push(current);
      // convert clusters to render segments with left/width computed later
      globalRenderSegments = clusters;
    }
  }

  return (
    <div className={`timeline-root ${compact ? "compact" : ""}`} ref={rootRef}>
      {/* Global single-row timeline showing player ownership */}
      <div className="timeline-row">
        <div className="timeline-label">Timeline</div>
        <div className="timeline-bar global-bar">
          {globalRenderSegments.map((item, i) => {
            if (item.type === "seg") {
              const t = item.t;
              const left = ((t.start - minStart) / range) * 100;
              const width = (t.duration / range) * 100;
              const pColor =
                mode === "auto" || mode === "fixed"
                  ? playerColors[t.player] ||
                    pickColorForPlayer(playerIndex[t.player] || 0)
                  : playerColors[t.player] ||
                    pickColorForPlayer(playerIndex[t.player] || 0);
              const border = t.isOutlier
                ? "2px solid var(--danger)"
                : "1px solid rgba(0,0,0,0.06)";
              return (
                <div
                  key={`g-${i}`}
                  className="timeline-seg global-seg"
                  onMouseEnter={(e) => handleSegmentEnter(e, t)}
                  onMouseLeave={handleSegmentLeave}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: pColor,
                    border,
                    cursor: "pointer",
                  }}
                />
              );
            }
            // cluster
            const cluster = item;
            const leftPct = ((cluster.start - minStart) / range) * 100;
            const widthPct = ((cluster.end - cluster.start) / range) * 100;
            const count = cluster.members.length;
            // compute a mixed color (gray with opacity)
            const pColor = "rgba(108,117,125,0.45)";
            return (
              <div
                key={`g-${i}`}
                className="timeline-seg global-seg cluster-seg"
                onMouseEnter={(e) =>
                  handleSegmentEnter(e, {
                    player: `${count} turns`,
                    start: cluster.start,
                    duration: cluster.end - cluster.start,
                    isOutlier: false,
                  })
                }
                onMouseLeave={handleSegmentLeave}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  background: pColor,
                  border: "1px dashed rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                }}
              >
                <small>{count}</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-player rows (as before) */}
      {players.map((player) => (
        <div key={player} className="timeline-row">
          <div className="timeline-label">{player}</div>
          <div className="timeline-bar">
            {turns
              .filter((t) => t.player === player)
              .map((t, i) => {
                const left = ((t.start - minStart) / range) * 100;
                const width = (t.duration / range) * 100;
                // color by relative speed and outlier
                let color = "var(--accent)"; // faster-ish
                if (t.isOutlier) color = "var(--danger)";
                else if (t.duration > globalAvg + globalStd)
                  color = "var(--danger)";
                else if (t.duration < globalAvg - globalStd)
                  color = "var(--success)";

                const title = `Start: ${new Date(t.start * 1000)
                  .toISOString()
                  .substr(11, 8)} | Dur: ${formatTime(t.duration)} | ${
                  t.isOutlier
                    ? "OUTLIER"
                    : t.fasterThanGlobal
                    ? "faster"
                    : "slower"
                }`;

                return (
                  <div
                    key={i}
                    className="timeline-seg"
                    onMouseEnter={(e) => handleSegmentEnter(e, t)}
                    onMouseLeave={handleSegmentLeave}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: color,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
          </div>
        </div>
      ))}

      <div className="timeline-axis">
        <div className="timeline-axis-line" />
        {(() => {
          // compute pixel-aligned tick positions and clamp labels inside bar
          const root = rootRef.current;
          if (!root) {
            return ticks.map((t, i) => (
              <div
                key={i}
                className="timeline-tick"
                style={{ left: `${t.pos}%` }}
              >
                <div className="timeline-tick-mark" />
                <div className="timeline-tick-label">
                  {new Date(t.time * 1000).toISOString().substr(11, 8)}
                </div>
              </div>
            ));
          }
          const bar = root.querySelector(".global-bar");
          if (!bar) {
            return ticks.map((t, i) => (
              <div
                key={i}
                className="timeline-tick"
                style={{ left: `${t.pos}%` }}
              >
                <div className="timeline-tick-mark" />
                <div className="timeline-tick-label">
                  {new Date(t.time * 1000).toISOString().substr(11, 8)}
                </div>
              </div>
            ));
          }

          const rootRect = root.getBoundingClientRect();
          const barRect = bar.getBoundingClientRect();
          const barLeft = barRect.left - rootRect.left; // px from root
          const barW = Math.max(1, barRect.width);

          return ticks.map((t, i) => {
            const pct = t.pos / 100;
            let px = barLeft + pct * barW;
            const label = new Date(t.time * 1000).toISOString().substr(11, 8);
            const estLabelW = 70; // slightly larger approximate width in px for breathing
            // clamp to bar bounds with extra xPad
            const xPad = 12;
            const minX = barLeft + estLabelW / 2 + xPad;
            const maxX = barLeft + barW - estLabelW / 2 - xPad;
            if (px < minX) px = minX;
            if (px > maxX) px = maxX;
            return (
              <div key={i} className="timeline-tick" style={{ left: px }}>
                <div className="timeline-tick-mark" />
                <div className="timeline-tick-label">{label}</div>
              </div>
            );
          });
        })()}
      </div>

      <div className="timeline-legend mt-2 d-flex gap-3 align-items-center">
        <div>
          <label className="small-muted me-2">Palette</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="form-select form-select-sm d-inline-block"
            style={{ width: 140 }}
          >
            <option value="auto">Auto</option>
            <option value="fixed">Fixed (theme)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {players.map((p) => (
            <div key={p} className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: playerColors[p] }}
              />
              <small className="small-muted">{p}</small>
              {mode === "custom" && (
                <input
                  type="color"
                  value={playerColors[p]}
                  onChange={(e) =>
                    setPlayerColors((s) => ({ ...s, [p]: e.target.value }))
                  }
                  title={`Cambiar color de ${p}`}
                  style={{ marginLeft: 6 }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="ms-2">
          {minSegPx < 6 && (
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => setCompact((c) => !c)}
            >
              {compact ? "Compact: ON" : "Compact: OFF"}
            </button>
          )}
        </div>

        <div className="ms-auto small-muted">
          Avg: {formatTime(globalAvg)} • σ: {formatTime(globalStd)}
        </div>
      </div>

      {/* React tooltip */}
      {tooltip && (
        <div
          className="timeline-tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <div style={{ fontWeight: 700 }}>{tooltip.content.player}</div>
          <div style={{ fontSize: "0.85rem" }}>
            Inicio: {tooltip.content.start}
          </div>
          <div style={{ fontSize: "0.85rem" }}>Dur: {tooltip.content.dur}</div>
          {tooltip.content.outlier && (
            <div style={{ color: "var(--danger)", fontWeight: 600 }}>
              OUTLIER
            </div>
          )}
        </div>
      )}
    </div>
  );
}
