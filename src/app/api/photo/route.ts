import { NextResponse } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const babyId = await getDefaultBabyId();

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where: { babyId },
      orderBy: { takenAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        caption: true,
        takenAt: true,
        createdBy: true,
        createdAt: true,
      },
    }),
    prisma.photo.count({ where: { babyId } }),
  ]);

  return NextResponse.json({ photos, total, limit, offset });
}

export async function POST(request: Request) {
  if (!validateApiToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { data, caption, takenAt, createdBy } = body;

  if (!data || typeof data !== "string") {
    return NextResponse.json(
      { error: "Photo data (base64) is required" },
      { status: 400 }
    );
  }

  const babyId = await getDefaultBabyId();

  const photo = await prisma.photo.create({
    data: {
      babyId,
      data,
      caption: caption || null,
      takenAt: takenAt ? new Date(takenAt) : new Date(),
      createdBy: createdBy || "hermes",
    },
    select: {
      id: true,
      caption: true,
      takenAt: true,
      createdBy: true,
      createdAt: true,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
