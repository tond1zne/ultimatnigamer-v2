import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ChallengeCard from "@/components/ChallengeCard";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Výzvy" };
export const dynamic = "force-dynamic";

export default async function ChallengesPage({ searchParams }: { searchParams: { kategorie?: string } }) {
  const filter = searchParams.kategorie === "GAME" || searchParams.kategorie === "IRL" ? searchParams.kategorie : undefined;
  const challenges = await prisma.challenge.findMany({
    where: { isArchived: false, ...(filter ? { category: filter } : {}) },
    orderBy: { points: "desc" },
  });
  const tabs = [
    { key: undefined, label: "Všechny", href: "/challenges" },
    { key: "GAME", label: "Hry", href: "/challenges?kategorie=GAME" },
    { key: "IRL", label: "IRL", href: "/challenges?kategorie=IRL" },
  ];

  return (
    <>
      <PageHeader title="Výzvy">
        Vyber si výzvu, splň ji a natoč nebo vyfoť důkaz. Admin ho posoudí a body se připíšou do žebříčku.
      </PageHeader>
      <div className="mb-8 flex gap-2" role="tablist" aria-label="Kategorie">
        {tabs.map((t) => {
          const on = t.key === filter;
          return (
            <Link key={t.label} href={t.href} role="tab" aria-selected={on}
              className={`btn btn-sm ${on ? "btn-ink" : ""}`}>
              {t.label}
            </Link>
          );
        })}
      </div>
      {challenges.length === 0 ? (
        <p className="panel p-6 font-bold">V téhle kategorii zatím nic není.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} id={c.id} title={c.title} description={c.description} category={c.category} difficulty={c.difficulty} points={c.points} />
          ))}
        </div>
      )}
    </>
  );
}
