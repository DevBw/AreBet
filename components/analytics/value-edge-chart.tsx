"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ValueEdgeData = {
  matchId: number;
  market: string;
  edgePct: number;
  modelProbability: number;
  impliedProbability: number;
};

type ValueEdgeChartProps = {
  data: ValueEdgeData[];
};

export function ValueEdgeChart({ data }: ValueEdgeChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: `M${item.matchId} ${item.market}`,
    edge: item.edgePct,
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.45)"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
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
          <Bar dataKey="edge" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-caption">
        Positive edge % indicates potential value bets
      </p>
    </div>
  );
}
