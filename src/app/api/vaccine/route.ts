import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET() {
  try {
    const vaccines = await prisma.vaccineLog.findMany({
      orderBy: { scheduledDate: "asc" },
    });

    return Response.json(vaccines);
  } catch (error) {
    console.error("Failed to list vaccines:", error);
    return Response.json(
      { error: "Failed to list vaccines" },
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
    const { id, doneDate, batchNo } = body;

    if (!id || !doneDate) {
      return Response.json(
        { error: "id and doneDate are required." },
        { status: 400 }
      );
    }

    const vaccine = await prisma.vaccineLog.update({
      where: { id },
      data: {
        doneDate: new Date(doneDate),
        batchNo: batchNo ?? undefined,
      },
    });

    return Response.json(vaccine);
  } catch (error) {
    console.error("Failed to update vaccine:", error);
    return Response.json(
      { error: "Failed to update vaccine" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!validateApiToken(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, doneDate, batchNo } = body;

    if (!id || !doneDate) {
      return Response.json(
        { error: "id and doneDate are required." },
        { status: 400 }
      );
    }

    const vaccine = await prisma.vaccineLog.update({
      where: { id },
      data: {
        doneDate: new Date(doneDate),
        batchNo: batchNo ?? undefined,
      },
    });

    return Response.json(vaccine);
  } catch (error) {
    console.error("Failed to update vaccine:", error);
    return Response.json(
      { error: "Failed to update vaccine" },
      { status: 500 }
    );
  }
}
