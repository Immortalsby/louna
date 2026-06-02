import Link from "next/link";
import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatBox } from "@/components/ui/stat-box";
import { PageHeader } from "@/components/ui/page-header";
import { nowParis, parisStartOfDay, parisEndOfDay } from "@/lib/timezone";
import { subDays } from "date-fns";

const BABY_ID = await getDefaultBabyId();
const BABY_BIRTHDAY = new Date("2025-11-23");

function getAge(birthday: Date, now: Date) {
  let months =
    (now.getFullYear() - birthday.getFullYear()) * 12 +
    (now.getMonth() - birthday.getMonth());
  let days = now.getDate() - birthday.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
  }
  return { months, days };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: process.env.TIMEZONE || "Europe/Paris",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: process.env.TIMEZONE || "Europe/Paris",
  });
}

const PAGE_SIZE = 15;

function relativeDay(eventTime: Date, todayStart: Date): string {
  const diff = Math.floor(
    (todayStart.getTime() - eventTime.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "";
  if (diff === 1) return "昨天 ";
  if (diff === 2) return "前天 ";
  return eventTime.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    timeZone: process.env.TIMEZONE || "Europe/Paris",
  }) + " ";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(String(pageStr ?? "1"), 10) || 1);

  const realNow = new Date();
  const now = nowParis();
  const todayStart = parisStartOfDay();
  const todayEnd = parisEndOfDay();

  const age = getAge(BABY_BIRTHDAY, now);

  const [feedingLogs, sleepLogs, tempLogs] = await Promise.all([
    prisma.feedingLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { time: "desc" },
    }),
    prisma.sleepLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { time: "asc" },
    }),
    prisma.tempLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { time: "desc" },
      take: 1,
    }),
  ]);

  // Detect overnight sleep carrying into today
  const lastSleepBeforeToday = await prisma.sleepLog.findFirst({
    where: {
      babyId: BABY_ID,
      time: { lt: todayStart },
    },
    orderBy: { time: "desc" },
  });
  const allSleepLogs =
    lastSleepBeforeToday?.event === "START"
      ? [lastSleepBeforeToday, ...sleepLogs]
      : sleepLogs;

  // Calculate today's milk total
  const totalMilk = feedingLogs
    .filter((f) => f.type === "MILK" && f.ml)
    .reduce((sum, f) => sum + (f.ml ?? 0), 0);

  const solidCount = feedingLogs.filter((f) => f.type === "SOLID").length;
  const supplementCount = feedingLogs.filter((f) => f.type === "SUPPLEMENT").length;

  // Calculate sleep hours from paired START/WAKE events
  let totalSleepMs = 0;
  let lastStart: Date | null = null;
  for (const log of allSleepLogs) {
    if (log.event === "START") {
      lastStart = log.time;
    } else if (log.event === "WAKE" && lastStart) {
      totalSleepMs += log.time.getTime() - lastStart.getTime();
      lastStart = null;
    }
  }
  if (lastStart) {
    totalSleepMs += realNow.getTime() - lastStart.getTime();
  }
  const sleepHours = (totalSleepMs / (1000 * 60 * 60)).toFixed(1);

  // Latest temp
  const latestTemp = tempLogs.length > 0 ? tempLogs[0].temp.toFixed(1) : null;

  // Activity timeline — query 7 days for pagination
  type TimelineEvent = {
    id: string;
    time: Date;
    type: "milk" | "solid" | "supplement" | "sleep" | "temp";
    label: string;
    detail: string;
  };

  const historyStart = parisStartOfDay(subDays(realNow, 6));
  const [allFeedings, allSleep, allTemps] = await Promise.all([
    prisma.feedingLog.findMany({
      where: { babyId: BABY_ID, time: { gte: historyStart } },
      orderBy: { time: "desc" },
    }),
    prisma.sleepLog.findMany({
      where: { babyId: BABY_ID, time: { gte: historyStart } },
      orderBy: { time: "desc" },
    }),
    prisma.tempLog.findMany({
      where: { babyId: BABY_ID, time: { gte: historyStart } },
      orderBy: { time: "desc" },
    }),
  ]);

  const timeline: TimelineEvent[] = [];

  for (const f of allFeedings) {
    if (f.type === "MILK") {
      timeline.push({
        id: f.id,
        time: f.time,
        type: "milk",
        label: "奶量",
        detail: `${f.ml ?? 0}ml`,
      });
    } else if (f.type === "SUPPLEMENT") {
      timeline.push({
        id: f.id,
        time: f.time,
        type: "supplement",
        label: "保健品",
        detail: `${f.food ?? ""}${f.amount ? ` ${f.amount}` : ""}`,
      });
    } else {
      timeline.push({
        id: f.id,
        time: f.time,
        type: "solid",
        label: "辅食",
        detail: `${f.food ?? ""}${f.amount ? ` ${f.amount}` : ""}`,
      });
    }
  }

  for (const s of allSleep) {
    timeline.push({
      id: s.id,
      time: s.time,
      type: "sleep",
      label: s.event === "START" ? "入睡" : s.event === "NIGHT_WAKE" ? "夜醒" : "醒来",
      detail: formatTime(s.time),
    });
  }

  for (const t of allTemps) {
    timeline.push({
      id: t.id,
      time: t.time,
      type: "temp",
      label: "体温",
      detail: `${t.temp.toFixed(1)}°C`,
    });
  }

  timeline.sort((a, b) => b.time.getTime() - a.time.getTime());
  const totalEvents = timeline.length;
  const totalPages = Math.max(1, Math.ceil(totalEvents / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTimeline = timeline.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const typeIcon: Record<TimelineEvent["type"], string> = {
    milk: "🍼",
    solid: "🥣",
    supplement: "💊",
    sleep: "😴",
    temp: "🌡️",
  };

  return (
    <div className="pb-8">
      <PageHeader
        title={"👶 Louna"}
        subtitle={`${age.months}个月${age.days}天`}
      />

      <div className="px-4">
        <p className="text-sm text-gray-500 mb-4">{formatDate(now)}</p>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            value={totalMilk}
            label={"🍼 今日奶量"}
            unit="ml"
          />
          <StatBox
            value={solidCount}
            label={"🥣 辅食"}
            unit="次"
          />
          <StatBox
            value={sleepHours}
            label={"😴 睡眠"}
            unit="小时"
          />
          <StatBox
            value={latestTemp ?? "—"}
            label={"🌡️ 体温"}
            unit={latestTemp ? "°C" : undefined}
          />
        </div>

        {/* Recent activity */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {safePage === 1 ? "最近动态" : `动态 · 第${safePage}页`}
            </h2>
            {totalPages > 1 && safePage === 1 && (
              <Link
                href="/?page=2"
                className="text-xs text-[var(--primary)] font-medium"
              >
                更多动态 →
              </Link>
            )}
          </div>
          {paginatedTimeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              还没有记录
            </p>
          ) : (
            <div className="space-y-3">
              {paginatedTimeline.map((event) => {
                const prefix = relativeDay(event.time, todayStart);
                return (
                  <div key={event.id} className="flex items-center gap-3">
                    <span className="text-lg">{typeIcon[event.type]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">
                        {event.label}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {event.detail}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {prefix}{formatTime(event.time)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              {safePage > 1 ? (
                <Link
                  href={safePage === 2 ? "/" : `/?page=${safePage - 1}`}
                  className="text-xs text-[var(--primary)] font-medium"
                >
                  ← 更近
                </Link>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">
                {safePage} / {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link
                  href={`/?page=${safePage + 1}`}
                  className="text-xs text-[var(--primary)] font-medium"
                >
                  更早 →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </Card>

        {/* Quick action buttons */}
        <div className="flex gap-3">
          <Link
            href="/feeding"
            className="flex-1 bg-[var(--primary)] text-white text-sm font-medium py-3 rounded-xl text-center active:bg-[var(--primary-dark)] transition-colors"
          >
            + 记录奶量
          </Link>
          <Link
            href="/feeding"
            className="flex-1 bg-[var(--primary)] text-white text-sm font-medium py-3 rounded-xl text-center active:bg-[var(--primary-dark)] transition-colors"
          >
            + 记录辅食
          </Link>
          <Link
            href="/sleep"
            className="flex-1 bg-[var(--primary)] text-white text-sm font-medium py-3 rounded-xl text-center active:bg-[var(--primary-dark)] transition-colors"
          >
            + 记录睡眠
          </Link>
        </div>
      </div>
    </div>
  );
}
