"use server";

import { prisma, getDefaultBabyId } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BABY_ID = await getDefaultBabyId();

export async function recordSleepEvent(event: "START" | "WAKE") {
  await prisma.sleepLog.create({
    data: {
      babyId: BABY_ID,
      event,
      time: new Date(),
    },
  });
  revalidatePath("/sleep");
}
