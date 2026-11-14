import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWeekState, leaderboard } from "@/lib/week";
import PageHeader from "@/components/PageHeader";
import Podium from "@/components/Podium";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Žebříček" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: { obdobi?: string; tyden?: string } }) {
  const all = searchParams.obdobi === "all";
  const { active } = await getWeekState();
  const weeks = await prisma.week.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { number: "desc" },
    take: 30,
  });
  const selected = weeks.find((w) => w.id === searchParams.tyden) ?? active ?? weeks[0] ?? null;
  const rows = all ? await leaderboard({}) : selected ? await leaderboard({ weekId: selected.id }) : [];
  const rest = rows.slice(3);

  return (
    <>
      <PageHeader title="Žebříček">
        Počítají se jen schválené výzvy. Týdenní žebříček se uzavře, když vyprší čas nebo ho admin ukončí.
      </PageHeader>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link href="/leaderboard" className={`btn btn-sm ${!all ? "btn-ink" : ""}`}>Týden</Link>
        <Link href="/leaderboard?obdobi=all" className={`btn btn-sm ${all ? "btn-ink" : ""}`}>Celkově</Link>
        {!all && weeks.length > 0 && (
          <form action="/leaderboard" className="flex items-center gap-2 sm:ml-auto">
            <label htmlFor="tyden" className="font-bold">Týden</label>
            <select id="tyden" name="tyden" defaultValue={selected?.id} className="field !w-auto !py-1.5">
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>{w.number}{w.status === "ACTIVE" ? " (běží)" : ""}</option>
              ))}
            </select>
            <button className="btn btn-sm" type="submit">Zobrazit</button>
          </form>
        )}
      </div>

      {!all && !selected ? (
        <p className="panel p-6 font-bold">Žádný týden ještě neproběhl. Žebříček se objeví po spuštění prvního týdne.</p>
      ) : rows.length === 0 ? (
        <p className="panel p-6 font-bold">Zatím tu nejsou žádné schválené body.</p>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="panel panel-dots p-6 pt-10 sm:p-10 sm:pt-12">
            <div className="bg-paper p-4 sm:p-6"><Podium rows={rows} /></div>
          </div>
          {rest.length > 0 && (
            <ol start={4} className="panel divide-y-[3px] divide-ink">
              {rest.map((r, i) => (
                <li key={r.userId} className="flex items-center gap-4 p-4">
                  <span className="w-8 font-display text-2xl">{i + 4}</span>
                  <Avatar name={r.name} size={40} />
                  <span className="flex-1 truncate font-bold">{r.name}</span>
                  <span className="hidden text-sm text-ash sm:inline">{r.count} výzev</span>
                  <span className="font-display text-2xl">{r.points} b.</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  );
}
