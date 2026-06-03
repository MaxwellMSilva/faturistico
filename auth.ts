import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } =
  NextAuth({
    providers: [
      Credentials({
        credentials: {
          email: {},
          senha: {},
        },

        async authorize(credentials) {
          return null;
        },
      }),
    ],

    session: {
      strategy: "jwt",
    },
  });