import { Prisma, type Week } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;

async function ensurePending(): Promise<Week> {
  const pending = await prisma.week.findFirst({ where: { status: "PENDING" } });
  if (pending) return pending;
  const last = await prisma.week.findFirst({ orderBy: { number: "desc" } });
  return prisma.week.create({ data: { number: (last?.number ?? 0) + 1, status: "PENDING" } });
}

/** Aktivní týden se po vypršení sám uzavře. Další se ale nikdy nespustí sám, to dělá jen admin. */
export async function getWeekState(): Promise<{ active: Week | null; pending: Week | null }> {
  const active = await prisma.week.findFirst({ where: { status: "ACTIVE" } });
  if (active && active.endsAt && active.endsAt.getTime() <= Date.now()) {
    await prisma.week.update({ where: { id: active.id }, data: { status: "CLOSED", closedAt: new Date() } });
    return { active: null, pending: await ensurePending() };
  }
  if (active) return { active, pending: null };
  return { active: null, pending: await ensurePending() };
}

export async function startWeek(weekId: string, days: number) {
  if (await prisma.week.findFirst({ where: { status: "ACTIVE" } })) {
    throw new Error("Už běží aktivní týden.");
  }
  const now = new Date();
  return prisma.week.update({
    where: { id: weekId, status: "PENDING" },
    data: { status: "ACTIVE", startsAt: now, endsAt: new Date(now.getTime() + days * DAY) },
  });
}

export async function closeActiveWeekNow() {
  const active = await prisma.week.findFirst({ where: { status: "ACTIVE" } });
  if (active) {
    await prisma.week.update({ where: { id: active.id }, data: { status: "CLOSED", closedAt: new Date() } });
  }
  return ensurePending();
}

export type Row = { userId: string; name: string; points: number; count: number };

export async function leaderboard(opts: { weekId?: string; challengeId?: string; limit?: number }): Promise<Row[]> {
  const where: Prisma.SubmissionWhereInput = { status: "APPROVED" };
  if (opts.weekId) where.weekId = opts.weekId;
  if (opts.challengeId) where.challengeId = opts.challengeId;

  const grouped = await prisma.submission.groupBy({
    by: ["userId"],
    where,
    _sum: { pointsAwarded: true },
    _count: { _all: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true },
  });
  const names = new Map(users.map((u) => [u.id, u.name]));

  const rows = grouped.map((g) => ({
    userId: g.userId,
    name: names.get(g.userId) ?? "Neznámý",
    points: g._sum.pointsAwarded ?? 0,
    count: g._count._all,
  }));
  rows.sort((a, b) => b.points - a.points || b.count - a.count || a.name.localeCompare(b.name, "cs"));
  return opts.limit ? rows.slice(0, opts.limit) : rows;
}
