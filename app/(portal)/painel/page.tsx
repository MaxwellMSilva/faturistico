import Link from "next/link";

import {
  ArrowRight,
  Building2,
  Plus,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";

export const dynamic =
  "force-dynamic";

function formatarCnpj(
  cnpj: string
) {
  const numeros =
    cnpj.replace(/\D/g, "");

  if (numeros.length !== 14) {
    return cnpj;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function obterSaudacao() {
  const hora =
    new Date().getHours();

  if (hora < 12) {
    return "Bom dia";
  }

  if (hora < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

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

  const podeGerenciarUsuarios =
    usuario.role === "OWNER" ||
    usuario.role === "ADMIN";

  const vinculosEmpresas =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId:
          session.user.id,

        ativo: true,

        empresa: {
          ativo: true,
        },
      },

      select: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
            municipio: true,
            uf: true,
            createdAt: true,
          },
        },
      },

      orderBy: [
        {
          empresa: {
            createdAt: "desc",
          },
        },
        {
          empresa: {
            razaoSocial: "asc",
          },
        },
      ],

      take: 6,
    });

  const empresas =
    vinculosEmpresas.map(
      (vinculo) =>
        vinculo.empresa
    );

  const primeiroNome =
    usuario.nome
      .trim()
      .split(" ")[0] ||
    "Usuário";

  return (
    <div className="space-y-6">
      <section className="dashboard-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          {obterSaudacao()},{" "}
          {primeiroNome}
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          Escolha um ambiente para
          começar
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acesse diretamente o dashboard
          de uma empresa ou abra a lista
          completa para gerenciar
          cadastros.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            className="h-10"
            render={
              <Link href="/empresas" />
            }
          >
            <Building2 size={16} />

            Ver empresas
          </Button>

          {podeGerenciarUsuarios && (
            <Button
              variant="outline"
              className="h-10"
              render={
                <Link href="/empresas/nova" />
              }
            >
              <Plus size={16} />

              Nova empresa
            </Button>
          )}
        </div>
      </section>

      {empresas.length === 0 ? (
        <section className="dashboard-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Building2 size={22} />
          </div>

          <p className="font-medium">
            Nenhuma empresa vinculada
          </p>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {podeGerenciarUsuarios
              ? "Cadastre a primeira empresa para começar a operar no sistema."
              : "Solicite ao administrador o acesso a uma empresa."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {empresas.map((empresa) => {
            const nomeExibicao =
              empresa.nomeFantasia?.trim() ||
              empresa.razaoSocial;

            const local =
              [
                empresa.municipio,
                empresa.uf,
              ]
                .filter(Boolean)
                .join(" · ");

            return (
              <Link
                key={empresa.id}
                href={`/empresa/${empresa.id}/dashboard`}
                className="group dashboard-stat p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Building2 size={22} />
                </div>

                <h3 className="mt-4 line-clamp-2 font-semibold tracking-tight">
                  {nomeExibicao}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatarCnpj(
                    empresa.cnpj
                  )}
                </p>

                {local && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {local}
                  </p>
                )}

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Abrir ambiente

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
