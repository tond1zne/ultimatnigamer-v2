import type { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { sha256 } from "@/lib/crypto";

let dummy: Promise<string> | null = null;
// Při neexistujícím účtu se porovnává s falešným hashem, aby odpověď trvala stejně dlouho.
const dummyHash = () => (dummy ??= bcrypt.hash("nepouzivane-heslo", 12));

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Přihlášení",
      credentials: { email: {}, password: {} },
      async authorize(credentials, req) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password || email.length > 254 || password.length > 200) return null;

        const fwd = (req?.headers as Record<string, string | string[] | undefined> | undefined)?.["x-forwarded-for"];
        const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || "unknown";
        const okIp = await rateLimit(`login:ip:${sha256(ip)}`, 30, 15 * 60_000);
        const okEmail = await rateLimit(`login:em:${sha256(email)}`, 10, 15 * 60_000);
        if (!okIp || !okEmail) throw new Error("RATE_LIMIT");

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash()));
        if (!user || !valid) return null;
        if (!user.emailVerifiedAt) throw new Error("UNVERIFIED");

        return { id: user.id, name: user.name, email: user.email, role: user.role } as unknown as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};
