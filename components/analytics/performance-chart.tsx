"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type PerformanceData = {
  period: string;
  roi: number;
  winRate: number;
  clv: number;
};

type PerformanceChartProps = {
  data: PerformanceData[];
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.45)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.45)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            labelStyle={{ color: "#ffffff" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}
          />
          <Line
            type="monotone"
            dataKey="roi"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 4 }}
            name="ROI %"
          />
          <Line
            type="monotone"
            dataKey="clv"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ fill: "#4ade80", r: 4 }}
            name="CLV %"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-caption">
        ROI and CLV trends over time
      </p>
    </div>
  );
}
