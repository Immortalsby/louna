import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { StatBox } from "@/components/ui/stat-box";
import { SleepTimeline } from "./sleep-timeline";
import { SleepChart } from "./sleep-chart";
import { SleepActions } from "./sleep-actions";
import { format, startOfDay, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const BABY_ID = await getDefaultBabyId();
const TZ = "Europe/Paris";

type SleepPeriod = {
  startHour: number;
  endHour: number;
  type: "sleep" | "wake";
};

type DaySleep = {
  date: string;
  hours: number;
};

export default async function SleepPage() {
  await connection();
  const now = toZonedTime(new Date(), TZ);
  const todayStart = startOfDay(now);

  // Fetch today's sleep logs
  const todayLogs = await prisma.sleepLog.findMany({
    where: {
      babyId: BABY_ID,
      time: { gte: todayStart },
    },
    orderBy: { time: "asc" },
  });

  // Calculate today's summary
  let totalSleepMinutes = 0;
  let napCount = 0;
  let nightWakeCount = 0;

  // Build timeline periods
  const periods: SleepPeriod[] = [];
  let sleepStart: Date | null = null;

  for (const log of todayLogs) {
    if (log.event === "START") {
      sleepStart = log.time;
    } else if (log.event === "WAKE" && sleepStart) {
      const zStart = toZonedTime(sleepStart, TZ);
      const zEnd = toZonedTime(log.time, TZ);
      const startHour = zStart.getHours() + zStart.getMinutes() / 60;
      const endHour = zEnd.getHours() + zEnd.getMinutes() / 60;
      const durationMin =
        (log.time.getTime() - sleepStart.getTime()) / (1000 * 60);

      totalSleepMinutes += durationMin;
      napCount++;
      periods.push({ startHour, endHour, type: "sleep" });
      sleepStart = null;
    } else if (log.event === "NIGHT_WAKE") {
      nightWakeCount++;
    }
  }

  // If currently sleeping, count up to now
  if (sleepStart) {
    const durationMin =
      (now.getTime() - sleepStart.getTime()) / (1000 * 60);
    if (durationMin > 0) {
      const zStart = toZonedTime(sleepStart, TZ);
      const zNow = toZonedTime(now, TZ);
      const startHour = zStart.getHours() + zStart.getMinutes() / 60;
      const endHour = zNow.getHours() + zNow.getMinutes() / 60;
      totalSleepMinutes += durationMin;
      periods.push({ startHour, endHour, type: "sleep" });
    }
  }

  const totalHours = totalSleepMinutes / 60;

  // Fetch 7-day history
  const sevenDaysAgo = startOfDay(subDays(now, 6));
  const weekLogs = await prisma.sleepLog.findMany({
    where: {
      babyId: BABY_ID,
      time: { gte: sevenDaysAgo },
    },
    orderBy: { time: "asc" },
  });

  // Calculate daily totals
  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    dailyMap.set(format(d, "MM/dd"), 0);
  }

  let weekSleepStart: Date | null = null;
  for (const log of weekLogs) {
    if (log.event === "START") {
      weekSleepStart = log.time;
    } else if (log.event === "WAKE" && weekSleepStart) {
      const dateKey = format(log.time, "MM/dd");
      const durationHours =
        (log.time.getTime() - weekSleepStart.getTime()) / (1000 * 60 * 60);
      const current = dailyMap.get(dateKey) ?? 0;
      dailyMap.set(dateKey, current + durationHours);
      weekSleepStart = null;
    }
  }

  const chartData: DaySleep[] = Array.from(dailyMap.entries()).map(
    ([date, hours]) => ({
      date,
      hours: Math.round(hours * 10) / 10,
    })
  );

  return (
    <div className="pb-6">
      <PageHeader title="😴 睡眠记录" subtitle="今日睡眠概况" />

      {/* Today's summary */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-2">
        <StatBox
          value={totalHours.toFixed(1)}
          unit="h"
          label="总睡眠"
        />
        <StatBox value={napCount} label="小睡次数" />
        <StatBox value={nightWakeCount} label="夜醒次数" />
      </div>

      {/* Quick action buttons */}
      <SleepActions />

      {/* Timeline */}
      <SleepTimeline periods={periods} />

      {/* 7-day chart */}
      <SleepChart data={chartData} />
    </div>
  );
}
