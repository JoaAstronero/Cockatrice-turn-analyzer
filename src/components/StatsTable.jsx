import React from "react";
import { formatTime as libFormatTime } from "../lib/turns";
import KeywordHelp from "./KeywordHelp2";

export default function StatsTable({ statsObj, formatTime, turns }) {
  // fallback to library formatter if not provided
  const fmt = formatTime || libFormatTime;
  const rows = Object.entries(statsObj.byPlayer).map(([player, data]) => ({
    player,
    ...data,
  }));
  // Sort by ipr descending (higher ipr -> faster than avg)
  rows.sort((a, b) => b.ipr - a.ipr);

  return (
    <div>
      <table className="table table-sm table-striped">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>#</th>
            <th>Promedio</th>
            <th>Min</th>
            <th>Max</th>
            <th>
              σ{" "}
              <KeywordHelp
                title="Desviación estándar"
                text="Mide cuánto varían los turnos del jugador. σ pequeña = más consistente."
              />
            </th>
            <th>
              IPR{" "}
              <KeywordHelp
                title="IPR"
                text="Índice de desempeño relativo: positivo → más rápido que la media; negativo → más lento."
              />
            </th>
            <th>
              % más rápido{" "}
              <KeywordHelp
                title="% más rápido"
                text="Porcentaje de turnos del jugador que fueron más rápidos que la media global."
              />
            </th>
            <th>
              Outliers{" "}
              <KeywordHelp
                title="Outliers"
                text="Turnos extremos, marcados si superan 300s o 3σ del promedio del jugador."
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.player}>
              <td>{r.player}</td>
              <td>{r.count}</td>
              <td>{fmt(r.avg)}</td>
              <td>{fmt(r.min)}</td>
              <td>{fmt(r.max)}</td>
              <td>{r.stddev.toFixed(2)}</td>
              <td>{r.ipr.toFixed(2)}</td>
              <td>{r.percentFaster}%</td>
              <td>{r.outliersCount > 0 ? "⚠️ " + r.outliersCount : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
