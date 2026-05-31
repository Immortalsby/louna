"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BABY_ID = process.env.BABY_ID!;

export async function addMilestone(description: string, dateStr?: string) {
  if (!description || description.trim().length === 0) {
    return { error: "请输入里程碑描述" };
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  await prisma.milestone.create({
    data: {
      babyId: BABY_ID,
      description: description.trim(),
      date,
    },
  });

  revalidatePath("/milestones");
  return { success: true };
}

export async function addMilestoneFromForm(formData: FormData) {
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  return addMilestone(description, dateStr || undefined);
}
