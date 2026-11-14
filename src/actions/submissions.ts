"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/guards";
import { getWeekState } from "@/lib/week";
import { getSettings } from "@/lib/settings";
import { adminMail, baseUrl, sendMail } from "@/lib/mail";
import { parseProofUrl } from "@/lib/validate";
import { rateLimit } from "@/lib/ratelimit";
import type { Result } from "@/actions/auth";

export async function submitProof(fd: FormData): Promise<Result> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "Nejdřív se přihlas." };
  const user = session.user;

  if (!(await rateLimit(`submit:${user.id}`, 20, 60 * 60_000))) {
    return { ok: false, error: "Posíláš moc rychle. Zkus to za chvíli." };
  }

  const challengeId = String(fd.get("challengeId") || "");
  const note = String(fd.get("note") || "").trim().slice(0, 300);
  const proofUrl = parseProofUrl(String(fd.get("proofUrl") || ""));
  if (!proofUrl) {
    return { ok: false, error: "Zadej odkaz začínající https:// z podporovaného webu (YouTube, Twitch, Drive, Imgur…)." };
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.isArchived) return { ok: false, error: "Tahle výzva už není aktivní." };

  const { active } = await getWeekState();
  if (!active) return { ok: false, error: "Týden ještě nezačal. Admin ho spustí." };

  const exists = await prisma.submission.findUnique({
    where: { userId_challengeId_weekId: { userId: user.id, challengeId, weekId: active.id } },
    select: { id: true },
  });
  if (exists) return { ok: false, error: "Tuhle výzvu jsi v tomhle týdnu už poslal(a)." };

  try {
    await prisma.submission.create({
      data: { userId: user.id, challengeId, weekId: active.id, proofUrl, note: note || null },
    });
  } catch {
    return { ok: false, error: "Odeslání se nepovedlo. Zkus to znovu." };
  }

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/profile");
  revalidatePath("/admin/submissions");

  try {
    if ((await getSettings()).notifyAdminOnSubmission) {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true }, take: 50 });
      if (admins.length) {
        await sendMail({
          to: admins.map((a) => a.email),
          subject: `Nový důkaz: ${challenge.title}`,
          html: adminMail({ user: user.name, challenge: challenge.title, proofUrl, adminUrl: `${baseUrl()}/admin/submissions` }),
        });
      }
    }
  } catch {
    console.error("[mail] Notifikace adminům selhala.");
  }
  return { ok: true };
}
