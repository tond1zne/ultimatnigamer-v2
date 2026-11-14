"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { confirmEmail } from "@/actions/auth";

export default function VerifyButton({ token }: { token: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-bold">E-mail je potvrzený. Teď se můžeš přihlásit.</p>
        <Link href="/login" className="btn btn-ink w-fit">Přejít na přihlášení</Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {state && <p role="alert" className="border-[3px] border-ink bg-fog p-3 font-bold">{state.msg}</p>}
      <button
        className="btn btn-ink w-fit"
        disabled={pending}
        onClick={() => start(async () => {
          const r = await confirmEmail(token);
          setState(r.ok ? { ok: true, msg: "" } : { ok: false, msg: r.error });
        })}
      >
        {pending ? "Potvrzuji..." : "Potvrdit e-mail"}
      </button>
    </div>
  );
}
