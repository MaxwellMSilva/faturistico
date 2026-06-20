import type { RoleUsuario } from "@prisma/client";
import type { DefaultSession } from "next-auth";

export {};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleUsuario;
    } & DefaultSession["user"];
  }

  interface User {
    role: RoleUsuario;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleUsuario;
  }
}
