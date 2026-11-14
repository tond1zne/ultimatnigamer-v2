export const SITE_NAME = "Ultimátní Gamer";

export type Member = { name: string; photo?: string };

// Fotky dej do /public/team/ a napiš sem cestu, např. "/team/jan.jpg". Bez fotky se zobrazí iniciály.
export const TEAM: { title: string; members: Member[] }[] = [
  { title: "Majitel", members: [{ name: "Jméno Příjmení" }] },
  { title: "Admini", members: [{ name: "Jméno Příjmení" }, { name: "Jméno Příjmení" }] },
  { title: "Testeři", members: [{ name: "Jméno Příjmení" }] },
];

export const DIFFICULTY: Record<string, { label: string; level: number }> = {
  EASY: { label: "Lehká", level: 1 },
  MEDIUM: { label: "Střední", level: 2 },
  HARD: { label: "Těžká", level: 3 },
  INSANE: { label: "Šílená", level: 4 },
};
