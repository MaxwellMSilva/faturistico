import Link from "next/link";

import {
  ArrowRight,
  Building2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const opcoes = [
  {
    titulo: "Empresas",

    descricao:
      "Consulte as empresas disponíveis e escolha o ambiente em que deseja trabalhar.",

    href: "/empresas",

    icone: Building2,

    acao: "Gerenciar empresas",

    restrita: false,
  },

  {
    titulo: "Usuários",

    descricao:
      "Cadastre usuários e controle quais empresas cada pessoa poderá acessar.",

    href: "/usuarios",

    icone: Users,

    acao: "Gerenciar usuários",

    restrita: true,
  },
];

export default async function PainelPage() {
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

  const podeGerenciarUsuarios =
    usuario.role === "OWNER" ||
    usuario.role === "ADMIN";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Apresentação */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText size={24} />
              </div>

              <p className="text-sm font-medium text-primary">
                Faturístico
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Painel geral
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {podeGerenciarUsuarios
                  ? "Gerencie suas empresas e organize os usuários que terão acesso à plataforma."
                  : "Consulte as empresas vinculadas à sua conta e acesse o ambiente de trabalho."}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Ambiente protegido
                </p>

                <p className="text-xs text-muted-foreground">
                  Acesso separado por empresa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acesso rápido */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Acesso rápido
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Selecione uma opção para continuar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {opcoes.map((opcao) => {
            const Icone =
              opcao.icone;

            const bloqueada =
              opcao.restrita &&
              !podeGerenciarUsuarios;

            if (bloqueada) {
              return (
                <div
                  key={opcao.href}
                  aria-disabled="true"
                  title="Você não possui permissão para gerenciar usuários"
                  className="relative cursor-not-allowed overflow-hidden rounded-2xl border bg-card p-6 opacity-50 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icone size={24} />
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground">
                      <LockKeyhole
                        size={17}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {opcao.titulo}
                      </h3>

                      <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Sem acesso
                      </span>
                    </div>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                      {opcao.descricao}
                    </p>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <LockKeyhole
                        size={15}
                      />

                      Acesso restrito
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={opcao.href}
                href={opcao.href}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icone size={24} />
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all group-hover:translate-x-1 group-hover:border-primary/30 group-hover:text-primary">
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {opcao.titulo}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                    {opcao.descricao}
                  </p>
                </div>

                <div className="mt-6 border-t pt-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    {opcao.acao}

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Orientação */}

      <section className="rounded-2xl border bg-muted/20 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Como começar
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Escolha uma empresa disponível
              e acesse o ambiente dela para
              gerenciar clientes, produtos,
              configurações fiscais e notas,
              conforme suas permissões.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}