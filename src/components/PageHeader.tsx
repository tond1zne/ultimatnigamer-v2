import type { ReactNode } from "react";

export default function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-3">
      <h1 className="font-display text-4xl leading-none sm:text-6xl">{title}</h1>
      {children && <div className="max-w-2xl text-ash">{children}</div>}
    </header>
  );
}
