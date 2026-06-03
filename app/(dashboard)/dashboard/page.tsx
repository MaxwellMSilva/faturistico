import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { StatCard } from "@/components/dashboard/stat-card";

export default async function DashboardPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Bem-vindo, {session.user.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="NF-e Emitidas"
          value="0"
        />

        <StatCard
          title="Clientes"
          value="0"
        />

        <StatCard
          title="Produtos"
          value="0"
        />

        <StatCard
          title="Faturamento"
          value="R$ 0,00"
        />

      </div>

    </div>
  );
}