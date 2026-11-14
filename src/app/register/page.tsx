"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await registerUser(fd);
      if (!r.ok) return setError(r.error);
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="panel panel-frame mx-auto my-6 flex max-w-md flex-col gap-4 p-6 sm:p-8">
        <h1 className="font-display text-4xl leading-none">Zkontroluj e-mail</h1>
        <p>
          Pokud je adresa volná, poslali jsme na ni potvrzovací odkaz. Klikni na něj a pak se můžeš přihlásit.
          Mrkni i do spamu.
        </p>
        <Link href="/login" className="btn btn-ink w-fit">Přejít na přihlášení</Link>
      </div>
    );
  }

  return (
    <div className="panel panel-frame mx-auto my-6 max-w-md p-6 sm:p-8">
      <h1 className="mb-6 font-display text-4xl leading-none">Registrace</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="label">Přezdívka</label>
          <input id="name" name="name" required minLength={2} maxLength={24} autoComplete="nickname" className="field" />
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="label">Heslo</label>
          <input id="password" name="password" type="password" required minLength={10} maxLength={72} autoComplete="new-password" className="field" />
          <p className="mt-1 text-sm text-ash">Aspoň 10 znaků.</p>
        </div>
        {/* Past na roboty, člověk to pole nevidí. */}
        <div className="absolute -left-[9999px]" aria-hidden>
          <label>Web<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        {error && <p role="alert" className="border-[3px] border-ink bg-fog p-3 font-bold">{error}</p>}
        <button type="submit" disabled={pending} className="btn btn-ink mt-1">{pending ? "Vytvářím účet..." : "Vytvořit účet"}</button>
      </form>
      <p className="mt-6 text-ash">
        Už máš účet? <Link href="/login" className="font-bold text-ink underline decoration-[3px] underline-offset-4">Přihlas se</Link>
      </p>
    </div>
  );
}
