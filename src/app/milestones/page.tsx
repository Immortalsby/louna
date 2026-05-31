import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { MilestoneCard } from "./milestone-card";
import { AddMilestone } from "./add-milestone";
import { differenceInMonths, differenceInDays } from "date-fns";

const BABY_ID = process.env.BABY_ID!;

function getAgeLabel(birthday: Date, milestoneDate: Date): string {
  const months = differenceInMonths(milestoneDate, birthday);
  const remainingDays = differenceInDays(
    milestoneDate,
    new Date(birthday.getFullYear(), birthday.getMonth() + months, birthday.getDate())
  );

  if (months === 0) {
    return `${differenceInDays(milestoneDate, birthday)}天`;
  }
  if (remainingDays > 0) {
    return `${months}个月${remainingDays}天`;
  }
  return `${months}个月`;
}

export default async function MilestonesPage() {
  await connection();
  const baby = await prisma.baby.findFirst({
    where: { id: BABY_ID },
  });

  const milestones = await prisma.milestone.findMany({
    where: { babyId: BABY_ID },
    orderBy: { date: "desc" },
  });

  const birthday = baby?.birthday ?? new Date();

  return (
    <div className="px-4 pb-8">
      <PageHeader title="🎯 里程碑" subtitle="记录宝宝每一个珍贵的第一次" />

      {/* Add milestone section */}
      <section className="mt-4">
        <AddMilestone
          achievedDescriptions={milestones.map((m) => m.description)}
        />
      </section>

      {/* Milestones list */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          已达成的里程碑
        </h2>
        {milestones.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center mx-auto mb-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">
              还没有记录里程碑，点击上方建议或自定义添加
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                description={milestone.description}
                date={milestone.date.toISOString()}
                ageLabel={getAgeLabel(birthday, milestone.date)}
                photoUrl={milestone.photoUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
