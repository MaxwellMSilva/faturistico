import { compare } from "bcryptjs";

import type {
  NextAuthOptions,
} from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",

      credentials: {
        email: {
          label: "E-mail",
          type: "email",
        },

        senha: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          credentials?.email
            ?.trim()
            .toLowerCase();

        const senha =
          credentials?.senha;

        if (!email || !senha) {
          throw new Error(
            "CREDENCIAIS_INVALIDAS"
          );
        }

        const usuario =
          await prisma.usuario.findUnique({
            where: {
              email,
            },

            select: {
              id: true,
              nome: true,
              email: true,
              senhaHash: true,
              role: true,
              ativo: true,
            },
          });

        if (!usuario) {
          throw new Error(
            "CREDENCIAIS_INVALIDAS"
          );
        }

        const senhaCorreta =
          await compare(
            senha,
            usuario.senhaHash
          );

        if (!senhaCorreta) {
          throw new Error(
            "CREDENCIAIS_INVALIDAS"
          );
        }

        if (!usuario.ativo) {
          throw new Error(
            "USUARIO_INATIVO"
          );
        }

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/entrar",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          String(token.id);

        session.user.role =
          token.role;
      }

      return session;
    },
  },

  secret:
    process.env.NEXTAUTH_SECRET,
};