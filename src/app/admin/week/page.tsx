import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { getWeekState } from "@/lib/week";
import { closeWeek, startWeek } from "@/actions/admin";
import Countdown from "@/components/Countdown";

export const metadata: Metadata = { title: "Týden" };
export const dynamic = "force-dynamic";

export default async function AdminWeekPage() {
  await requireAdmin();
  const { active, pending } = await getWeekState();
  const past = await prisma.week.findMany({ where: { status: "CLOSED" }, orderBy: { number: "desc" }, take: 15 });

  return (
    <>
      <h1 className="font-display text-4xl leading-none sm:text-5xl">Týden</h1>

      {active ? (
        <section className="panel panel-ink flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <p className="font-display text-3xl leading-none">Týden {active.number} běží</p>
            <p className="mt-1 text-paper/80">Konec: {active.endsAt?.toLocaleString("cs-CZ")}</p>
          </div>
          <Countdown endsAt={active.endsAt!.toISOString()} invert />
          <form action={closeWeek} className="border-t-[3px] border-paper pt-5">
            <p className="mb-3 max-w-md text-paper/80">
              Týden uzavřeš hned, bez ohledu na časovač. Body zůstanou v historii. Další týden se sám nespustí.
            </p>
            <button className="btn" type="submit">Uzavřít týden teď</button>
          </form>
        </section>
      ) : (
        <section className="panel panel-frame flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <p className="font-display text-3xl leading-none">Týden {pending!.number} čeká na start</p>
            <p className="mt-1 max-w-lg text-ash">Dokud týden nespustíš, hráči výzvy vidí, ale nemůžou posílat důkazy.</p>
          </div>
          <form action={startWeek} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="weekId" value={pending!.id} />
            <div>
              <label className="label" htmlFor="days">Délka v dnech</label>
              <input id="days" name="days" type="number" min={1} max={60} defaultValue={7} className="field !w-28" />
            </div>
            <button className="btn btn-ink" type="submit">Spustit týden {pending!.number}</button>
          </form>
        </section>
      )}

      <h2 className="font-display text-3xl leading-none">Historie</h2>
      {past.length === 0 ? (
        <p className="panel p-5 font-bold">Žádný týden ještě neskončil.</p>
      ) : (
        <ul className="panel divide-y-[3px] divide-ink">
          {past.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center gap-3 p-3">
              <span className="font-display text-xl">Týden {w.number}</span>
              <span className="flex-1 text-ash">{w.startsAt?.toLocaleDateString("cs-CZ")} až {w.endsAt?.toLocaleDateString("cs-CZ")}</span>
              <Link href={`/leaderboard?tyden=${w.id}`} className="font-bold underline decoration-[3px] underline-offset-4">Žebříček</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
