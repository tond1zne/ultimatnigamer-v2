"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ endsAt, invert = false }: { endsAt: string; invert?: boolean }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : Math.max(0, end - now);
  const parts =
    left === null
      ? [["dní", "--"], ["hod", "--"], ["min", "--"], ["s", "--"]]
      : [
          ["dní", pad(Math.floor(left / 86400000))],
          ["hod", pad(Math.floor((left / 3600000) % 24))],
          ["min", pad(Math.floor((left / 60000) % 60))],
          ["s", pad(Math.floor((left / 1000) % 60))],
        ];

  return (
    <div role="timer" aria-label="Zbývající čas týdne" className="flex gap-2">
      {parts.map(([label, value]) => (
        <div
          key={label}
          className={`flex w-[4.2rem] flex-col items-center border-[3px] px-1 pb-1 pt-1.5 ${
            invert ? "border-paper bg-ink text-paper" : "border-ink bg-paper text-ink"
          }`}
        >
          <span key={value} className={`font-num text-3xl leading-none ${label === "s" ? "tick" : ""}`}>{value}</span>
          <span className="mt-1 text-xs font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}
