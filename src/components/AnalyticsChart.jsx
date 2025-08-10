import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AnalyticsChart({ labels, series, ariaLabel }) {
  const data = {
    labels,
    datasets: series.map((s, i) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color || (i === 0 ? '#14d27f' : '#5eead4'),
      backgroundColor: 'transparent',
      pointRadius: 0,
      tension: 0.25,
    })),
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#a3b5ac' } }, tooltip: { mode: 'index', intersect: false } },
    scales: { x: { ticks: { color: '#a3b5ac' }, grid: { color: '#1e2a23' } }, y: { ticks: { color: '#a3b5ac' }, grid: { color: '#1e2a23' } } },
  };
  return (
    <div role="img" aria-label={ariaLabel} style={{ height: 220 }}>
      <Line data={data} options={options} />
    </div>
  );
}


