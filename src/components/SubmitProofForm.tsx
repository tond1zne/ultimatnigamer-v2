"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitProof } from "@/actions/submissions";

export default function SubmitProofForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await submitProof(fd);
      if (!res.ok) return setError(res.error);
      setSent(true);
      router.refresh();
    });
  }

  if (sent) {
    return (
      <div className="panel panel-frame p-6">
        <p className="font-display text-2xl">Důkaz je odeslaný!</p>
        <p className="mt-1 text-ash">Admin ho teď posoudí. Výsledek uvidíš ve svém profilu.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel flex flex-col gap-4 p-5 sm:p-6">
      <input type="hidden" name="challengeId" value={challengeId} />
      <div>
        <label htmlFor="proofUrl" className="label">Odkaz na video nebo screenshot</label>
        <input id="proofUrl" name="proofUrl" type="url" required maxLength={500} placeholder="https://youtu.be/..." className="field" />
        <p className="mt-1 text-sm text-ash">Funguje YouTube, Twitch, Google Drive, Imgur, Streamable, Medal a další. Odkaz musí začínat https://.</p>
      </div>
      <div>
        <label htmlFor="note" className="label">Poznámka pro admina (nepovinné)</label>
        <textarea id="note" name="note" rows={2} maxLength={300} className="field" />
      </div>
      {error && <p role="alert" className="border-[3px] border-ink bg-fog p-3 font-bold">{error}</p>}
      <button type="submit" disabled={pending} className="btn btn-ink w-fit">
        {pending ? "Odesílám..." : "Odeslat důkaz"}
      </button>
    </form>
  );
}
