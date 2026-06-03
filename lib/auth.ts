import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {},
        senha: {},
      },

        async authorize(credentials) {
        console.log("=== LOGIN ===");

        console.log(credentials);

        const usuario =
            await prisma.usuario.findUnique({
            where: {
                email:
                credentials?.email as string,
            },
            });

        console.log("USUARIO");

        console.log(usuario);

        if (!usuario) {
            console.log(
            "USUARIO NAO ENCONTRADO"
            );

            return null;
        }

        const senhaValida =
            await compare(
            credentials?.senha as string,
            usuario.senhaHash
            );

        console.log(
            "SENHA VALIDA:",
            senhaValida
        );

        if (!senhaValida) {
            return null;
        }

        return {
            id: usuario.id,
            name: usuario.nome,
            email: usuario.email,
        };
        }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        (session.user as any).id =
          token.id;
      }

      return session;
    },
  },
};