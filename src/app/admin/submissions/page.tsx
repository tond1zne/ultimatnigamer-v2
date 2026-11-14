import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { approveSubmission, rejectSubmission } from "@/actions/admin";

export const metadata: Metadata = { title: "Posoudit důkazy" };
export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  await requireAdmin();
  const [pending, recent] = await Promise.all([
    prisma.submission.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } }, challenge: true, week: { select: { number: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.submission.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: { select: { name: true } }, challenge: { select: { title: true } } },
      orderBy: { reviewedAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <>
      <h1 className="font-display text-4xl leading-none sm:text-5xl">Posoudit důkazy</h1>
      {pending.length === 0 ? (
        <p className="panel p-6 font-bold">Všechno je posouzené. Žádný důkaz nečeká.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {pending.map((s) => (
            <article key={s.id} className="panel flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl leading-tight">{s.challenge.title}</h2>
                  <p className="text-sm text-ash">
                    {s.user.name} ({s.user.email}), týden {s.week.number}, {s.createdAt.toLocaleString("cs-CZ")}
                  </p>
                </div>
                <span className="tag">Výchozí odměna {s.challenge.points} b.</span>
              </div>
              <a href={s.proofUrl} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-bold underline decoration-[3px] underline-offset-4">
                {s.proofUrl}
              </a>
              {s.note && <p className="border-l-[3px] border-ink pl-3">Poznámka hráče: {s.note}</p>}
              <div className="flex flex-wrap items-end gap-6 border-t-[3px] border-ink pt-4">
                <form action={approveSubmission} className="flex items-end gap-2">
                  <input type="hidden" name="submissionId" value={s.id} />
                  <div>
                    <label className="label" htmlFor={`p${s.id}`}>Body</label>
                    <input id={`p${s.id}`} name="points" type="number" min={0} max={1000} defaultValue={s.challenge.points} className="field !w-28" />
                  </div>
                  <button className="btn btn-ink btn-sm" type="submit">Schválit</button>
                </form>
                <form action={rejectSubmission} className="flex items-end gap-2">
                  <input type="hidden" name="submissionId" value={s.id} />
                  <div>
                    <label className="label" htmlFor={`r${s.id}`}>Důvod zamítnutí</label>
                    <input id={`r${s.id}`} name="reviewNote" maxLength={200} className="field !w-56" />
                  </div>
                  <button className="btn btn-sm" type="submit">Zamítnout</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-4 font-display text-3xl leading-none">Naposledy posouzeno</h2>
      {recent.length === 0 ? (
        <p className="panel p-5 font-bold">Zatím nic.</p>
      ) : (
        <ul className="panel divide-y-[3px] divide-ink">
          {recent.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 p-3">
              <span className="font-bold">{s.user.name}</span>
              <span className="flex-1 text-ash">{s.challenge.title}</span>
              <span className={`tag ${s.status === "APPROVED" ? "tag-ink" : ""}`}>
                {s.status === "APPROVED" ? `+${s.pointsAwarded} b.` : "Zamítnuto"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
