import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let _defaultBabyId: string | null = null;

export async function getDefaultBabyId(): Promise<string> {
  if (_defaultBabyId) return _defaultBabyId;
  if (process.env.BABY_ID) {
    _defaultBabyId = process.env.BABY_ID;
    return _defaultBabyId;
  }
  const baby = await prisma.baby.findFirst({ orderBy: { birthday: "asc" } });
  if (!baby) throw new Error("No baby found. Run POST /api/seed first.");
  _defaultBabyId = baby.id;
  return _defaultBabyId;
}
