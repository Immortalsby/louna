import { NextResponse } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET(request: Request) {
  if (!validateApiToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const babyId = await getDefaultBabyId();

  const [baby, feeding, sleep, growth, milestones, food, temp, vaccines, photos] =
    await Promise.all([
      prisma.baby.findUnique({ where: { id: babyId } }),
      prisma.feedingLog.findMany({ where: { babyId }, orderBy: { time: "asc" } }),
      prisma.sleepLog.findMany({ where: { babyId }, orderBy: { time: "asc" } }),
      prisma.growthLog.findMany({ where: { babyId }, orderBy: { date: "asc" } }),
      prisma.milestone.findMany({ where: { babyId }, orderBy: { date: "asc" } }),
      prisma.foodSafety.findMany({ where: { babyId }, orderBy: { introduced: "asc" } }),
      prisma.tempLog.findMany({ where: { babyId }, orderBy: { time: "asc" } }),
      prisma.vaccineLog.findMany({ where: { babyId }, orderBy: { scheduledDate: "asc" } }),
      prisma.photo.findMany({ where: { babyId }, orderBy: { takenAt: "asc" } }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    baby,
    stats: {
      feedingCount: feeding.length,
      sleepCount: sleep.length,
      growthCount: growth.length,
      milestoneCount: milestones.length,
      foodCount: food.length,
      tempCount: temp.length,
      vaccineCount: vaccines.length,
      photoCount: photos.length,
    },
    feeding,
    sleep,
    growth,
    milestones,
    food,
    temp,
    vaccines,
    photos: photos.map((p) => ({
      ...p,
      url: `https://louna-photos.bytech-solutions.cc/${p.filename}`,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="louna-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
