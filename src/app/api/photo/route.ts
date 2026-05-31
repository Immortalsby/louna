import { NextResponse } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

const PHOTOS_BASE_URL = "https://louna-photos.bytech-solutions.cc";

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
    }),
    prisma.photo.count({ where: { babyId } }),
  ]);

  const photosWithUrl = photos.map((p) => ({
    ...p,
    url: `${PHOTOS_BASE_URL}/${p.filename}`,
    videoUrl: p.videoFilename
      ? `${PHOTOS_BASE_URL}/${p.videoFilename}`
      : null,
  }));

  return NextResponse.json({ photos: photosWithUrl, total, limit, offset });
}

export async function POST(request: Request) {
  if (!validateApiToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { filename, videoFilename, mediaType, caption, takenAt, createdBy } =
    body;

  if (!filename || typeof filename !== "string") {
    return NextResponse.json(
      { error: "filename is required" },
      { status: 400 }
    );
  }

  const babyId = await getDefaultBabyId();

  const photo = await prisma.photo.create({
    data: {
      babyId,
      filename,
      videoFilename: videoFilename || null,
      mediaType: mediaType || "PHOTO",
      caption: caption || null,
      takenAt: takenAt ? new Date(takenAt) : new Date(),
      createdBy: createdBy || "hermes",
    },
  });

  return NextResponse.json(
    {
      ...photo,
      url: `${PHOTOS_BASE_URL}/${photo.filename}`,
      videoUrl: photo.videoFilename
        ? `${PHOTOS_BASE_URL}/${photo.videoFilename}`
        : null,
    },
    { status: 201 }
  );
}
