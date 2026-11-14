import { PrismaClient, Category, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Admin").trim();

  if (!email.includes("@") || password.length < 12) {
    throw new Error(
      "Nastav proměnné prostředí ADMIN_EMAIL a ADMIN_PASSWORD (min. 12 znaků). Výchozí heslo záměrně neexistuje."
    );
  }

  await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
    update: { role: "ADMIN", emailVerifiedAt: new Date() },
  });
  console.log(`Admin účet připraven: ${email}`);

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  if (!(await prisma.week.findFirst())) {
    await prisma.week.create({ data: { number: 1, status: "PENDING" } });
    console.log("Týden #1 vytvořen (spustíš ho v /admin/week).");
  }

  if ((await prisma.challenge.count()) === 0) {
    await prisma.challenge.createMany({
      data: [
        { title: "Hole-in-one ve virtuálním golfu", description: "Dej hole-in-one na jakékoliv mapě v golfové hře. Pošli klip celé rány.", category: Category.GAME, difficulty: Difficulty.HARD, points: 50 },
        { title: "GTA mise bez jediného umření", description: "Projdi libovolnou hlavní misi v GTA bez umření a bez restartu.", category: Category.GAME, difficulty: Difficulty.MEDIUM, points: 30 },
        { title: "Oslov 5 cizích lidí", description: "Začni rozhovor s pěti neznámými lidmi během jednoho dne. Vše natoč.", category: Category.IRL, difficulty: Difficulty.MEDIUM, points: 35 },
        { title: "Zazpívej na veřejnosti", description: "Zazpívej nahlas celou známou písničku na veřejném místě.", category: Category.IRL, difficulty: Difficulty.EASY, points: 15 },
        { title: "Dohraj hru pod hodinu", description: "Dohraj kampaň libovolné hry pod 60 minut. V záznamu musí být vidět čas.", category: Category.GAME, difficulty: Difficulty.INSANE, points: 80 },
      ],
    });
    console.log("Ukázkové výzvy vytvořeny.");
  }
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
