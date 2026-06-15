import {
  redirect,
} from "next/navigation";

import {
  getServerSession,
} from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { PortalHeader } from "@/components/portal/portal-header";

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
    <div className="min-h-screen bg-muted/20">
      <PortalHeader
        nome={usuario.nome}
        role={usuario.role}
      />

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}