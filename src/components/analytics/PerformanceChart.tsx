"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsData } from "@/lib/types";

interface PerformanceChartProps {
  data: AnalyticsData;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.labels.map((label, i) => ({
    day: label,
    reach: data.reach[i],
  }));

  return (
    <div className="bg-surface border border-white/7 rounded-2xl p-5">
      <div className="text-sm font-bold mb-4">Охваты за неделю</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#888899", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#888899", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#22222f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#f0f0ff",
              fontFamily: "Syne, sans-serif",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="reach"
            stroke="#6c63ff"
            strokeWidth={2}
            dot={{ fill: "#a78bfa", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
