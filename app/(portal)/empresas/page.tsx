import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CircleCheck,
  CircleX,
  Eye,
  LogIn,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { EmpresaStatusButton } from "@/components/empresa/empresa-status-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic =
  "force-dynamic";

type Props = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

type EmpresaLista = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string | null;

  cnpj: string;

  municipio: string | null;
  uf: string | null;

  ativo: boolean;

  permissao: string;
};

const permissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  VISUALIZADOR: "Visualizador",
};

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

export default async function EmpresasPage({
  searchParams,
}: Props) {
  const { busca = "" } =
    await searchParams;

  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const usuarioAtual =
    await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },

      select: {
        id: true,
        role: true,
        ativo: true,
      },
    });

  if (
    !usuarioAtual ||
    !usuarioAtual.ativo
  ) {
    redirect("/entrar");
  }

  const usuarioId = usuarioAtual.id;
  const usuarioRole = usuarioAtual.role;
  const owner = usuarioRole === "OWNER";

  let empresasRaw: EmpresaLista[];

  if (owner) {
    const empresas =
      await prisma.empresa.findMany({
        select: {
          id: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpj: true,
          municipio: true,
          uf: true,
          ativo: true,
          createdAt: true,
        },

        orderBy: [
          {
            createdAt: "desc",
          },
          {
            razaoSocial: "asc",
          },
        ],
      });

    empresasRaw =
      empresas.map(
        (empresa) => ({
          ...empresa,
          permissao: "OWNER",
        })
      );
  } else {
    const acessos =
      await prisma.usuarioEmpresa.findMany({
        where: {
          usuarioId,
          ativo: true,

          empresa: {
            ativo: true,
          },
        },

        select: {
          permissao: true,

          empresa: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              municipio: true,
              uf: true,
              ativo: true,
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
      });

    empresasRaw =
      acessos.map(
        (acesso) => ({
          ...acesso.empresa,
          permissao:
            acesso.permissao,
        })
      );
  }

  const termo = busca
    .trim()
    .toLowerCase();

  const empresas = termo
    ? empresasRaw.filter(
        (empresa) =>
          [
            empresa.razaoSocial,
            empresa.nomeFantasia,
            empresa.cnpj,
            empresa.municipio,
            empresa.uf,
          ].some((valor) =>
            valor
              ?.toLowerCase()
              .includes(termo)
          )
      )
    : empresasRaw;

  const totalAtivas =
    empresasRaw.filter(
      (empresa) => empresa.ativo
    ).length;

  const totalInativas =
    empresasRaw.length - totalAtivas;

  function podeEditarEmpresa(
    empresa: EmpresaLista
  ) {
    if (!empresa.ativo) {
      return false;
    }

    if (owner) {
      return true;
    }

    return (
      usuarioRole === "ADMIN" &&
      empresa.permissao === "ADMIN"
    );
  }

  function podeEntrarEmpresa(
    empresa: EmpresaLista
  ) {
    return empresa.ativo || owner;
  }

  return (
    <div className="w-full space-y-8">
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
              <Building2 size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Empresas
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {owner
                  ? "Cadastre, ative, inative e acesse as empresas da plataforma."
                  : "Acesse e gerencie as empresas vinculadas ao seu usuário."}
              </p>
            </div>
          </div>
        </div>

        {owner && (
          <Button
            className="h-11"
            render={
              <Link href="/empresas/nova" />
            }
          >
            <Plus size={17} />
            Nova empresa
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="dashboard-stat p-5">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-bold">{empresasRaw.length}</p>
        </div>

        <div className="dashboard-stat p-5">
          <p className="text-sm text-muted-foreground">Ativas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{totalAtivas}</p>
        </div>

        <div className="dashboard-stat p-5">
          <p className="text-sm text-muted-foreground">Inativas</p>
          <p className="mt-2 text-2xl font-bold text-muted-foreground">{totalInativas}</p>
        </div>
      </section>

      <form className="dashboard-card p-4 sm:p-5">
        <div className="relative max-w-xl">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por razão social, fantasia, CNPJ, município ou UF"
            className="h-11 pl-10"
          />
        </div>
      </form>

      {empresas.length === 0 ? (
        <section className="dashboard-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <Building2 size={28} className="text-muted-foreground" />
          <p className="mt-4 font-medium">Nenhuma empresa encontrada</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revise os filtros ou cadastre uma nova empresa.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {empresas.map((empresa) => {
            const podeEditar = podeEditarEmpresa(empresa);
            const podeEntrar = podeEntrarEmpresa(empresa);

            return (
              <article key={empresa.id} className="dashboard-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold">
                        {empresa.nomeFantasia?.trim() || empresa.razaoSocial}
                      </h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${empresa.ativo ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {empresa.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {empresa.razaoSocial}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 size={20} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">CNPJ</p>
                    <p className="mt-1 font-medium">{formatarCnpj(empresa.cnpj)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="mt-1 font-medium">{[empresa.municipio, empresa.uf].filter(Boolean).join(" · ") || "Não informada"}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                  <span className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck size={14} />
                    {permissoes[empresa.permissao] ?? empresa.permissao}
                  </span>

                  {podeEntrar && (
                    <Button size="sm" variant="outline" render={<Link href={`/empresa/${empresa.id}/dashboard`} />}>
                      {empresa.ativo ? <LogIn size={15} /> : <Eye size={15} />}
                      {empresa.ativo ? "Entrar" : "Visualizar"}
                    </Button>
                  )}

                  {podeEditar && (
                    <Button size="sm" variant="outline" render={<Link href={`/empresas/${empresa.id}/editar`} />}>
                      <Pencil size={15} />
                      Editar
                    </Button>
                  )}

                  {owner && (
                    <EmpresaStatusButton
                      empresaId={empresa.id}
                      empresaNome={empresa.nomeFantasia?.trim() || empresa.razaoSocial}
                      ativo={empresa.ativo}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="hidden">
        <CircleCheck />
        <CircleX />
      </div>
    </div>
  );
}
