import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/Avatar";
import { TEAM, type Member } from "@/lib/site";

export const metadata: Metadata = { title: "Náš tým" };

function Card({ m, big }: { m: Member; big?: boolean }) {
  const size = big ? 132 : 104;
  return (
    <div className={`panel flex flex-col items-center gap-3 p-4 ${big ? "w-48 panel-frame" : "w-40"}`}>
      {m.photo ? (
        <Image src={m.photo} alt={m.name} width={size} height={size} style={{ width: size, height: size }} className="border-[3px] border-ink object-cover" />
      ) : (
        <Avatar name={m.name} size={size} />
      )}
      <span className="text-center font-display text-lg leading-tight">{m.name}</span>
    </div>
  );
}

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Náš tým">Lidé, kteří to celé drží pohromadě.</PageHeader>
      <div className="flex flex-col gap-12">
        {TEAM.map((g, i) => (
          <section key={g.title} aria-labelledby={`t${i}`}>
            <h2 id={`t${i}`} className="mb-5 inline-block bg-ink px-3 py-1 font-display text-2xl text-paper">{g.title}</h2>
            <div className="flex flex-wrap gap-6">
              {g.members.map((m, j) => <Card key={j} m={m} big={i === 0} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
