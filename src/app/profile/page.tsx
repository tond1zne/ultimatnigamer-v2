import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Můj profil" };
export const dynamic = "force-dynamic";

const STATUS = { PENDING: "Čeká", APPROVED: "Schváleno", REJECTED: "Zamítnuto" } as const;

export default async function ProfilePage() {
  const user = await requireUser();
  const subs = await prisma.submission.findMany({
    where: { userId: user.id },
    include: { challenge: { select: { title: true } }, week: { select: { number: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const points = subs.filter((s) => s.status === "APPROVED").reduce((a, s) => a + (s.pointsAwarded ?? 0), 0);
  const done = subs.filter((s) => s.status === "APPROVED").length;
  const waiting = subs.filter((s) => s.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-10">
      <section className="panel panel-frame flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <Avatar name={user.name} size={84} />
        <div className="flex-1">
          <h1 className="font-display text-4xl leading-none sm:text-5xl">{user.name}</h1>
          <p className="mt-1 text-ash">{user.email}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[[points, "bodů"], [done, "splněno"], [waiting, "čeká"]].map(([n, l]) => (
            <div key={String(l)}>
              <p className="font-display text-4xl leading-none">{n}</p>
              <p className="text-sm font-bold">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-3xl leading-none">Moje důkazy</h2>
        {subs.length === 0 ? (
          <p className="panel p-6 font-bold">
            Zatím jsi nic neposlal(a). <Link href="/challenges" className="underline decoration-[3px] underline-offset-4">Vyber si výzvu</Link>.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {subs.map((s) => (
              <li key={s.id} className="panel flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1">
                  <Link href={`/challenges/${s.challengeId}`} className="font-display text-xl leading-tight underline decoration-2 underline-offset-4">
                    {s.challenge.title}
                  </Link>
                  <p className="text-sm text-ash">Týden {s.week.number}, {s.createdAt.toLocaleDateString("cs-CZ")}</p>
                  {s.status === "REJECTED" && s.reviewNote && <p className="text-sm">Admin: {s.reviewNote}</p>}
                </div>
                {s.status === "APPROVED" && <span className="font-display text-2xl">+{s.pointsAwarded}</span>}
                <span className={`tag w-fit ${s.status === "APPROVED" ? "tag-ink" : ""}`}>{STATUS[s.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
