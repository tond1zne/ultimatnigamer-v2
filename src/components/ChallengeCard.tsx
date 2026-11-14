import Link from "next/link";
import DifficultyBars from "@/components/DifficultyBars";
import { DIFFICULTY } from "@/lib/site";

type Props = {
  id: string; title: string; description: string;
  category: "GAME" | "IRL"; difficulty: string; points: number;
};

export default function ChallengeCard({ id, title, description, category, difficulty, points }: Props) {
  return (
    <Link
      href={`/challenges/${id}`}
      className="panel group flex flex-col gap-3 p-5 transition-transform duration-150 hover:-translate-y-1 hover:-rotate-[0.6deg]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={category === "GAME" ? "tag tag-ink" : "tag"}>{category === "GAME" ? "Hra" : "IRL"}</span>
          <span className="tag">{DIFFICULTY[difficulty]?.label}</span>
        </div>
        <DifficultyBars difficulty={difficulty} />
      </div>
      <h3 className="font-display text-2xl leading-[1.05]">{title}</h3>
      <p className="line-clamp-3 text-[0.95rem] text-ash">{description}</p>
      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="font-bold underline decoration-[3px] underline-offset-4">Otevřít výzvu</span>
        <span className="bubble bubble-ink mb-3 mr-1 transition-transform group-hover:-rotate-6">
          <span className="font-num text-2xl">+{points}</span>
        </span>
      </div>
    </Link>
  );
}
