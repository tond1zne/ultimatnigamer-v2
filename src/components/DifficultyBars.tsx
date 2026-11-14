import { DIFFICULTY } from "@/lib/site";

export default function DifficultyBars({ difficulty }: { difficulty: string }) {
  const d = DIFFICULTY[difficulty] ?? DIFFICULTY.MEDIUM;
  return (
    <span className="inline-flex items-end gap-1" title={`Obtížnost: ${d.label}`}>
      <span className="sr-only">Obtížnost: {d.label}</span>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{ height: 6 + i * 4 }}
          className={`w-2 border-2 border-ink ${i <= d.level ? "bg-ink" : "bg-paper"}`}
        />
      ))}
    </span>
  );
}
