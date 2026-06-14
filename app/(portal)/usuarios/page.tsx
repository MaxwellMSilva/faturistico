import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

const recursos = [
  {
    titulo: "Cadastro de usuários",
    descricao:
      "Crie contas para colaboradores que utilizarão a plataforma.",
    icone: UserPlus,
  },
  {
    titulo: "Acesso por empresa",
    descricao:
      "Defina quais empresas cada usuário poderá acessar.",
    icone: Building2,
  },
  {
    titulo: "Níveis de permissão",
    descricao:
      "Controle as permissões de proprietário, administrador e operador.",
    icone: ShieldCheck,
  },
];

export default function UsuariosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Cabeçalho */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/painel"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Usuários
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Gerencie os usuários da
                plataforma e controle o acesso
                deles às empresas cadastradas.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Funcionalidade em desenvolvimento"
          className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground opacity-50"
        >
          <UserPlus size={17} />
          Novo usuário
        </button>
      </div>

      {/* Resumo */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Usuários cadastrados
              </p>

              <p className="mt-1 text-3xl font-bold">
                —
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Acessos ativos
              </p>

              <p className="mt-1 text-3xl font-bold">
                —
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Estado atual */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users size={30} />
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            Gestão de usuários em desenvolvimento
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Esta área permitirá cadastrar
            colaboradores, vincular usuários
            às empresas e definir níveis de
            permissão para cada acesso.
          </p>

          <div className="mt-6 rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Por enquanto, somente o usuário
            proprietário da conta pode acessar
            a plataforma.
          </div>
        </div>
      </section>

      {/* Recursos planejados */}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Recursos planejados
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Funcionalidades previstas para este módulo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {recursos.map((recurso) => {
            const Icone =
              recurso.icone;

            return (
              <div
                key={recurso.titulo}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icone size={21} />
                </div>

                <h3 className="mt-4 font-semibold">
                  {recurso.titulo}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {recurso.descricao}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}