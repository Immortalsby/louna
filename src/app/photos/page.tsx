import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoGallery } from "./photo-gallery";
import { differenceInDays } from "date-fns";

const PHOTOS_BASE_URL = "https://louna-photos.bytech-solutions.cc";

export default async function PhotosPage() {
  await connection();
  const babyId = await getDefaultBabyId();
  const baby = await prisma.baby.findUniqueOrThrow({ where: { id: babyId } });

  const photos = await prisma.photo.findMany({
    where: { babyId },
    orderBy: { takenAt: "desc" },
  });

  const mediaItems = photos.map((p) => ({
    id: p.id,
    url: `${PHOTOS_BASE_URL}/${p.filename}`,
    videoUrl: p.videoFilename ? `${PHOTOS_BASE_URL}/${p.videoFilename}` : null,
    mediaType: p.mediaType as "PHOTO" | "VIDEO" | "LIVE_PHOTO",
    caption: p.caption,
    takenAt: p.takenAt,
    createdBy: p.createdBy,
  }));

  const mediaByMonth: Record<string, typeof mediaItems> = {};
  for (const item of mediaItems) {
    const date = new Date(item.takenAt);
    const ageMonths = Math.floor(
      differenceInDays(date, baby.birthday) / 30.4375
    );
    const key = `${ageMonths}个月`;
    if (!mediaByMonth[key]) mediaByMonth[key] = [];
    mediaByMonth[key].push(item);
  }

  const months = Object.entries(mediaByMonth).sort((a, b) => {
    const aMonth = parseInt(a[0]);
    const bMonth = parseInt(b[0]);
    return bMonth - aMonth;
  });

  const videoCount = mediaItems.filter((m) => m.mediaType === "VIDEO").length;
  const photoCount = mediaItems.length - videoCount;

  return (
    <div className="pb-6">
      <PageHeader
        title="📸 成长相册"
        subtitle={`${photoCount} 张照片${videoCount > 0 ? ` · ${videoCount} 个视频` : ""}`}
      />

      {mediaItems.length === 0 ? (
        <div className="px-4 mt-8 text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-400 text-sm">还没有照片哦～</p>
          <p className="text-gray-400 text-sm mt-1">
            在 iMessage 群里发宝宝照片或视频，会自动收录到这里
          </p>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-6">
          {months.map(([monthLabel, monthMedia]) => (
            <div key={monthLabel}>
              <h2 className="text-sm font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">
                  {parseInt(monthLabel)}
                </span>
                {monthLabel}
              </h2>
              <PhotoGallery photos={monthMedia} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
