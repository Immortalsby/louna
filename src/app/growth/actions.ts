"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BABY_ID = process.env.BABY_ID!;

export async function addGrowthLog(formData: FormData) {
  const dateStr = formData.get("date") as string;
  const weightStr = formData.get("weight") as string;
  const heightStr = formData.get("height") as string;
  const headStr = formData.get("head") as string;

  if (!dateStr) {
    throw new Error("日期不能为空");
  }

  const weightKg = weightStr ? parseFloat(weightStr) : null;
  const heightCm = heightStr ? parseFloat(heightStr) : null;
  const headCm = headStr ? parseFloat(headStr) : null;

  if (weightKg === null && heightCm === null && headCm === null) {
    throw new Error("至少填写一项测量数据");
  }

  await prisma.growthLog.create({
    data: {
      babyId: BABY_ID,
      date: new Date(dateStr),
      weightKg,
      heightCm,
      headCm,
    },
  });

  revalidatePath("/growth");
}
