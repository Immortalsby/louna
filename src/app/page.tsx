import Link from "next/link";
import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatBox } from "@/components/ui/stat-box";
import { PageHeader } from "@/components/ui/page-header";

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
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default async function HomePage() {
  await connection();
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const age = getAge(BABY_BIRTHDAY, now);

  const [feedingLogs, sleepLogs, tempLogs] = await Promise.all([
    prisma.feedingLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lt: todayEnd },
      },
      orderBy: { time: "desc" },
    }),
    prisma.sleepLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lt: todayEnd },
      },
      orderBy: { time: "asc" },
    }),
    prisma.tempLog.findMany({
      where: {
        babyId: BABY_ID,
        time: { gte: todayStart, lt: todayEnd },
      },
      orderBy: { time: "desc" },
      take: 1,
    }),
  ]);

  // Calculate today's milk total
  const totalMilk = feedingLogs
    .filter((f) => f.type === "MILK" && f.ml)
    .reduce((sum, f) => sum + (f.ml ?? 0), 0);

  // Count solid feeds
  const solidCount = feedingLogs.filter((f) => f.type === "SOLID").length;

  // Calculate sleep hours from paired START/WAKE events
  let totalSleepMs = 0;
  let lastStart: Date | null = null;
  for (const log of sleepLogs) {
    if (log.event === "START") {
      lastStart = log.time;
    } else if (log.event === "WAKE" && lastStart) {
      totalSleepMs += log.time.getTime() - lastStart.getTime();
      lastStart = null;
    }
  }
  // If still sleeping, count up to now
  if (lastStart) {
    totalSleepMs += now.getTime() - lastStart.getTime();
  }
  const sleepHours = (totalSleepMs / (1000 * 60 * 60)).toFixed(1);

  // Latest temp
  const latestTemp = tempLogs.length > 0 ? tempLogs[0].temp.toFixed(1) : null;

  // Recent activity timeline (last 10 events across all types)
  type TimelineEvent = {
    id: string;
    time: Date;
    type: "milk" | "solid" | "sleep" | "temp";
    label: string;
    detail: string;
  };

  const timeline: TimelineEvent[] = [];

  for (const f of feedingLogs) {
    if (f.type === "MILK") {
      timeline.push({
        id: f.id,
        time: f.time,
        type: "milk",
        label: "奶量",
        detail: `${f.ml ?? 0}ml`,
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

  for (const s of sleepLogs) {
    timeline.push({
      id: s.id,
      time: s.time,
      type: "sleep",
      label: s.event === "START" ? "入睡" : "醒来",
      detail: formatTime(s.time),
    });
  }

  for (const t of tempLogs) {
    timeline.push({
      id: t.id,
      time: t.time,
      type: "temp",
      label: "体温",
      detail: `${t.temp.toFixed(1)}°C`,
    });
  }

  timeline.sort((a, b) => b.time.getTime() - a.time.getTime());
  const recentTimeline = timeline.slice(0, 10);

  const typeIcon: Record<TimelineEvent["type"], string> = {
    milk: "🍼",
    solid: "🥣",
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
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            最近动态
          </h2>
          {recentTimeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              今天还没有记录
            </p>
          ) : (
            <div className="space-y-3">
              {recentTimeline.map((event) => (
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
                    {formatTime(event.time)}
                  </span>
                </div>
              ))}
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
