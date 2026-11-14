export default function Marquee({ items }: { items: string[] }) {
  const list = items.length ? items : ["Splň výzvu", "Natoč důkaz", "Sbírej body"];
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {list.map((t, i) => (
        <span key={i} className="flex items-center font-display text-2xl">
          <span className="px-6">{t}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M12 1l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="currentColor" /></svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden border-y-[3px] border-ink bg-ink py-3 text-paper">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}
