"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { randomToken, sha256 } from "@/lib/crypto";
import { getIp } from "@/lib/ip";
import { baseUrl, sendMail, verificationMail } from "@/lib/mail";
import { EMAIL_RE, NAME_RE } from "@/lib/validate";

export type Result = { ok: true } | { ok: false; error: string };

const TTL = 24 * 60 * 60 * 1000;

async function sendVerification(userId: string, email: string, name: string) {
  await prisma.emailToken.deleteMany({ where: { userId } });
  const raw = randomToken();
  await prisma.emailToken.create({
    data: { userId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + TTL) },
  });
  await sendMail({
    to: email,
    subject: "Potvrď svůj e-mail",
    html: verificationMail(name, `${baseUrl()}/verify?token=${raw}`),
  });
}

export async function registerUser(fd: FormData): Promise<Result> {
  // Past na roboty: lidé toto skryté pole nevidí.
  if (String(fd.get("website") || "") !== "") return { ok: true };

  if (!(await rateLimit(`reg:${sha256(getIp())}`, 5, 60 * 60_000))) {
    return { ok: false, error: "Příliš mnoho pokusů. Zkus to za hodinu." };
  }

  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");

  if (!NAME_RE.test(name)) return { ok: false, error: "Přezdívka má mít 2 až 24 znaků (písmena, čísla, mezera, _ . -)." };
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Zadej platný e-mail." };
  if (password.length < 10) return { ok: false, error: "Heslo musí mít aspoň 10 znaků." };
  if (password.length > 72) return { ok: false, error: "Heslo může mít nejvýš 72 znaků." };

  // Stejná odpověď, ať účet existuje nebo ne, aby se nedaly zjišťovat cizí e-maily.
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { ok: true };

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    });
    await sendVerification(user.id, user.email, user.name);
  } catch {
    return { ok: false, error: "Registrace se nepovedla. Zkus to znovu." };
  }
  return { ok: true };
}

export async function resendVerification(fd: FormData): Promise<Result> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: true };

  const okIp = await rateLimit(`resend:ip:${sha256(getIp())}`, 5, 60 * 60_000);
  const okMail = await rateLimit(`resend:em:${sha256(email)}`, 3, 60 * 60_000);
  if (!okIp || !okMail) return { ok: false, error: "Příliš mnoho požadavků. Zkus to později." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt) await sendVerification(user.id, user.email, user.name);
  return { ok: true };
}

/** Potvrzení běží jako POST akce po kliknutí na tlačítko, takže ho nespotřebuje antivir ani náhled odkazu. */
export async function confirmEmail(token: string): Promise<Result> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { ok: false, error: "Odkaz není platný." };
  const rec = await prisma.emailToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!rec) return { ok: false, error: "Odkaz je neplatný nebo už byl použit." };
  if (rec.expiresAt.getTime() < Date.now()) {
    await prisma.emailToken.delete({ where: { id: rec.id } });
    return { ok: false, error: "Odkaz vypršel. Na přihlášení si vyžádej nový." };
  }
  await prisma.user.update({ where: { id: rec.userId }, data: { emailVerifiedAt: new Date() } });
  await prisma.emailToken.deleteMany({ where: { userId: rec.userId } });
  return { ok: true };
}
