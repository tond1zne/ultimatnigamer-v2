"use server";

import { revalidatePath } from "next/cache";
import { Category, Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { closeActiveWeekNow, startWeek as startWeekLib } from "@/lib/week";

const int = (v: FormDataEntryValue | null) => Number(String(v ?? ""));

export async function approveSubmission(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("submissionId") || "");
  const points = int(fd.get("points"));
  if (!id || !Number.isInteger(points) || points < 0 || points > 1000) return;

  await prisma.submission.update({
    where: { id },
    data: { status: "APPROVED", pointsAwarded: points, reviewedAt: new Date(), reviewNote: null },
  });
  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");
  revalidatePath("/");
}

export async function rejectSubmission(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("submissionId") || "");
  const note = String(fd.get("reviewNote") || "").trim().slice(0, 200);
  if (!id) return;

  await prisma.submission.update({
    where: { id },
    data: { status: "REJECTED", pointsAwarded: 0, reviewedAt: new Date(), reviewNote: note || "Důkaz nebyl uznán." },
  });
  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");
}

export async function createChallenge(fd: FormData): Promise<void> {
  await assertAdmin();
  const title = String(fd.get("title") || "").trim();
  const description = String(fd.get("description") || "").trim();
  const category = String(fd.get("category") || "") as Category;
  const difficulty = String(fd.get("difficulty") || "") as Difficulty;
  const points = int(fd.get("points"));

  if (!title || title.length > 100 || !description || description.length > 600) return;
  if (!Object.values(Category).includes(category) || !Object.values(Difficulty).includes(difficulty)) return;
  if (!Number.isInteger(points) || points < 1 || points > 1000) return;

  await prisma.challenge.create({ data: { title, description, category, difficulty, points } });
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");
}

export async function toggleArchiveChallenge(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("challengeId") || "");
  const c = await prisma.challenge.findUnique({ where: { id } });
  if (!c) return;
  await prisma.challenge.update({ where: { id }, data: { isArchived: !c.isArchived } });
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  revalidatePath("/");
}

export async function startWeek(fd: FormData): Promise<void> {
  await assertAdmin();
  const weekId = String(fd.get("weekId") || "");
  const days = int(fd.get("days"));
  if (!weekId || !Number.isInteger(days) || days < 1 || days > 60) return;
  try {
    await startWeekLib(weekId, days);
  } catch {
    return;
  }
  revalidatePath("/", "layout");
}

export async function closeWeek(): Promise<void> {
  await assertAdmin();
  await closeActiveWeekNow();
  revalidatePath("/", "layout");
}

export async function toggleAdminNotifications(fd: FormData): Promise<void> {
  await assertAdmin();
  const enabled = String(fd.get("enabled") || "") === "true";
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", notifyAdminOnSubmission: enabled },
    update: { notifyAdminOnSubmission: enabled },
  });
  revalidatePath("/admin/settings");
}
