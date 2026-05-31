import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatBox } from "@/components/ui/stat-box";
import { FeedingChart } from "./feeding-chart";
import { AddFeeding } from "./add-feeding";

const BABY_ID = process.env.BABY_ID!;

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function FeedingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const { period = "today" } = await searchParams;

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let periodStart: Date;
  let periodLabel: string;

  if (period === "7d") {
    periodStart = new Date(todayStart);
    periodStart.setDate(periodStart.getDate() - 6);
    periodLabel = "7天";
  } else if (period === "30d") {
    periodStart = new Date(todayStart);
    periodStart.setDate(periodStart.getDate() - 29);
    periodLabel = "30天";
  } else {
    periodStart = todayStart;
    periodLabel = "今天";
  }

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  // Fetch all feeding logs for the period
  const feedingLogs = await prisma.feedingLog.findMany({
    where: {
      babyId: BABY_ID,
      time: { gte: periodStart, lt: todayEnd },
    },
    orderBy: { time: "desc" },
  });

  // Today's logs for the list view
  const todayLogs = feedingLogs.filter(
    (f) => f.time >= todayStart && f.time < todayEnd
  );

  // Period stats
  const periodMilkTotal = feedingLogs
    .filter((f) => f.type === "MILK" && f.ml)
    .reduce((sum, f) => sum + (f.ml ?? 0), 0);

  const periodSolidCount = feedingLogs.filter(
    (f) => f.type === "SOLID"
  ).length;

  const periodTotalCount = feedingLogs.length;

  // Chart data: daily milk totals for 7d/30d views
  const chartData: { date: string; ml: number }[] = [];
  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayMl = feedingLogs
        .filter(
          (f) =>
            f.type === "MILK" && f.ml && f.time >= dayStart && f.time < dayEnd
        )
        .reduce((sum, f) => sum + (f.ml ?? 0), 0);

      const label = `${dayStart.getMonth() + 1}/${dayStart.getDate()}`;
      chartData.push({ date: label, ml: dayMl });
    }
  }

  const tabs = [
    { key: "today", label: "今天" },
    { key: "7d", label: "7天" },
    { key: "30d", label: "30天" },
  ];

  return (
    <div className="pb-24">
      <PageHeader title="🍼 喂养记录" />

      {/* Tab switch */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <a
              key={tab.key}
              href={`/feeding${tab.key === "today" ? "" : `?period=${tab.key}`}`}
              className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                (period === tab.key || (period === "today" && tab.key === "today"))
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content based on period */}
      {period === "today" || period === undefined ? (
        /* Today view: chronological list */
        <div className="px-4">
          {todayLogs.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-8">
                今天还没有喂养记录
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayLogs.map((log) => (
                <Card key={log.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {log.type === "MILK" ? "🍼" : "🥣"}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {log.type === "MILK" ? "奶" : "辅食"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.type === "MILK"
                            ? `${log.ml ?? 0}ml`
                            : `${log.food ?? ""}${log.amount ? ` ${log.amount}` : ""}`}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTime(log.time)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 7d / 30d view: chart */
        <div className="px-4">
          <Card className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              每日奶量 (ml)
            </h3>
            <FeedingChart data={chartData} />
          </Card>
        </div>
      )}

      {/* Period stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            value={periodMilkTotal}
            label={`${periodLabel}奶量`}
            unit="ml"
          />
          <StatBox
            value={periodSolidCount}
            label={`${periodLabel}辅食`}
            unit="次"
          />
          <StatBox
            value={periodTotalCount}
            label={`${periodLabel}总计`}
            unit="次"
          />
        </div>
      </div>

      {/* Floating add button */}
      <AddFeeding />
    </div>
  );
}
