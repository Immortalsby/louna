"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FeedingChartProps {
  data: { date: string; ml: number }[];
}

export function FeedingChart({ data }: FeedingChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>
    );
  }

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            interval={data.length > 10 ? Math.floor(data.length / 7) : 0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #f3f4f6",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`${value}ml`, "奶量"]}
          />
          <Bar
            dataKey="ml"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
