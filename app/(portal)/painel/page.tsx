import Link from "next/link";

import {
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";

export default function PainelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Painel Geral
        </h1>

        <p className="mt-1 text-muted-foreground">
          Gerencie suas empresas e os usuários da plataforma.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/empresas"
          className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={24} />
            </div>

            <ArrowRight
              size={20}
              className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground"
            />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">
              Empresas
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre empresas e escolha em qual ambiente deseja trabalhar.
            </p>
          </div>
        </Link>

        <Link
          href="/usuarios"
          className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>

            <ArrowRight
              size={20}
              className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground"
            />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">
              Usuários
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre usuários e controle o acesso deles às empresas.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}