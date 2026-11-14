const SHAPES = ["rounded-full", "rounded-[1.1rem]", "rounded-[45%_55%_50%_50%/55%_45%_55%_45%]"];
const FILLS = ["bg-paper text-ink", "bg-ink text-paper", "bg-fog text-ink"];

export default function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={`inline-flex shrink-0 items-center justify-center border-[3px] border-ink font-display leading-none ${SHAPES[h % 3]} ${FILLS[(h >> 3) % 3]}`}
    >
      {initials}
    </span>
  );
}
