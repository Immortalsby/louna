import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const days = searchParams.get("days");

    const where: Record<string, unknown> = {};

    if (date) {
      const start = new Date(date + "T00:00:00.000Z");
      const end = new Date(date + "T23:59:59.999Z");
      where.time = { gte: start, lte: end };
    } else if (days) {
      const d = parseInt(days, 10);
      const start = new Date();
      start.setDate(start.getDate() - d);
      start.setHours(0, 0, 0, 0);
      where.time = { gte: start };
    }

    const logs = await prisma.tempLog.findMany({
      where,
      orderBy: { time: "desc" },
    });

    return Response.json(logs);
  } catch (error) {
    console.error("Failed to list temp logs:", error);
    return Response.json(
      { error: "Failed to list temp logs" },
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
    const { temp, time } = body;

    if (temp == null || typeof temp !== "number") {
      return Response.json(
        { error: "temp (number) is required." },
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

    const log = await prisma.tempLog.create({
      data: {
        babyId: firstBaby.id,
        temp,
        time: time ? new Date(time) : new Date(),
      },
    });

    return Response.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create temp log:", error);
    return Response.json(
      { error: "Failed to create temp log" },
      { status: 500 }
    );
  }
}
