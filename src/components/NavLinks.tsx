"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ authed, admin }: { authed: boolean; admin: boolean }) {
  const path = usePathname();
  const links = [
    { href: "/challenges", label: "Výzvy" },
    { href: "/leaderboard", label: "Žebříček" },
    { href: "/tym", label: "Náš tým" },
    ...(authed ? [{ href: "/profile", label: "Profil" }] : []),
    ...(admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <nav aria-label="Hlavní menu" className="flex items-center gap-1">
      {links.map((l) => {
        const on = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg border-2 px-3 py-1.5 font-bold ${
              on ? "border-ink bg-ink text-paper" : "border-transparent hover:border-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
