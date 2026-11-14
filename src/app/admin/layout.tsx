import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const waiting = await prisma.submission.count({ where: { status: "PENDING" } });
  const links = [
    { href: "/admin", label: "Přehled" },
    { href: "/admin/submissions", label: "Důkazy", badge: waiting },
    { href: "/admin/challenges", label: "Výzvy" },
    { href: "/admin/week", label: "Týden" },
    { href: "/admin/settings", label: "Nastavení" },
  ];
  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Administrace" className="flex flex-wrap gap-2 border-b-[3px] border-ink pb-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-sm">
            {l.label}
            {l.badge ? <span className="tag tag-ink !py-0">{l.badge}</span> : null}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
