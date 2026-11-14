import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.appSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton" }, update: {} });
}
