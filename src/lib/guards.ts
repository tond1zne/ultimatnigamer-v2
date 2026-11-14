import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getSession = () => getServerSession(authOptions);

export async function requireUser() {
  const s = await getSession();
  if (!s?.user) redirect("/login");
  return s.user;
}

/** Role se vždy ověřuje znovu v databázi, ne jen z tokenu. Odebraný admin tak přijde o přístup hned. */
async function isAdminInDb(id: string) {
  const u = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  return u?.role === "ADMIN";
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdminInDb(user.id))) redirect("/");
  return user;
}

export async function assertAdmin() {
  const s = await getSession();
  if (!s?.user || !(await isAdminInDb(s.user.id))) throw new Error("Forbidden");
  return s.user;
}
