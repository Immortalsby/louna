"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type DaySleep = {
  date: string;
  hours: number;
};

interface SleepChartProps {
  data: DaySleep[];
}

export function SleepChart({ data }: SleepChartProps) {
  if (data.length === 0) {
    return (
      <div className="px-4 mt-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            近7日睡眠时长
          </h2>
          <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4 mb-6">
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          近7日睡眠时长
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              unit="h"
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)}h`, "睡眠"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.hours >= 12 ? "#818cf8" : entry.hours >= 10 ? "#a5b4fc" : "#c7d2fe"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
