import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (status && ["NOT_TRIED", "OBSERVING", "SAFE", "REACTED"].includes(status)) {
      where.status = status;
    }

    const records = await prisma.foodSafety.findMany({
      where,
      orderBy: { introduced: "desc" },
    });

    return Response.json(records);
  } catch (error) {
    console.error("Failed to list food safety records:", error);
    return Response.json(
      { error: "Failed to list food safety records" },
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
    const { food, status } = body;

    if (!food || typeof food !== "string") {
      return Response.json(
        { error: "food (string) is required." },
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

    // Check if this food already exists for this baby
    const existing = await prisma.foodSafety.findFirst({
      where: { babyId: firstBaby.id, food },
    });

    if (existing) {
      const newStatus = status ?? existing.status;
      const updateData: Record<string, unknown> = { status: newStatus };

      // NOT_TRIED → OBSERVING: set real introduced date and observation window
      if (existing.status === "NOT_TRIED" && newStatus === "OBSERVING") {
        const now = new Date();
        const obsEnd = new Date(now);
        obsEnd.setDate(obsEnd.getDate() + 3);
        updateData.introduced = now;
        updateData.observationEnd = obsEnd;
      }

      const updated = await prisma.foodSafety.update({
        where: { id: existing.id },
        data: updateData,
      });
      return Response.json(updated);
    }

    // Create new food safety record
    const now = new Date();
    const effectiveStatus = status ?? "OBSERVING";

    const observationEnd = new Date(now);
    if (effectiveStatus !== "NOT_TRIED") {
      observationEnd.setDate(observationEnd.getDate() + 3);
    }

    const record = await prisma.foodSafety.create({
      data: {
        babyId: firstBaby.id,
        food,
        introduced: now,
        observationEnd,
        status: effectiveStatus,
      },
    });

    return Response.json(record, { status: 201 });
  } catch (error) {
    console.error("Failed to create/update food safety record:", error);
    return Response.json(
      { error: "Failed to create/update food safety record" },
      { status: 500 }
    );
  }
}
