import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { StatBox } from "@/components/ui/stat-box";
import { SleepTimeline } from "./sleep-timeline";
import { SleepChart } from "./sleep-chart";
import { SleepActions } from "./sleep-actions";
import {
  parisStartOfDay,
  parisNextMidnight,
  formatInParis,
  toParis,
} from "@/lib/timezone";
import { subDays } from "date-fns";

const BABY_ID = await getDefaultBabyId();

type SleepPeriod = {
  startHour: number;
  endHour: number;
  type: "sleep" | "wake";
};

type DaySleep = {
  date: string;
  hours: number;
};

function pushPeriod(periods: SleepPeriod[], startH: number, endH: number) {
  if (endH < startH) {
    periods.push({ startHour: startH, endHour: 24, type: "sleep" });
    if (endH > 0) {
      periods.push({ startHour: 0, endHour: endH, type: "sleep" });
    }
  } else {
    periods.push({ startHour: startH, endHour: endH, type: "sleep" });
  }
}

export default async function SleepPage() {
  await connection();
  const realNow = new Date();
  const todayStart = parisStartOfDay();

  const todayLogs = await prisma.sleepLog.findMany({
    where: {
      babyId: BABY_ID,
      time: { gte: todayStart },
    },
    orderBy: { time: "asc" },
  });

  // Detect overnight sleep: last event before today is START with no WAKE
  const lastBeforeToday = await prisma.sleepLog.findFirst({
    where: {
      babyId: BABY_ID,
      time: { lt: todayStart },
    },
    orderBy: { time: "desc" },
  });

  const overnightStart =
    lastBeforeToday?.event === "START" ? lastBeforeToday : null;
  const allLogs = overnightStart ? [overnightStart, ...todayLogs] : todayLogs;

  // Determine current sleep state
  const lastEvent = allLogs.length > 0 ? allLogs[allLogs.length - 1] : null;
  const lastGlobal = await prisma.sleepLog.findFirst({
    where: { babyId: BABY_ID },
    orderBy: { time: "desc" },
  });
  const isSleeping = (lastGlobal ?? lastEvent)?.event === "START";

  let totalSleepMinutes = 0;
  let napCount = 0;
  let nightWakeCount = 0;
  const periods: SleepPeriod[] = [];
  let sleepStart: Date | null = null;

  for (const log of allLogs) {
    if (log.event === "START") {
      sleepStart = log.time;
    } else if (log.event === "WAKE" && sleepStart) {
      const durationMin =
        (log.time.getTime() - sleepStart.getTime()) / (1000 * 60);
      if (durationMin < 0) {
        sleepStart = null;
        continue;
      }

      totalSleepMinutes += durationMin;
      napCount++;

      const zStart = toParis(sleepStart);
      const zEnd = toParis(log.time);
      pushPeriod(
        periods,
        zStart.getHours() + zStart.getMinutes() / 60,
        zEnd.getHours() + zEnd.getMinutes() / 60
      );
      sleepStart = null;
    } else if (log.event === "NIGHT_WAKE") {
      nightWakeCount++;
    }
  }

  // If currently sleeping, count up to now
  if (sleepStart) {
    const durationMin =
      (realNow.getTime() - sleepStart.getTime()) / (1000 * 60);
    if (durationMin > 0) {
      totalSleepMinutes += durationMin;
      const zStart = toParis(sleepStart);
      const zNow = toParis(realNow);
      pushPeriod(
        periods,
        zStart.getHours() + zStart.getMinutes() / 60,
        zNow.getHours() + zNow.getMinutes() / 60
      );
    }
  }

  const totalHours = totalSleepMinutes / 60;

  // 7-day chart
  const sevenDaysAgo = parisStartOfDay(subDays(realNow, 6));
  const weekLogs = await prisma.sleepLog.findMany({
    where: {
      babyId: BABY_ID,
      time: { gte: sevenDaysAgo },
    },
    orderBy: { time: "asc" },
  });

  // Also check for overnight sleep carrying into the 7-day window
  const lastBeforeWeek = await prisma.sleepLog.findFirst({
    where: {
      babyId: BABY_ID,
      time: { lt: sevenDaysAgo },
    },
    orderBy: { time: "desc" },
  });
  const allWeekLogs =
    lastBeforeWeek?.event === "START"
      ? [lastBeforeWeek, ...weekLogs]
      : weekLogs;

  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const dayRef = subDays(realNow, i);
    dailyMap.set(formatInParis(dayRef, "MM/dd"), 0);
  }

  let weekSleepStart: Date | null = null;
  for (const log of allWeekLogs) {
    if (log.event === "START") {
      weekSleepStart = log.time;
    } else if (log.event === "WAKE" && weekSleepStart) {
      // Split sleep across Paris-day boundaries
      let segStart = weekSleepStart;
      const segEnd = log.time;

      while (segStart < segEnd) {
        const dateKey = formatInParis(segStart, "MM/dd");
        const nextMidnight = parisNextMidnight(segStart);
        const segmentEnd = segEnd < nextMidnight ? segEnd : nextMidnight;
        const durationHours =
          (segmentEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);

        if (durationHours > 0 && dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + durationHours);
        }
        segStart = segmentEnd;
      }
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
      <PageHeader
        title="😴 睡眠记录"
        subtitle={`今日睡眠 ${totalHours.toFixed(1)} 小时`}
      />

      <div className="grid grid-cols-3 gap-3 px-4 mt-2">
        <StatBox value={totalHours.toFixed(1)} unit="h" label="总睡眠" />
        <StatBox value={napCount} label="小睡次数" />
        <StatBox value={nightWakeCount} label="夜醒次数" />
      </div>

      <SleepActions isSleeping={isSleeping} />

      <SleepTimeline periods={periods} />

      <SleepChart data={chartData} />
    </div>
  );
}
