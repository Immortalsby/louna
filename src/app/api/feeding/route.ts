import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const days = searchParams.get("days");
    const babyId = searchParams.get("babyId");

    const where: Record<string, unknown> = {};

    if (babyId) {
      where.babyId = babyId;
    }

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

    const logs = await prisma.feedingLog.findMany({
      where,
      orderBy: { time: "desc" },
    });

    return Response.json(logs);
  } catch (error) {
    console.error("Failed to list feeding logs:", error);
    return Response.json(
      { error: "Failed to list feeding logs" },
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
    const { type, ml, food, amount, time, createdBy } = body;

    if (!type || !["MILK", "SOLID"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Must be MILK or SOLID." },
        { status: 400 }
      );
    }

    // Default babyId to first baby in DB
    let babyId = body.babyId;
    if (!babyId) {
      const firstBaby = await prisma.baby.findFirst();
      if (!firstBaby) {
        return Response.json(
          { error: "No baby found. Please seed the database first." },
          { status: 400 }
        );
      }
      babyId = firstBaby.id;
    }

    const log = await prisma.feedingLog.create({
      data: {
        babyId,
        type,
        ml: ml ?? null,
        food: food ?? null,
        amount: amount ?? null,
        time: time ? new Date(time) : new Date(),
        createdBy: createdBy ?? "api",
      },
    });

    return Response.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create feeding log:", error);
    return Response.json(
      { error: "Failed to create feeding log" },
      { status: 500 }
    );
  }
}
