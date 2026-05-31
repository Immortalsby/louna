import { NextResponse } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function POST(request: Request) {
  if (!validateApiToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const babyId = await getDefaultBabyId();

  const deleted = await prisma.$transaction([
    prisma.feedingLog.deleteMany({ where: { babyId } }),
    prisma.sleepLog.deleteMany({ where: { babyId } }),
    prisma.growthLog.deleteMany({ where: { babyId } }),
    prisma.tempLog.deleteMany({ where: { babyId } }),
    prisma.foodSafety.deleteMany({ where: { babyId } }),
    prisma.milestone.deleteMany({ where: { babyId } }),
    prisma.photo.deleteMany({ where: { babyId } }),
  ]);

  const labels = ["feeding", "sleep", "growth", "temp", "food", "milestone", "photo"];
  const summary: Record<string, number> = {};
  deleted.forEach((r, i) => { summary[labels[i]] = r.count; });

  return NextResponse.json({
    message: "All records deleted. Baby and vaccines kept.",
    deleted: summary,
  });
}
