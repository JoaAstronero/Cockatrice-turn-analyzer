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

export default function CountChart({ statsObj }) {
  if (!statsObj) return null;
  const players = Object.keys(statsObj.byPlayer);
  const counts = players.map((p) => statsObj.byPlayer[p].count);

  const data = {
    labels: players,
    datasets: [
      {
        label: "Turnos",
        data: counts,
        backgroundColor: "rgba(32,201,151,0.8)",
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div>
      <h5>Turnos por jugador</h5>
      <Bar data={data} options={options} />
    </div>
  );
}
