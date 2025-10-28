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

export default function HistogramChart({ turns, bins = 10 }) {
  if (!turns || !turns.length)
    return <div className="alert alert-secondary">No hay datos</div>;

  const durations = turns.map((t) => t.duration);
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const width = (max - min) / bins || 1;

  const counts = new Array(bins).fill(0);
  for (const d of durations) {
    let idx = Math.floor((d - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  }

  const labels = counts.map(
    (_, i) =>
      `${Math.round(min + i * width)}-${Math.round(min + (i + 1) * width)}s`
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Cantidad de turnos",
        data: counts,
        backgroundColor: "rgba(13,110,253,0.7)",
      },
    ],
  };

  const options = { plugins: { legend: { display: false } } };

  return (
    <div>
      <h5>Histograma de duraciones</h5>
      <Bar data={data} options={options} />
    </div>
  );
}
