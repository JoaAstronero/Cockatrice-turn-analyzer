import React from "react";
import { formatTime } from "../lib/turns";

export default function SummaryView({ statsObj, turns }) {
  if (!statsObj)
    return (
      <div className="alert alert-secondary">
        Analiza un log primero (pestaña "Cargar").
      </div>
    );

  return (
    <div>
      <h3>Resumen</h3>
      <p className="small-muted">
        Resumen rápido por jugador. Usa la pestaña "Gráficos" para comparativas
        visuales.
      </p>

      <div className="player-grid">
        {Object.entries(statsObj.byPlayer).map(([player, data]) => {
          const clr = data.ipr >= 0 ? "var(--accent)" : "var(--danger)";
          return (
            <div
              key={player}
              className="player-card"
              style={{ borderLeftColor: clr }}
            >
              <div className="player-name">{player}</div>
              <div className="player-stat">
                Turnos: <strong>{data.count}</strong>
              </div>
              <div className="player-stat">
                Promedio: <strong>{formatTime(data.avg)}</strong>
              </div>
              <div className="player-stat">
                IPR: <strong>{data.ipr.toFixed(2)}</strong>
              </div>
              <div className="player-stat">
                σ: <strong>{data.stddev.toFixed(2)}</strong>
              </div>
              <div className="player-stat small-muted">
                % más rápido: {data.percentFaster}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
