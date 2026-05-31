"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const BABY_ID = process.env.BABY_ID!;

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
