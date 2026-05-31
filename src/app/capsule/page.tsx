import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { differenceInMonths } from "date-fns";

export default async function CapsulePage() {
  await connection();
  const babyId = await getDefaultBabyId();
  const baby = await prisma.baby.findUniqueOrThrow({ where: { id: babyId } });

  const now = new Date();
  const currentMonth = differenceInMonths(now, baby.birthday);

  const capsules = [];

  for (let m = 0; m <= currentMonth; m++) {
    const monthStart = new Date(baby.birthday);
    monthStart.setMonth(monthStart.getMonth() + m);
    const monthEnd = new Date(baby.birthday);
    monthEnd.setMonth(monthEnd.getMonth() + m + 1);

    const [milestones, photos, feedingCount, growthLogs] = await Promise.all([
      prisma.milestone.findMany({
        where: { babyId, date: { gte: monthStart, lt: monthEnd } },
        orderBy: { date: "asc" },
      }),
      prisma.photo.findMany({
        where: { babyId, takenAt: { gte: monthStart, lt: monthEnd } },
        orderBy: { takenAt: "asc" },
        take: 4,
      }),
      prisma.feedingLog.count({
        where: { babyId, time: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.growthLog.findMany({
        where: { babyId, date: { gte: monthStart, lt: monthEnd } },
        orderBy: { date: "desc" },
        take: 1,
      }),
    ]);

    const timeCapsuleMilestones = milestones.filter((ms) =>
      ms.description.startsWith("💌 时间胶囊")
    );
    const regularMilestones = milestones.filter(
      (ms) => !ms.description.startsWith("💌 时间胶囊")
    );

    const letter = timeCapsuleMilestones.length > 0
      ? timeCapsuleMilestones[0].description.replace(/^💌 时间胶囊 · \d+个月: /, "")
      : null;

    capsules.push({
      month: m,
      milestones: regularMilestones.map((ms) => ms.description),
      photos: photos.map((p) => ({
        url: `https://louna-photos.bytech-solutions.cc/${p.filename}`,
        caption: p.caption,
      })),
      feedingCount,
      growth: growthLogs[0] || null,
      letter,
      hasData: regularMilestones.length > 0 || photos.length > 0 || feedingCount > 0 || growthLogs.length > 0,
    });
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="💌 时间胶囊"
        subtitle={`写给未来的 ${baby.name}`}
      />

      <div className="px-4 mt-4 space-y-4">
        {capsules.map((c) => (
          <div
            key={c.month}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#f0e8e0]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[#f4a293] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{c.month}个月</span>
                <span className="text-xs opacity-80">
                  {new Date(
                    new Date(baby.birthday).setMonth(
                      baby.birthday.getMonth() + c.month
                    )
                  ).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Photos grid */}
              {c.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden">
                  {c.photos.map((photo, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="aspect-square object-cover w-full"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Milestones */}
              {c.milestones.length > 0 && (
                <div>
                  {c.milestones.map((ms, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-700 py-1"
                    >
                      <span className="text-[var(--primary)]">🎯</span>
                      <span>{ms}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Growth */}
              {c.growth && (
                <div className="flex gap-3 text-xs text-gray-500">
                  {c.growth.weightKg && (
                    <span>⚖️ {c.growth.weightKg}kg</span>
                  )}
                  {c.growth.heightCm && (
                    <span>📏 {c.growth.heightCm}cm</span>
                  )}
                  {c.growth.headCm && (
                    <span>🧠 {c.growth.headCm}cm</span>
                  )}
                </div>
              )}

              {/* Stats */}
              {c.feedingCount > 0 && (
                <div className="text-xs text-gray-400">
                  本月喂养 {c.feedingCount} 次 · {c.photos.length} 张照片
                </div>
              )}

              {/* Letter */}
              {c.letter ? (
                <div className="bg-[#fef9f3] rounded-xl p-3 border-l-4 border-[var(--primary)]">
                  <p className="text-xs text-[var(--primary)] font-medium mb-1">
                    💌 给未来的 {baby.name}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    &ldquo;{c.letter}&rdquo;
                  </p>
                </div>
              ) : !c.hasData ? (
                <p className="text-sm text-gray-300 text-center py-2">
                  等待记录中...
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
