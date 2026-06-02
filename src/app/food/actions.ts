"use server";

import { prisma, getDefaultBabyId } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BABY_ID = await getDefaultBabyId();

export async function addFood(formData: FormData) {
  const food = formData.get("food") as string;

  if (!food || food.trim().length === 0) {
    return { error: "请输入食物名称" };
  }

  const now = new Date();
  const observationEnd = new Date(now);
  observationEnd.setDate(observationEnd.getDate() + 3);

  await prisma.foodSafety.create({
    data: {
      babyId: BABY_ID,
      food: food.trim(),
      introduced: now,
      observationEnd,
      status: "OBSERVING",
    },
  });

  revalidatePath("/food");
  return { success: true };
}

export async function addFoodNotTried(formData: FormData) {
  const food = formData.get("food") as string;

  if (!food || food.trim().length === 0) {
    return { error: "请输入食物名称" };
  }

  const now = new Date();

  await prisma.foodSafety.create({
    data: {
      babyId: BABY_ID,
      food: food.trim(),
      introduced: now,
      observationEnd: now,
      status: "NOT_TRIED",
    },
  });

  revalidatePath("/food");
  return { success: true };
}

export async function markFoodSafe(id: string) {
  await prisma.foodSafety.update({
    where: { id },
    data: { status: "SAFE" },
  });

  revalidatePath("/food");
}

export async function markFoodReacted(id: string, reaction: string) {
  await prisma.foodSafety.update({
    where: { id },
    data: { status: "REACTED", reaction },
  });

  revalidatePath("/food");
}
