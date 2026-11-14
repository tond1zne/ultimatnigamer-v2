import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWeekState, leaderboard } from "@/lib/week";
import Countdown from "@/components/Countdown";
import CountUp from "@/components/CountUp";
import ChallengeCard from "@/components/ChallengeCard";
import Marquee from "@/components/Marquee";
import Podium from "@/components/Podium";

export const dynamic = "force-dynamic";

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

export default async function HomePage() {
  const { active, pending } = await getWeekState();
  const week = active ?? pending!;

  const [challenges, players, approved, top] = await Promise.all([
    prisma.challenge.findMany({ where: { isArchived: false }, orderBy: { points: "desc" }, take: 6 }),
    prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    active ? leaderboard({ weekId: active.id, limit: 3 }) : Promise.resolve([]),
  ]);
  const best = challenges[0];

  return (
    <div className="flex flex-col gap-14">
      <section className="grid gap-5 md:grid-cols-12" aria-label="Úvod">
        <div className="panel panel-frame slam relative overflow-hidden p-6 sm:p-10 md:col-span-8" style={d(0)}>
          <div className="panel-dots dots-fade pointer-events-none absolute inset-0 opacity-30" aria-hidden />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <h1 className="font-display text-[2.9rem] leading-[0.95] sm:text-7xl">
              Splň to.<br />
              Natoč to.<br />
              <span className="inline-block -rotate-1 bg-ink px-3 text-paper">Zapiš si body.</span>
            </h1>
            <div className="flex flex-col gap-5">
              <p className="max-w-md text-lg">
                Výzvy ve hrách i v reálném životě. Čím těžší výzva, tím víc bodů. Nikdo nemusí splnit všechno.
              </p>
              <div className="flex flex-wrap gap-3 pb-1">
                <Link href="/challenges" className="btn btn-ink">Vybrat výzvu</Link>
                <Link href="/leaderboard" className="btn">Žebříček</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="panel panel-ink slam flex flex-col justify-between gap-6 p-6 md:col-span-4" style={d(1)}>
          <div>
            <p className="font-display text-3xl leading-none">Týden {week.number}</p>
            <p className="mt-1 text-sm text-paper/80">
              {active ? "Běží. Do konce zbývá:" : "Čeká na spuštění adminem."}
            </p>
          </div>
          {active ? (
            <Countdown endsAt={active.endsAt!.toISOString()} invert />
          ) : (
            <div className="border-[3px] border-dashed border-paper p-4 font-bold">
              Časovač ještě neběží. Výzvy si můžeš prohlédnout už teď.
            </div>
          )}
        </div>

        <div className="panel panel-dots slam flex min-h-[13rem] items-center justify-center p-6 md:col-span-5" style={d(2)}>
          {best ? (
            <Link href={`/challenges/${best.id}`} className="group flex flex-col items-center gap-6 text-center">
              <span className="bubble bubble-ink px-7 py-5 transition-transform group-hover:-rotate-3">
                <span className="font-num text-6xl">+{best.points}</span>
                <span className="mt-1 text-sm font-bold">nejvyšší odměna</span>
              </span>
              <span className="bg-paper px-3 py-1 font-display text-2xl leading-tight">{best.title}</span>
            </Link>
          ) : (
            <p className="bg-paper p-3 text-center font-bold">Admin zatím nepřidal žádnou výzvu.</p>
          )}
        </div>

        <div className="panel slam grid grid-cols-3 md:col-span-7" style={d(3)}>
          {[
            [players, "hráčů"],
            [challenges.length, "aktivních výzev"],
            [approved, "schválených důkazů"],
          ].map(([n, label], i) => (
            <div key={String(label)} className={`flex flex-col justify-center gap-1 p-4 sm:p-6 ${i ? "border-l-[3px] border-ink" : ""}`}>
              <span className="text-5xl leading-none sm:text-6xl"><CountUp value={Number(n)} /></span>
              <span className="text-sm font-bold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="-mx-4 sm:-mx-6">
        <Marquee items={challenges.map((c) => c.title)} />
      </div>

      <section aria-labelledby="vyzvy">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="vyzvy" className="font-display text-4xl leading-none sm:text-5xl">Nejlepší výzvy</h2>
          <Link href="/challenges" className="font-bold underline decoration-[3px] underline-offset-4">Všechny výzvy</Link>
        </div>
        {challenges.length === 0 ? (
          <p className="panel p-6 font-bold">Zatím tu nejsou žádné výzvy. Admin je brzy přidá.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => (
              <ChallengeCard key={c.id} id={c.id} title={c.title} description={c.description} category={c.category} difficulty={c.difficulty} points={c.points} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="jak" className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 id="jak" className="mb-6 font-display text-4xl leading-none sm:text-5xl">Jak to funguje</h2>
          <ol className="flex flex-col gap-4">
            {[
              ["Vyber výzvu", "Hru nebo něco v reálu. Každá má jasně daný počet bodů."],
              ["Natoč důkaz", "Nahraj video nebo screenshot na YouTube, Twitch či Drive a pošli sem odkaz."],
              ["Počkej na schválení", "Admin důkaz zkontroluje a body se ti připíšou do žebříčku."],
            ].map(([t, s], i) => (
              <li key={t} className="flex gap-4">
                <span className="bubble bubble-ink h-12 w-12 shrink-0 !p-0"><span className="font-num text-2xl">{i + 1}</span></span>
                <div>
                  <p className="font-display text-2xl leading-none">{t}</p>
                  <p className="mt-1 text-ash">{s}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="panel p-6 sm:p-8">
          <h2 className="mb-6 font-display text-3xl leading-none">Čelo žebříčku týdne</h2>
          {!active ? (
            <p className="font-bold">Žebříček se objeví, jakmile admin spustí týden.</p>
          ) : top.length === 0 ? (
            <p className="font-bold">Zatím nikdo nemá schválené body. Buď první.</p>
          ) : (
            <Podium rows={top} />
          )}
        </div>
      </section>
    </div>
  );
}
