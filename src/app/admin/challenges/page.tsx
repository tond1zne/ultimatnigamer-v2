import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { createChallenge, toggleArchiveChallenge } from "@/actions/admin";
import { DIFFICULTY } from "@/lib/site";

export const metadata: Metadata = { title: "Správa výzev" };
export const dynamic = "force-dynamic";

export default async function AdminChallengesPage() {
  await requireAdmin();
  const challenges = await prisma.challenge.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <h1 className="font-display text-4xl leading-none sm:text-5xl">Výzvy</h1>

      <form action={createChallenge} className="panel panel-frame grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-display text-3xl leading-none sm:col-span-2">Nová výzva</h2>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">Název</label>
          <input id="title" name="title" required maxLength={100} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Popis a jaký důkaz poslat</label>
          <textarea id="description" name="description" required maxLength={600} rows={3} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="category">Kategorie</label>
          <select id="category" name="category" className="field"><option value="GAME">Hra</option><option value="IRL">IRL</option></select>
        </div>
        <div>
          <label className="label" htmlFor="difficulty">Obtížnost</label>
          <select id="difficulty" name="difficulty" defaultValue="MEDIUM" className="field">
            {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="points">Body</label>
          <input id="points" name="points" type="number" min={1} max={1000} required className="field" />
        </div>
        <div className="flex items-end"><button className="btn btn-ink" type="submit">Vytvořit výzvu</button></div>
      </form>

      <ul className="flex flex-col gap-3">
        {challenges.map((c) => (
          <li key={c.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-xl leading-tight">{c.title} {c.isArchived && <span className="tag align-middle">Archivováno</span>}</p>
              <p className="text-sm text-ash">{c.category === "GAME" ? "Hra" : "IRL"}, {DIFFICULTY[c.difficulty]?.label}, {c.points} bodů</p>
            </div>
            <form action={toggleArchiveChallenge}>
              <input type="hidden" name="challengeId" value={c.id} />
              <button className="btn btn-sm" type="submit">{c.isArchived ? "Obnovit" : "Archivovat"}</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
