import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const staff = await prisma.staffUser.findUnique({
          where: { username: credentials.username },
          include: { kelompok: true },
        });
        if (!staff) return null;

        const valid = await bcrypt.compare(credentials.password, staff.passwordHash);
        if (!valid) return null;

        return {
          id: staff.id,
          name: staff.name,
          username: staff.username,
          role: staff.role,
          kelompokId: staff.kelompokId,
          kelompokName: staff.kelompok?.name ?? null,
          kelompokSlug: staff.kelompok?.slug ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role = u.role;
        token.kelompokId = u.kelompokId;
        token.kelompokName = u.kelompokName;
        token.kelompokSlug = u.kelompokSlug;
        token.username = u.username;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).kelompokId = token.kelompokId;
      (session.user as any).kelompokName = token.kelompokName;
      (session.user as any).kelompokSlug = token.kelompokSlug;
      (session.user as any).username = token.username;
      return session;
    },
  },
};
