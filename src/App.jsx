import React, { useState } from "react";
import ComparisonChart from "./components/ComparisonChart";
import IprChart from "./components/IprChart";
import StatsTable from "./components/StatsTable";
import { useTheme } from "./context/ThemeContext";
import {
  computeStats,
  extractTurns,
  formatTime,
  parseLines,
} from "./lib/turns";

export default function App() {
  const [rawLog, setRawLog] = useState("");
  const [parsed, setParsed] = useState(null);
  const [turns, setTurns] = useState([]);
  const [statsObj, setStatsObj] = useState(null);
  const [ignored, setIgnored] = useState(0);
  const { paletteKey, setPaletteKey, palettes, font, fonts, setFont } =
    useTheme();

  function onAnalyze() {
    const parsedLines = parseLines(rawLog);
    setParsed(parsedLines);
    const { turns: extracted, ignored } = extractTurns(parsedLines);
    setTurns(extracted);
    setIgnored(ignored);
    const stats = computeStats(extracted);
    setStatsObj(stats);
  }

  // Theme handled by ThemeProvider via useTheme()

  return (
    <div className="container py-4">
      <h1 className="mb-3">Tontis — Analizador de turnos</h1>

      <div className="mb-3">
        <label className="form-label">
          Pegar log (o arrastrar/pegar archivo)
        </label>
        <textarea
          className="form-control"
          rows={8}
          value={rawLog}
          onChange={(e) => setRawLog(e.target.value)}
        />
      </div>

      <div className="mb-4 controls-row">
        <div>
          <button className="btn btn-primary me-2" onClick={onAnalyze}>
            Analizar
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setRawLog("");
              setParsed(null);
              setTurns([]);
              setStatsObj(null);
              setIgnored(0);
            }}
          >
            Limpiar
          </button>
        </div>

        <div className="ms-auto d-flex gap-2">
          <label className="small-muted me-1" style={{ alignSelf: "center" }}>
            Paleta
          </label>
          <select
            className="form-select form-select-sm"
            value={paletteKey}
            onChange={(e) => setPaletteKey(e.target.value)}
            style={{ width: 160 }}
          >
            {Object.keys(palettes).map((k) => (
              <option key={k} value={k}>
                {palettes[k].name}
              </option>
            ))}
          </select>

          <label className="small-muted me-1" style={{ alignSelf: "center" }}>
            Fuente
          </label>
          <select
            className="form-select form-select-sm"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            style={{ width: 160 }}
          >
            {fonts.map((f) => (
              <option key={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {statsObj && (
        <>
          <div className="mb-4">
            <h2>Estadísticas</h2>
            <p>
              Turnos analizados: <strong>{turns.length}</strong> — Turnos
              ignorados: <strong>{ignored}</strong>
            </p>
          </div>

          <div className="row">
            <div className="col-md-7">
              <div className="player-grid mb-3">
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

              <div className="accordion" id="detailsAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="false"
                      aria-controls="collapseOne"
                    >
                      Mostrar tabla detallada (ocultar/mostrar)
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingOne"
                    data-bs-parent="#detailsAccordion"
                  >
                    <div className="accordion-body">
                      <StatsTable
                        statsObj={statsObj}
                        formatTime={formatTime}
                        turns={turns}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <IprChart statsObj={statsObj} />
              <div className="mt-3">
                <ComparisonChart statsObj={statsObj} />
              </div>
            </div>
          </div>
        </>
      )}

      {!statsObj && (
        <div className="alert alert-info">
          Pega tu log a la izquierda y pulsa <strong>Analizar</strong>.
        </div>
      )}
    </div>
  );
}
