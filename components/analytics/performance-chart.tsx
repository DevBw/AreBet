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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" stroke="#a8b6c4" fontSize={12} />
          <YAxis stroke="#a8b6c4" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#081526",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            labelStyle={{ color: "#f2f5f7" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "13px", color: "#a8b6c4" }}
          />
          <Line
            type="monotone"
            dataKey="roi"
            stroke="#08db4f"
            strokeWidth={2}
            dot={{ fill: "#08db4f", r: 4 }}
            name="ROI %"
          />
          <Line
            type="monotone"
            dataKey="clv"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 4 }}
            name="CLV %"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem", textAlign: "center" }}>
        ROI and CLV trends over time
      </p>
    </div>
  );
}
