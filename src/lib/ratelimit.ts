import { prisma } from "@/lib/prisma";

/** Vrací true, pokud je akce povolena. Okno se počítá v databázi (funguje i na serverless). */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { key } });

  if (!row || row.resetAt <= now) {
    const resetAt = new Date(now.getTime() + windowMs);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return true;
  }
  if (row.count >= limit) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
