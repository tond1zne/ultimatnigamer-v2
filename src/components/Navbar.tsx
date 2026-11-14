import Link from "next/link";
import { getSession } from "@/lib/guards";
import { SITE_NAME } from "@/lib/site";
import NavLinks from "@/components/NavLinks";
import SignOutButton from "@/components/SignOutButton";

export function Logo() {
  return (
    <Link href="/" className="wiggle flex items-center gap-2.5" aria-label={`${SITE_NAME} - úvodní strana`}>
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden>
        <path d="M20 2l5 10 11-3-4 11 8 7-11 3-1 11-8-8-8 8-1-11-11-3 8-7-4-11 11 3z" fill="#000" />
        <rect x="11" y="15" width="18" height="11" rx="5" fill="#fff" />
        <path d="M16 18v5M13.5 20.5h5" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="19.5" r="1.4" fill="#000" /><circle cx="26.5" cy="22" r="1.4" fill="#000" />
      </svg>
      <span className="font-display text-2xl leading-none sm:text-3xl">{SITE_NAME}</span>
    </Link>
  );
}

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Logo />
        <div className="order-3 w-full overflow-x-auto md:order-none md:w-auto">
          <NavLinks authed={Boolean(user)} admin={user?.role === "ADMIN"} />
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden font-bold sm:inline">{user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm">Přihlásit</Link>
              <Link href="/register" className="btn btn-sm btn-ink">Registrace</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
