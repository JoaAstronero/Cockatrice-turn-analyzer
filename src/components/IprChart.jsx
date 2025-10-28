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

export default function IprChart({ statsObj }) {
  const players = Object.keys(statsObj.byPlayer);
  const iprs = players.map((p) => statsObj.byPlayer[p].ipr);

  const data = {
    labels: players,
    datasets: [
      {
        label: "IPR (positivo=rápido) ",
        data: iprs,
        backgroundColor: iprs.map((v) =>
          v >= 0 ? "rgba(40,167,69,0.7)" : "rgba(220,53,69,0.7)"
        ),
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } },
  };

  return (
    <div>
      <h5>IPR por jugador</h5>
      <Bar data={data} options={options} />
    </div>
  );
}
