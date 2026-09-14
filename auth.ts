import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordIsValid = await argon2.verify(
          user.passwordHash,
          credentials.password,
        );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            organizationId: true,
            role: true,
          },
        });

        if (dbUser) {
          token.organizationId = dbUser.organizationId;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (
        session.user &&
        typeof token.sub === "string" &&
        typeof token.organizationId === "string" &&
        (token.role === "OWNER" ||
          token.role === "ADMIN" ||
          token.role === "STAFF")
      ) {
        session.user.id = token.sub;
        session.user.organizationId = token.organizationId;
        session.user.role = token.role;
      }

      return session;
    },
  },
});
