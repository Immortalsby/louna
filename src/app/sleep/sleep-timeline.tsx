"use client";

type SleepPeriod = {
  startHour: number;
  endHour: number;
  type: "sleep" | "wake";
};

interface SleepTimelineProps {
  periods: SleepPeriod[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function SleepTimeline({ periods }: SleepTimelineProps) {
  if (periods.length === 0) {
    return (
      <div className="px-4 mt-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            今日睡眠时间线
          </h2>
          <p className="text-sm text-gray-400 text-center py-4">暂无记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4">
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          今日睡眠时间线
        </h2>
        {/* Hour labels */}
        <div className="flex justify-between text-[10px] text-gray-400 mb-1 px-0.5">
          {[0, 4, 8, 12, 16, 20, 24].map((h) => (
            <span key={h}>{h.toString().padStart(2, "0")}</span>
          ))}
        </div>
        {/* Timeline bar */}
        <div className="relative h-8 rounded-lg bg-gray-100 overflow-hidden">
          {periods.map((period, i) => {
            const left = (period.startHour / 24) * 100;
            const width =
              ((period.endHour - period.startHour) / 24) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 h-full rounded-sm"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 0.5)}%`,
                  backgroundColor:
                    period.type === "sleep" ? "#818cf8" : "#fbbf24",
                }}
              />
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-indigo-400" />
            <span>睡眠</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-400" />
            <span>清醒</span>
          </div>
        </div>
      </div>
    </div>
  );
}
