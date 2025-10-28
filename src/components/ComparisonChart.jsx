import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function getCssVar(name) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name) ||
    undefined
  );
}

export default function ComparisonChart({ statsObj }) {
  const players = Object.keys(statsObj.byPlayer);
  const avgs = players.map((p) => statsObj.byPlayer[p].avg);
  const sds = players.map((p) => statsObj.byPlayer[p].stddev);

  const accent = getCssVar("--accent") || "rgba(32,201,151,0.8)";
  const danger = getCssVar("--danger") || "rgba(220,53,69,0.8)";

  const data = {
    labels: players,
    datasets: [
      { label: "Promedio (s)", data: avgs, backgroundColor: accent.trim() },
      { label: "σ (s)", data: sds, backgroundColor: danger.trim() },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div>
      <h5>Comparativa: Promedio vs σ</h5>
      <Bar data={data} options={options} />
    </div>
  );
}
