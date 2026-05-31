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

  const photosWithUrl = photos.map((p) => ({
    id: p.id,
    url: `${PHOTOS_BASE_URL}/${p.filename}`,
    caption: p.caption,
    takenAt: p.takenAt,
    createdBy: p.createdBy,
  }));

  const photosByMonth: Record<string, typeof photosWithUrl> = {};
  for (const photo of photosWithUrl) {
    const date = new Date(photo.takenAt);
    const ageMonths = Math.floor(
      differenceInDays(date, baby.birthday) / 30.4375
    );
    const key = `${ageMonths}个月`;
    if (!photosByMonth[key]) photosByMonth[key] = [];
    photosByMonth[key].push(photo);
  }

  const months = Object.entries(photosByMonth).sort((a, b) => {
    const aMonth = parseInt(a[0]);
    const bMonth = parseInt(b[0]);
    return bMonth - aMonth;
  });

  return (
    <div className="pb-6">
      <PageHeader
        title="📸 成长相册"
        subtitle={`${photosWithUrl.length} 张照片`}
      />

      {photosWithUrl.length === 0 ? (
        <div className="px-4 mt-8 text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-400 text-sm">还没有照片哦～</p>
          <p className="text-gray-400 text-sm mt-1">
            在 iMessage 群里发宝宝照片，会自动收录到这里
          </p>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-6">
          {months.map(([monthLabel, monthPhotos]) => (
            <div key={monthLabel}>
              <h2 className="text-sm font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">
                  {parseInt(monthLabel)}
                </span>
                {monthLabel}
              </h2>
              <PhotoGallery photos={monthPhotos} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
