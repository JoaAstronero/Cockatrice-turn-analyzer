import React from "react";
import { formatTime } from "../lib/turns";
import StatsTable from "./StatsTable";

export default function TablesView({ statsObj, turns }) {
  if (!statsObj)
    return (
      <div className="alert alert-secondary">
        Analiza un log primero (pestaña "Cargar").
      </div>
    );

  const byPlayer = statsObj.byPlayer;

  const players = Object.keys(byPlayer);

  return (
    <div>
      <h3>Tablas</h3>
      <p className="small-muted">Tabla completa y por-turno (accordion).</p>

      <StatsTable statsObj={statsObj} turns={turns} />

      <hr />

      <div className="accordion" id="playerAccordion">
        {players.map((player, idx) => {
          const plTurns = turns.filter((t) => t.player === player);
          return (
            <div className="accordion-item" key={player}>
              <h2 className="accordion-header" id={`heading-${idx}`}>
                <button
                  className={`accordion-button collapsed`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${idx}`}
                  aria-expanded="false"
                  aria-controls={`collapse-${idx}`}
                >
                  {player} — {byPlayer[player].count} turnos
                </button>
              </h2>
              <div
                id={`collapse-${idx}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading-${idx}`}
                data-bs-parent="#playerAccordion"
              >
                <div className="accordion-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Inicio</th>
                          <th>Dur</th>
                          <th>Δ vs avg (s)</th>
                          <th>Outlier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plTurns.map((t, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                              {new Date(t.start * 1000)
                                .toISOString()
                                .substr(11, 8)}
                            </td>
                            <td>{formatTime(t.duration)}</td>
                            {/* show duration minus global avg: positive = slower, negative = faster */}
                            <td
                              style={{
                                color:
                                  t.duration - statsObj.global.avg > 0
                                    ? "red"
                                    : "green",
                              }}
                            >
                              {t.duration - statsObj.global.avg > 0 ? "+" : ""}
                              {Math.round(t.duration - statsObj.global.avg)}s
                            </td>
                            <td>{t.isOutlier ? "✓" : "✗"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
