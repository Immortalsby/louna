import { NextResponse } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET() {
  const babyId = await getDefaultBabyId();

  const milestones = await prisma.milestone.findMany({
    where: { babyId },
    orderBy: { date: "desc" },
  });

  const capsules: Record<string, {
    month: number;
    milestones: string[];
    photoCount: number;
    feedingCount: number;
    letter?: string;
  }> = {};

  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) return NextResponse.json([]);

  const allPhotos = await prisma.photo.findMany({ where: { babyId } });
  const allFeedings = await prisma.feedingLog.findMany({ where: { babyId } });

  for (let m = 0; m <= 24; m++) {
    const monthStart = new Date(baby.birthday);
    monthStart.setMonth(monthStart.getMonth() + m);
    const monthEnd = new Date(baby.birthday);
    monthEnd.setMonth(monthEnd.getMonth() + m + 1);

    if (monthStart > new Date()) break;

    const monthMilestones = milestones
      .filter((ms) => ms.date >= monthStart && ms.date < monthEnd)
      .map((ms) => ms.description);

    const monthPhotos = allPhotos.filter(
      (p) => p.takenAt >= monthStart && p.takenAt < monthEnd
    ).length;

    const monthFeedings = allFeedings.filter(
      (f) => f.time >= monthStart && f.time < monthEnd
    ).length;

    if (monthMilestones.length > 0 || monthPhotos > 0 || monthFeedings > 0) {
      capsules[`${m}个月`] = {
        month: m,
        milestones: monthMilestones,
        photoCount: monthPhotos,
        feedingCount: monthFeedings,
      };
    }
  }

  return NextResponse.json(capsules);
}

export async function POST(request: Request) {
  if (!validateApiToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, letter } = body;

  if (typeof month !== "number" || !letter) {
    return NextResponse.json(
      { error: "month (number) and letter (string) required" },
      { status: 400 }
    );
  }

  const babyId = await getDefaultBabyId();
  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) {
    return NextResponse.json({ error: "No baby" }, { status: 404 });
  }

  const monthDate = new Date(baby.birthday);
  monthDate.setMonth(monthDate.getMonth() + month);

  const milestone = await prisma.milestone.create({
    data: {
      babyId,
      description: `💌 时间胶囊 · ${month}个月: ${letter.slice(0, 100)}`,
      date: monthDate,
    },
  });

  return NextResponse.json(milestone, { status: 201 });
}
