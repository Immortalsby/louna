import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { StatBox } from "@/components/ui/stat-box";
import { GrowthChart } from "./growth-chart";
import { AddGrowth } from "./add-growth";
import { getPercentileCurves } from "@/lib/who-data";
import { differenceInMonths, differenceInDays } from "date-fns";

const BABY_ID = process.env.BABY_ID!;

export default async function GrowthPage() {
  await connection();
  const baby = await prisma.baby.findUniqueOrThrow({
    where: { id: BABY_ID },
  });

  const gender = baby.gender === "boy" ? "boy" : "girl";

  // Fetch all growth logs
  const growthLogs = await prisma.growthLog.findMany({
    where: { babyId: BABY_ID },
    orderBy: { date: "asc" },
  });

  // Latest measurement
  const latest = growthLogs.length > 0 ? growthLogs[growthLogs.length - 1] : null;

  // Convert growth logs to chart data points (month, value)
  const weightData = growthLogs
    .filter((log) => log.weightKg !== null)
    .map((log) => ({
      month:
        Math.round(
          (differenceInDays(log.date, baby.birthday) / 30.4375) * 10
        ) / 10,
      value: log.weightKg!,
    }));

  const heightData = growthLogs
    .filter((log) => log.heightCm !== null)
    .map((log) => ({
      month:
        Math.round(
          (differenceInDays(log.date, baby.birthday) / 30.4375) * 10
        ) / 10,
      value: log.heightCm!,
    }));

  const headData = growthLogs
    .filter((log) => log.headCm !== null)
    .map((log) => ({
      month:
        Math.round(
          (differenceInDays(log.date, baby.birthday) / 30.4375) * 10
        ) / 10,
      value: log.headCm!,
    }));

  // Get WHO percentile curves
  const weightCurves = getPercentileCurves("weight", gender as "girl" | "boy");
  const heightCurves = getPercentileCurves("length", gender as "girl" | "boy");
  const headCurves = getPercentileCurves("head", gender as "girl" | "boy");

  return (
    <div className="pb-6">
      <PageHeader title="📈 成长曲线" subtitle={`${baby.name}的生长发育`}>
        <AddGrowth />
      </PageHeader>

      {/* Latest measurements */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-2">
        <StatBox
          value={latest?.weightKg?.toFixed(2) ?? "--"}
          unit="kg"
          label="体重"
        />
        <StatBox
          value={latest?.heightCm?.toFixed(1) ?? "--"}
          unit="cm"
          label="身高"
        />
        <StatBox
          value={latest?.headCm?.toFixed(1) ?? "--"}
          unit="cm"
          label="头围"
        />
      </div>

      {/* Weight chart */}
      <GrowthChart
        title="体重 (Weight for age)"
        unit="kg"
        percentiles={weightCurves}
        babyData={weightData}
      />

      {/* Height chart */}
      <GrowthChart
        title="身高 (Length for age)"
        unit="cm"
        percentiles={heightCurves}
        babyData={heightData}
      />

      {/* Head circumference chart */}
      <GrowthChart
        title="头围 (Head circumference for age)"
        unit="cm"
        percentiles={headCurves}
        babyData={headData}
      />
    </div>
  );
}
