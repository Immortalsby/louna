import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { date: "desc" },
    });

    return Response.json(milestones);
  } catch (error) {
    console.error("Failed to list milestones:", error);
    return Response.json(
      { error: "Failed to list milestones" },
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
    const { description, date, photoUrl } = body;

    if (!description || typeof description !== "string") {
      return Response.json(
        { error: "description (string) is required." },
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

    const milestone = await prisma.milestone.create({
      data: {
        babyId: firstBaby.id,
        description,
        date: date ? new Date(date) : new Date(),
        photoUrl: photoUrl ?? null,
      },
    });

    return Response.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return Response.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
