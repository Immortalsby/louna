import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";
import { fromZonedTime } from "date-fns-tz";
import { TZ, parisStartOfDay } from "@/lib/timezone";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const days = searchParams.get("days");

    const where: Record<string, unknown> = {};

    if (date) {
      const start = fromZonedTime(`${date}T00:00:00`, TZ);
      const end = fromZonedTime(`${date}T23:59:59.999`, TZ);
      where.time = { gte: start, lte: end };
    } else if (days) {
      const d = parseInt(days, 10);
      const start = parisStartOfDay(subDays(new Date(), d));
      where.time = { gte: start };
    }

    const logs = await prisma.sleepLog.findMany({
      where,
      orderBy: { time: "desc" },
    });

    return Response.json(logs);
  } catch (error) {
    console.error("Failed to list sleep logs:", error);
    return Response.json(
      { error: "Failed to list sleep logs" },
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
    const { event, time } = body;

    if (!event || !["START", "WAKE", "NIGHT_WAKE"].includes(event)) {
      return Response.json(
        { error: "Invalid event. Must be START, WAKE, or NIGHT_WAKE." },
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

    const log = await prisma.sleepLog.create({
      data: {
        babyId: firstBaby.id,
        event,
        time: time ? new Date(time) : new Date(),
      },
    });

    return Response.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create sleep log:", error);
    return Response.json(
      { error: "Failed to create sleep log" },
      { status: 500 }
    );
  }
}
