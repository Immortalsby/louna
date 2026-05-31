import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const firstBaby = await prisma.baby.findFirst();
    if (!firstBaby) {
      return Response.json(
        { error: "No baby found. Please seed the database first." },
        { status: 404 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const timeFilter = { gte: todayStart, lte: todayEnd };

    // Calculate age
    const birthday = new Date(firstBaby.birthday);
    const ageMs = now.getTime() - birthday.getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const ageMonths = Math.floor(ageDays / 30.44);
    const remainingDays = Math.floor(ageDays - ageMonths * 30.44);

    // Feeding data for today
    const feedings = await prisma.feedingLog.findMany({
      where: { babyId: firstBaby.id, time: timeFilter },
      orderBy: { time: "desc" },
    });

    const milkFeeds = feedings.filter((f) => f.type === "MILK");
    const solidFeeds = feedings.filter((f) => f.type === "SOLID");
    const totalMilkMl = milkFeeds.reduce((sum, f) => sum + (f.ml ?? 0), 0);

    // Sleep events for today
    const sleepEvents = await prisma.sleepLog.findMany({
      where: { babyId: firstBaby.id, time: timeFilter },
      orderBy: { time: "desc" },
    });

    // Latest temp
    const latestTemp = await prisma.tempLog.findFirst({
      where: { babyId: firstBaby.id },
      orderBy: { time: "desc" },
    });

    // Foods under observation
    const foodsUnderObservation = await prisma.foodSafety.findMany({
      where: { babyId: firstBaby.id, status: "OBSERVING" },
      orderBy: { introduced: "desc" },
    });

    return Response.json({
      date: todayStart.toISOString().split("T")[0],
      baby: { name: firstBaby.name, birthday: firstBaby.birthday },
      age: `${ageMonths}m ${remainingDays}d`,
      milkFeeds: milkFeeds.length,
      totalMilkMl,
      solidFeeds: solidFeeds.length,
      sleepEvents: sleepEvents.length,
      latestTemp: latestTemp
        ? { temp: latestTemp.temp, time: latestTemp.time }
        : null,
      foodsUnderObservation: foodsUnderObservation.map((f) => ({
        food: f.food,
        introduced: f.introduced,
        observationEnd: f.observationEnd,
      })),
    });
  } catch (error) {
    console.error("Failed to generate today summary:", error);
    return Response.json(
      { error: "Failed to generate today summary" },
      { status: 500 }
    );
  }
}
