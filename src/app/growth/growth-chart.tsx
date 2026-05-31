"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from "recharts";

type PercentilePoint = {
  month: number;
  value: number;
};

type BabyPoint = {
  month: number;
  value: number;
};

type PercentileData = {
  p3: PercentilePoint[];
  p15: PercentilePoint[];
  p50: PercentilePoint[];
  p85: PercentilePoint[];
  p97: PercentilePoint[];
};

interface GrowthChartProps {
  title: string;
  unit: string;
  percentiles: PercentileData;
  babyData: BabyPoint[];
}

function buildChartData(
  percentiles: PercentileData,
  babyData: BabyPoint[]
) {
  // Create a merged dataset keyed by month
  const map = new Map<
    number,
    {
      month: number;
      p3: number;
      p15: number;
      p50: number;
      p85: number;
      p97: number;
      baby?: number;
    }
  >();

  for (const pt of percentiles.p3) {
    map.set(pt.month, {
      month: pt.month,
      p3: pt.value,
      p15: 0,
      p50: 0,
      p85: 0,
      p97: 0,
    });
  }
  for (const pt of percentiles.p15) {
    const entry = map.get(pt.month);
    if (entry) entry.p15 = pt.value;
  }
  for (const pt of percentiles.p50) {
    const entry = map.get(pt.month);
    if (entry) entry.p50 = pt.value;
  }
  for (const pt of percentiles.p85) {
    const entry = map.get(pt.month);
    if (entry) entry.p85 = pt.value;
  }
  for (const pt of percentiles.p97) {
    const entry = map.get(pt.month);
    if (entry) entry.p97 = pt.value;
  }

  // Add baby data points
  for (const bp of babyData) {
    const existing = map.get(Math.round(bp.month));
    if (existing) {
      existing.baby = bp.value;
    } else {
      // Insert baby data at fractional months
      map.set(bp.month, {
        month: bp.month,
        p3: 0,
        p15: 0,
        p50: 0,
        p85: 0,
        p97: 0,
        baby: bp.value,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.month - b.month);
}

export function GrowthChart({
  title,
  unit,
  percentiles,
  babyData,
}: GrowthChartProps) {
  const data = buildChartData(percentiles, babyData);

  return (
    <div className="px-4 mt-4">
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          {title}
        </h2>
        <p className="text-[10px] text-gray-400 mb-3">
          WHO 百分位曲线 (P3-P97)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`band-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "月龄",
                position: "insideBottomRight",
                offset: -5,
                style: { fontSize: 10, fill: "#9ca3af" },
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              unit={unit}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "11px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  p3: "P3",
                  p15: "P15",
                  p50: "P50",
                  p85: "P85",
                  p97: "P97",
                  baby: "宝宝",
                };
                return [
                  `${value}${unit}`,
                  labels[String(name)] ?? name,
                ];
              }}
              labelFormatter={(label) => `${label} 个月`}
            />
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  p3: "P3",
                  p15: "P15",
                  p50: "P50 (中位数)",
                  p85: "P85",
                  p97: "P97",
                  baby: "宝宝",
                };
                return labels[value] ?? value;
              }}
            />
            {/* Percentile lines -- soft background */}
            <Line
              type="monotone"
              dataKey="p3"
              stroke="#bfdbfe"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p15"
              stroke="#93c5fd"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p85"
              stroke="#93c5fd"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p97"
              stroke="#bfdbfe"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
            {/* Baby's actual data -- bold coral line */}
            <Line
              type="monotone"
              dataKey="baby"
              stroke="#e8816d"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "#e8816d",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#e8816d",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
