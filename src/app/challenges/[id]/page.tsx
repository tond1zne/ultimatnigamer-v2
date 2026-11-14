import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/guards";
import { getWeekState, leaderboard } from "@/lib/week";
import { DIFFICULTY } from "@/lib/site";
import DifficultyBars from "@/components/DifficultyBars";
import Avatar from "@/components/Avatar";
import SubmitProofForm from "@/components/SubmitProofForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await prisma.challenge.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: c?.title ?? "Výzva" };
}

const STATUS = { PENDING: "Čeká na posouzení", APPROVED: "Schváleno", REJECTED: "Zamítnuto" } as const;

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const c = await prisma.challenge.findUnique({ where: { id: params.id } });
  if (!c) notFound();

  const session = await getSession();
  const { active } = await getWeekState();
  const rows = await leaderboard({ challengeId: c.id });

  const mine =
    session?.user && active
      ? await prisma.submission.findUnique({
          where: { userId_challengeId_weekId: { userId: session.user.id, challengeId: c.id, weekId: active.id } },
        })
      : null;

  return (
    <div className="flex flex-col gap-10">
      <Link href="/challenges" className="w-fit font-bold underline decoration-[3px] underline-offset-4">Zpět na výzvy</Link>

      <section className="panel panel-frame relative overflow-hidden p-6 sm:p-10">
        <div className="panel-dots dots-fade pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <div className="relative flex flex-col-reverse justify-between gap-8 sm:flex-row">
          <div className="flex max-w-2xl flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={c.category === "GAME" ? "tag tag-ink" : "tag"}>{c.category === "GAME" ? "Hra" : "IRL"}</span>
              <span className="tag">{DIFFICULTY[c.difficulty]?.label}</span>
              <DifficultyBars difficulty={c.difficulty} />
              {c.isArchived && <span className="tag">Archivováno</span>}
            </div>
            <h1 className="font-display text-4xl leading-[1] sm:text-6xl">{c.title}</h1>
            <p className="whitespace-pre-line text-lg">{c.description}</p>
          </div>
          <span className="bubble bubble-ink mb-4 h-32 w-32 shrink-0 self-start sm:h-40 sm:w-40">
            <span className="font-num text-5xl sm:text-6xl">+{c.points}</span>
            <span className="mt-1 text-sm font-bold">bodů</span>
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="odeslat">
        <h2 id="odeslat" className="font-display text-3xl leading-none">Pošli důkaz</h2>
        {!session?.user ? (
          <div className="panel p-5 font-bold">
            Pro odeslání důkazu se nejdřív <Link href="/login" className="underline decoration-[3px] underline-offset-4">přihlas</Link>.
          </div>
        ) : c.isArchived ? (
          <div className="panel p-5 font-bold">Tahle výzva je archivovaná, důkaz už poslat nejde.</div>
        ) : !active ? (
          <div className="panel p-5 font-bold">Týden ještě nezačal. Jakmile ho admin spustí, můžeš poslat důkaz.</div>
        ) : mine ? (
          <div className="panel flex flex-col gap-2 p-5 sm:p-6">
            <span className={`tag w-fit ${mine.status === "APPROVED" ? "tag-ink" : ""}`}>{STATUS[mine.status]}</span>
            {mine.status === "APPROVED" && <p className="font-display text-3xl">+{mine.pointsAwarded} bodů</p>}
            {mine.status === "REJECTED" && mine.reviewNote && <p>Poznámka admina: {mine.reviewNote}</p>}
            <p className="text-sm text-ash">Tuhle výzvu jsi v týdnu {active.number} už poslal(a).</p>
          </div>
        ) : (
          <SubmitProofForm challengeId={c.id} />
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="zebricek">
        <h2 id="zebricek" className="font-display text-3xl leading-none">Kdo to už splnil</h2>
        {rows.length === 0 ? (
          <p className="panel p-5 font-bold">Zatím nikdo. Můžeš být první.</p>
        ) : (
          <ul className="panel divide-y-[3px] divide-ink">
            {rows.map((r, i) => (
              <li key={r.userId} className="flex items-center gap-4 p-4">
                <span className="w-8 font-display text-2xl">{i + 1}</span>
                <Avatar name={r.name} size={40} />
                <span className="flex-1 truncate font-bold">{r.name}</span>
                <span className="text-sm text-ash">{r.count}× splněno</span>
                <span className="font-display text-2xl">{r.points} b.</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
