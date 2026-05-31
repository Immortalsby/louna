"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface VaccineEntry {
  id: string;
  name: string;
  scheduledDate: string;
  optional: boolean;
  done: boolean;
  doneDate?: string;
  batchNo?: string;
}

const INITIAL_VACCINES: VaccineEntry[] = [
  {
    id: "hex-2m",
    name: "Hexavalent (DTPCHiB)",
    scheduledDate: "2026-01-23",
    optional: false,
    done: true,
    doneDate: "2026-01-23",
  },
  {
    id: "pcv-2m",
    name: "PCV13 (Pneumocoque)",
    scheduledDate: "2026-01-23",
    optional: false,
    done: true,
    doneDate: "2026-01-23",
  },
  {
    id: "hex-4m",
    name: "Hexavalent (DTPCHiB)",
    scheduledDate: "2026-03-23",
    optional: false,
    done: true,
    doneDate: "2026-03-23",
  },
  {
    id: "pcv-4m",
    name: "PCV13 (Pneumocoque)",
    scheduledDate: "2026-03-23",
    optional: false,
    done: true,
    doneDate: "2026-03-23",
  },
  {
    id: "menb-5m",
    name: "Meningocoque B",
    scheduledDate: "2026-04-23",
    optional: true,
    done: false,
  },
  {
    id: "hex-11m",
    name: "Hexavalent (DTPCHiB) rappel",
    scheduledDate: "2026-10-23",
    optional: false,
    done: false,
  },
  {
    id: "pcv-11m",
    name: "PCV13 (Pneumocoque) rappel",
    scheduledDate: "2026-10-23",
    optional: false,
    done: false,
  },
  {
    id: "menc-12m",
    name: "Meningocoque C",
    scheduledDate: "2026-11-23",
    optional: false,
    done: false,
  },
  {
    id: "mmr-12m",
    name: "ROR (Rougeole-Oreillons-Rubeole)",
    scheduledDate: "2026-11-23",
    optional: false,
    done: false,
  },
  {
    id: "menb-16m",
    name: "Meningocoque B rappel",
    scheduledDate: "2027-03-23",
    optional: true,
    done: false,
  },
];

function getStatus(
  vaccine: VaccineEntry,
  today: Date
): { label: string; icon: string; color: string } {
  if (vaccine.done) {
    return { label: "已完成", icon: "✅", color: "bg-green-50 border-green-200" };
  }
  const scheduled = new Date(vaccine.scheduledDate);
  if (scheduled < today) {
    return { label: "已过期", icon: "⚠️", color: "bg-amber-50 border-amber-200" };
  }
  return { label: "待接种", icon: "⏳", color: "bg-blue-50 border-blue-200" };
}

function daysUntil(dateStr: string, today: Date): number {
  const target = new Date(dateStr);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getAgeLabel(scheduledDate: string): string {
  const birthday = new Date("2025-11-23");
  const scheduled = new Date(scheduledDate);
  const months = Math.round(
    (scheduled.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (months < 12) return `${months} 个月`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} 岁`;
  return `${years} 岁 ${rem} 个月`;
}

export function VaccineCalendar() {
  const [vaccines, setVaccines] = useState<VaccineEntry[]>(INITIAL_VACCINES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editBatch, setEditBatch] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleMarkDone(id: string) {
    setEditingId(id);
    setEditDate(new Date().toISOString().split("T")[0]);
    setEditBatch("");
  }

  function handleSave(id: string) {
    setVaccines((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, done: true, doneDate: editDate, batchNo: editBatch || undefined }
          : v
      )
    );
    setEditingId(null);
  }

  function handleCancel() {
    setEditingId(null);
  }

  // Group by scheduled date
  const groups = vaccines.reduce<Record<string, VaccineEntry[]>>((acc, v) => {
    const key = v.scheduledDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const sortedDates = Object.keys(groups).sort();

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const items = groups[date];
        const ageLabel = getAgeLabel(date);
        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {ageLabel}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(date)}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((vaccine) => {
                const status = getStatus(vaccine, today);
                const days = daysUntil(vaccine.scheduledDate, today);
                const isEditing = editingId === vaccine.id;

                return (
                  <Card
                    key={vaccine.id}
                    className={`${status.color} transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{status.icon}</span>
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {vaccine.name}
                          </span>
                          {vaccine.optional && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 whitespace-nowrap">
                              可选
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {vaccine.done && vaccine.doneDate ? (
                            <span>
                              接种日期: {formatDate(vaccine.doneDate)}
                              {vaccine.batchNo && (
                                <span className="ml-2">
                                  批号: {vaccine.batchNo}
                                </span>
                              )}
                            </span>
                          ) : days > 0 ? (
                            <span>还有 {days} 天</span>
                          ) : days === 0 ? (
                            <span className="text-amber-600 font-medium">今天</span>
                          ) : (
                            <span className="text-red-500 font-medium">
                              已过期 {Math.abs(days)} 天
                            </span>
                          )}
                        </div>
                      </div>
                      {!vaccine.done && !isEditing && (
                        <button
                          onClick={() => handleMarkDone(vaccine.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white font-medium whitespace-nowrap"
                        >
                          标记完成
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            接种日期
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            批号 (可选)
                          </label>
                          <input
                            type="text"
                            value={editBatch}
                            onChange={(e) => setEditBatch(e.target.value)}
                            placeholder="输入批号..."
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSave(vaccine.id)}
                            className="flex-1 text-sm py-2 rounded-lg bg-green-500 text-white font-medium"
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 text-sm py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
