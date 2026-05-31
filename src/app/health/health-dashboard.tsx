"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TempEntry {
  id: string;
  temp: number;
  time: string;
}

function generateSampleData(): TempEntry[] {
  const now = new Date();
  const entries: TempEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(8, 0, 0, 0);
    entries.push({
      id: `morning-${i}`,
      temp: 36.5 + Math.random() * 0.8,
      time: d.toISOString(),
    });
    if (i > 0) {
      const evening = new Date(d);
      evening.setHours(19, 0, 0, 0);
      entries.push({
        id: `evening-${i}`,
        temp: 36.6 + Math.random() * 0.9,
        time: evening.toISOString(),
      });
    }
  }
  return entries;
}

function getTempStatus(temp: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (temp < 37.5) {
    return {
      label: "正常",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  }
  if (temp < 38) {
    return {
      label: "偏高",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  }
  if (temp < 38.5) {
    return {
      label: "发烧",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    };
  }
  return {
    label: "高烧",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  };
}

function formatChartDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
}

function formatShortDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const EMERGENCY_CONTACTS = [
  { name: "SAMU", number: "15", description: "急救" },
  { name: "Pompiers", number: "18", description: "消防急救" },
  {
    name: "SOS Medecins Paris",
    number: "01 47 07 77 77",
    description: "上门医生",
  },
  {
    name: "Centre antipoison",
    number: "01 40 05 48 48",
    description: "中毒急救",
  },
];

export function HealthDashboard() {
  const [temps, setTemps] = useState<TempEntry[]>(generateSampleData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemp, setNewTemp] = useState("36.8");

  const latestTemp = temps[temps.length - 1];
  const status = latestTemp ? getTempStatus(latestTemp.temp) : null;

  const chartData = temps.map((t) => ({
    time: formatChartDate(t.time),
    shortDate: formatShortDate(t.time),
    temp: Math.round(t.temp * 10) / 10,
  }));

  function handleAddTemp() {
    const tempVal = parseFloat(newTemp);
    if (isNaN(tempVal) || tempVal < 34 || tempVal > 43) return;

    const entry: TempEntry = {
      id: `manual-${Date.now()}`,
      temp: tempVal,
      time: new Date().toISOString(),
    };
    setTemps((prev) => [...prev, entry]);
    setShowAddForm(false);
    setNewTemp("36.8");
  }

  return (
    <div className="space-y-4">
      {/* Latest temperature */}
      {latestTemp && status && (
        <Card className={`${status.bgColor} ${status.borderColor}`}>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">当前体温</div>
            <div className="text-4xl font-bold text-gray-900">
              {latestTemp.temp.toFixed(1)}
              <span className="text-lg font-normal text-gray-400 ml-0.5">
                °C
              </span>
            </div>
            <div className={`text-sm font-semibold mt-1 ${status.color}`}>
              {status.label}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(latestTemp.time).toLocaleString("zh-CN", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {latestTemp.temp >= 38.5 && (
            <div className="mt-3 p-3 bg-red-100 rounded-xl border border-red-300">
              <div className="text-sm font-bold text-red-700">
                ⚠️ 高烧警告
              </div>
              <div className="text-xs text-red-600 mt-1">
                体温超过 38.5°C，建议立即联系医生或拨打 SAMU: 15
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Quick add */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm shadow-sm"
        >
          + 记录体温
        </button>
      ) : (
        <Card>
          <div className="text-sm font-medium text-gray-700 mb-2">
            记录体温
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                step="0.1"
                min="34"
                max="43"
                value={newTemp}
                onChange={(e) => setNewTemp(e.target.value)}
                className="w-full text-2xl font-bold text-center border border-gray-300 rounded-xl px-3 py-2 bg-white"
              />
              <div className="text-xs text-gray-400 text-center mt-1">°C</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddTemp}
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium"
              >
                保存
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Temperature chart */}
      <Card>
        <div className="text-sm font-medium text-gray-700 mb-3">
          近 7 天体温趋势
        </div>
        <div className="h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                domain={[35.5, 40]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(v: unknown) => `${v}°`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => [`${value}°C`, "体温"]}
              />
              <ReferenceLine
                y={37.5}
                stroke="#eab308"
                strokeDasharray="4 4"
                label={{
                  value: "37.5°C",
                  position: "right",
                  fontSize: 10,
                  fill: "#eab308",
                }}
              />
              <ReferenceLine
                y={38.5}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: "38.5°C",
                  position: "right",
                  fontSize: 10,
                  fill: "#ef4444",
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--primary)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Emergency contacts */}
      <Card>
        <div className="text-sm font-medium text-gray-700 mb-3">
          🚨 紧急联系电话
        </div>
        <div className="space-y-2">
          {EMERGENCY_CONTACTS.map((contact) => (
            <a
              key={contact.number}
              href={`tel:${contact.number.replace(/\s/g, "")}`}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 active:bg-gray-100 transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {contact.name}
                </div>
                <div className="text-xs text-gray-500">{contact.description}</div>
              </div>
              <div className="text-sm font-bold text-[var(--primary)]">
                {contact.number}
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
