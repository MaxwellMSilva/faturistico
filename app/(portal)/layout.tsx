import {
  redirect,
} from "next/navigation";

import {
  getServerSession,
} from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { PortalHeader } from "@/components/portal/portal-header";
import { PortalSidebar } from "@/components/portal/portal-sidebar";

export const dynamic =
  "force-dynamic";

type Props = {
  children: React.ReactNode;
};

export default async function PortalLayout({
  children,
}: Props) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },

      select: {
        nome: true,
        role: true,
        ativo: true,
      },
    });

  if (
    !usuario ||
    !usuario.ativo
  ) {
    redirect("/entrar");
  }

  return (
    <div className="empresa-shell flex h-screen overflow-hidden">
      <PortalSidebar
        usuarioNome={usuario.nome}
        usuarioEmail={
          session.user.email ??
          undefined
        }
        role={usuario.role}
      />

      <div className="empresa-main flex min-w-0 flex-1 flex-col">
        <PortalHeader
          usuarioNome={usuario.nome}
          usuarioEmail={
            session.user.email ??
            undefined
          }
          role={usuario.role}
        />

        <main className="w-full flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
