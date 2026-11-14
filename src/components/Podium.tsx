import Avatar from "@/components/Avatar";
import type { Row } from "@/lib/week";

const SLOTS = [
  { idx: 1, rank: 2, h: "h-24", style: "panel-hatch bg-paper" },
  { idx: 0, rank: 1, h: "h-36", style: "bg-ink text-paper" },
  { idx: 2, rank: 3, h: "h-16", style: "panel-dots bg-paper" },
];

export default function Podium({ rows }: { rows: Row[] }) {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {SLOTS.map(({ idx, rank, h, style }) => {
        const row = rows[idx];
        return (
          <div key={rank} className="flex w-1/3 max-w-[11rem] flex-col items-center gap-2">
            {rank === 1 && row && (
              <svg width="34" height="24" viewBox="0 0 34 24" aria-hidden className="-mb-1">
                <path d="M2 22L5 6l8 8 4-12 4 12 8-8 3 16z" fill="#000" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
            {row ? <Avatar name={row.name} size={rank === 1 ? 64 : 52} /> : <div style={{ width: 52, height: 52 }} />}
            <p className="w-full truncate text-center font-bold">{row ? row.name : "Volné místo"}</p>
            <div className={`panel flex w-full flex-col items-center justify-start pt-2 ${h} ${style}`}>
              <span className={`font-display text-3xl leading-none ${rank === 2 ? "bg-paper px-2" : rank === 3 ? "bg-paper px-2" : ""}`}>{rank}</span>
              {row && (
                <span className={`mt-1 text-sm font-bold ${rank === 1 ? "" : "bg-paper px-1"}`}>{row.points} b.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
