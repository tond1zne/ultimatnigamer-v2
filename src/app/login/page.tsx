"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { resendVerification } from "@/actions/auth";

const MESSAGES: Record<string, string> = {
  CredentialsSignin: "Špatný e-mail nebo heslo.",
  RATE_LIMIT: "Příliš mnoho pokusů. Zkus to za 15 minut.",
  UNVERIFIED: "E-mail ještě není potvrzený. Klikni na odkaz v e-mailu, který jsme ti poslali.",
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setCode(null); setResent(false); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")), password: String(fd.get("password")), redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setCode(res.error);
      return setError(MESSAGES[res.error] ?? MESSAGES.CredentialsSignin);
    }
    router.push("/");
    router.refresh();
  }

  async function resend() {
    const fd = new FormData();
    fd.set("email", email);
    await resendVerification(fd);
    setResent(true);
  }

  return (
    <div className="panel panel-frame mx-auto my-6 max-w-md p-6 sm:p-8">
      <h1 className="mb-6 font-display text-4xl leading-none">Přihlášení</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="label">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="label">Heslo</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
        {error && <p role="alert" className="border-[3px] border-ink bg-fog p-3 font-bold">{error}</p>}
        {code === "UNVERIFIED" && !resent && (
          <button type="button" onClick={resend} className="w-fit font-bold underline decoration-[3px] underline-offset-4">
            Poslat potvrzovací e-mail znovu
          </button>
        )}
        {resent && <p className="font-bold">Pokud účet existuje a není potvrzený, poslali jsme nový e-mail.</p>}
        <button type="submit" disabled={loading} className="btn btn-ink mt-1">{loading ? "Přihlašuji..." : "Přihlásit se"}</button>
      </form>
      <p className="mt-6 text-ash">
        Nemáš účet? <Link href="/register" className="font-bold text-ink underline decoration-[3px] underline-offset-4">Zaregistruj se</Link>
      </p>
    </div>
  );
}
