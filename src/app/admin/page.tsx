import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { getWeekState } from "@/lib/week";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const { active, pending } = await getWeekState();
  const [waiting, challenges, users] = await Promise.all([
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.challenge.count({ where: { isArchived: false } }),
    prisma.user.count(),
  ]);
  const cards = [
    { href: "/admin/submissions", n: waiting, label: "důkazů čeká na posouzení", dark: waiting > 0 },
    { href: "/admin/challenges", n: challenges, label: "aktivních výzev", dark: false },
    { href: "/admin/week", n: (active ?? pending!).number, label: active ? "týden běží" : "týden čeká na start", dark: false },
    { href: "/admin/settings", n: users, label: "registrovaných hráčů", dark: false },
  ];
  return (
    <>
      <h1 className="font-display text-4xl leading-none sm:text-5xl">Admin</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={`panel flex flex-col gap-2 p-6 ${c.dark ? "panel-ink" : ""}`}>
            <span className="font-display text-6xl leading-none">{c.n}</span>
            <span className="font-bold">{c.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
