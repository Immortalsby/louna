import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiToken } from "@/lib/api-auth";

// French vaccine calendar for babies
const FRENCH_VACCINE_CALENDAR = [
  { name: "BCG", scheduledMonths: 1 },
  { name: "DTP-Coqueluche-Hib-HepB (1re dose)", scheduledMonths: 2 },
  { name: "Pneumocoque (1re dose)", scheduledMonths: 2 },
  { name: "DTP-Coqueluche-Hib-HepB (2e dose)", scheduledMonths: 4 },
  { name: "Pneumocoque (2e dose)", scheduledMonths: 4 },
  { name: "Meningocoque C (1re dose)", scheduledMonths: 5 },
  { name: "DTP-Coqueluche-Hib-HepB (3e dose)", scheduledMonths: 11 },
  { name: "Pneumocoque (3e dose)", scheduledMonths: 11 },
  { name: "ROR (1re dose)", scheduledMonths: 12 },
  { name: "Meningocoque C (2e dose)", scheduledMonths: 12 },
  { name: "ROR (2e dose)", scheduledMonths: 16 },
  { name: "DTP-Coqueluche (rappel)", scheduledMonths: 6 * 12 },
  { name: "Meningocoque ACWY", scheduledMonths: 11 * 12 },
] as const;

export async function POST(request: NextRequest) {
  if (!validateApiToken(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Only seed if no babies exist
    const existingBabies = await prisma.baby.count();
    if (existingBabies > 0) {
      return Response.json(
        { error: "Database already has babies. Seed aborted." },
        { status: 409 }
      );
    }

    const birthday = new Date("2025-11-23T00:00:00.000Z");

    // Create the baby
    const baby = await prisma.baby.create({
      data: {
        name: "Louna",
        birthday,
        gender: "female",
      },
    });

    // Seed the French vaccine calendar
    const vaccineData = FRENCH_VACCINE_CALENDAR.map((v) => {
      const scheduledDate = new Date(birthday);
      scheduledDate.setMonth(scheduledDate.getMonth() + v.scheduledMonths);
      return {
        babyId: baby.id,
        name: v.name,
        scheduledDate,
      };
    });

    await prisma.vaccineLog.createMany({ data: vaccineData });

    const vaccines = await prisma.vaccineLog.findMany({
      where: { babyId: baby.id },
      orderBy: { scheduledDate: "asc" },
    });

    return Response.json(
      {
        message: "Seed complete",
        baby,
        vaccinesCreated: vaccines.length,
        vaccines,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to seed database:", error);
    return Response.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
