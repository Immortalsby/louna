import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { data: true },
  });

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const matches = photo.data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return new Response(Buffer.from(photo.data, "base64"), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  return new Response(Buffer.from(base64Data, "base64"), {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
