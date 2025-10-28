import React, { useState } from "react";
import ChartsView from "./components/ChartsView";
import ComparisonChart from "./components/ComparisonChart";
import IprChart from "./components/IprChart";
import LoadView from "./components/LoadView";
import StatsTable from "./components/StatsTable";
import SummaryView from "./components/SummaryView";
import TablesView from "./components/TablesView";
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
  const { paletteKey, setPaletteKey, palettes, font } = useTheme();
  const [tab, setTab] = useState("load");

  function onAnalyze() {
    const parsedLines = parseLines(rawLog);
    setParsed(parsedLines);
    const { turns: extracted, ignored } = extractTurns(parsedLines);
    setTurns(extracted);
    setIgnored(ignored);
    const stats = computeStats(extracted);
    setStatsObj(stats);
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Tontis — Analizador de turnos</h1>

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

        <div className="ms-auto d-flex gap-2 align-items-center">
          {/* Stylized light/dark toggle */}
          <div className="theme-toggle">
            <input
              type="checkbox"
              id="themeToggle"
              checked={paletteKey === "dark"}
              onChange={(e) => setPaletteKey(e.target.checked ? "dark" : "light")}
            />
            <label htmlFor="themeToggle">
              <span className="toggle-track" />
            </label>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "load" ? "active" : ""}`}
            onClick={() => setTab("load")}
          >
            Cargar
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "summary" ? "active" : ""}`}
            onClick={() => setTab("summary")}
          >
            Resumen
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "charts" ? "active" : ""}`}
            onClick={() => setTab("charts")}
          >
            Gráficos
          </button>
        </li>
        <li className="nav-item ms-auto">
          <button
            className={`nav-link ${tab === "tables" ? "active" : ""}`}
            onClick={() => setTab("tables")}
          >
            Tablas
          </button>
        </li>
      </ul>

      <div>
        {tab === "load" && (
          <LoadView
            rawLog={rawLog}
            setRawLog={setRawLog}
            onAnalyze={onAnalyze}
            setTab={setTab}
          />
        )}
        {tab === "summary" && <SummaryView statsObj={statsObj} turns={turns} />}
        {tab === "charts" && <ChartsView statsObj={statsObj} turns={turns} />}
        {tab === "tables" && <TablesView statsObj={statsObj} turns={turns} />}
      </div>
    </div>
  );
}
