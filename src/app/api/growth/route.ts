import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET() {
  try {
    const logs = await prisma.growthLog.findMany({
      orderBy: { date: "desc" },
    });

    return Response.json(logs);
  } catch (error) {
    console.error("Failed to list growth logs:", error);
    return Response.json(
      { error: "Failed to list growth logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiToken(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { weightKg, heightCm, headCm, date } = body;

    if (weightKg == null && heightCm == null && headCm == null) {
      return Response.json(
        { error: "At least one measurement (weightKg, heightCm, headCm) is required." },
        { status: 400 }
      );
    }

    const firstBaby = await prisma.baby.findFirst();
    if (!firstBaby) {
      return Response.json(
        { error: "No baby found. Please seed the database first." },
        { status: 400 }
      );
    }

    const log = await prisma.growthLog.create({
      data: {
        babyId: firstBaby.id,
        date: date ? new Date(date) : new Date(),
        weightKg: weightKg ?? null,
        heightCm: heightCm ?? null,
        headCm: headCm ?? null,
      },
    });

    return Response.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create growth log:", error);
    return Response.json(
      { error: "Failed to create growth log" },
      { status: 500 }
    );
  }
}
