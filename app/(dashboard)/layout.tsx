import { redirect } from "next/navigation";

import { getServerSession }
  from "next-auth";

import { authOptions }
  from "@/lib/auth";

import { prisma }
  from "@/lib/prisma";

import { Sidebar }
  from "@/components/layout/sidebar";

import { Header }
  from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const empresa =
    await prisma.empresa.findFirst({
      where: {
        usuarioId:
          session.user.id,
      },
    });

  if (!empresa) {
    redirect("/empresas/nova");
  }

  return (
    <div className="flex h-screen">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Header />

        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  );
}