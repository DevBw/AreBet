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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            stroke="#a8b6c4"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
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
          <Bar dataKey="edge" fill="#08db4f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem", textAlign: "center" }}>
        Positive edge % indicates potential value bets
      </p>
    </div>
  );
}
