import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CircleCheck,
  CircleX,
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic =
  "force-dynamic";

type Props = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

const permissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  FATURAMENTO: "Faturamento",
  OPERADOR: "Operador",
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

  const acessosRaw =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId:
          session.user.id,

        ativo: true,
      },

      include: {
        empresa: true,
      },

      orderBy: {
        empresa: {
          razaoSocial: "asc",
        },
      },
    });

  const termo =
    busca
      .trim()
      .toLowerCase();

  const acessos = termo
    ? acessosRaw.filter(
        (acesso) => {
          const empresa =
            acesso.empresa;

          return [
            empresa.razaoSocial,
            empresa.nomeFantasia,
            empresa.cnpj,
            empresa.municipio,
            empresa.uf,
          ].some((valor) =>
            valor
              ?.toLowerCase()
              .includes(termo)
          );
        }
      )
    : acessosRaw;

  const totalAtivas =
    acessosRaw.filter(
      (acesso) =>
        acesso.empresa.ativo
    ).length;

  const totalInativas =
    acessosRaw.length -
    totalAtivas;

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
              <Building2 size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Empresas
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Cadastre empresas e escolha
                o ambiente em que deseja
                trabalhar.
              </p>
            </div>
          </div>
        </div>

        <Button
          nativeButton={false}
          render={
            <Link href="/empresas/nova" />
          }
          className="h-11"
        >
          <Plus size={17} />

          Nova empresa
        </Button>
      </div>

      {/* Indicadores */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Empresas disponíveis
              </p>

              <p className="mt-1 text-3xl font-bold">
                {acessosRaw.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Empresas ativas
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalAtivas}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CircleCheck size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Empresas inativas
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalInativas}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <CircleX size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              name="busca"
              defaultValue={busca}
              className="h-11 pl-10"
              placeholder="Buscar por razão social, nome fantasia, CNPJ ou município..."
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11"
          >
            <Search size={17} />

            Buscar
          </Button>

          {busca && (
            <Button
              nativeButton={false}
              render={
                <Link href="/empresas" />
              }
              variant="ghost"
              className="h-11"
            >
              Limpar
            </Button>
          )}
        </form>
      </section>

      {/* Estado vazio */}

      {acessos.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {busca
                ? "Nenhuma empresa encontrada"
                : "Nenhuma empresa cadastrada"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos empresas correspondentes aos termos informados."
                : "Cadastre sua primeira empresa para começar a utilizar o sistema."}
            </p>

            {busca ? (
              <Button
                nativeButton={false}
                render={
                  <Link href="/empresas" />
                }
                variant="outline"
                className="mt-6 h-11"
              >
                Limpar busca
              </Button>
            ) : (
              <Button
                nativeButton={false}
                render={
                  <Link href="/empresas/nova" />
                }
                className="mt-6 h-11"
              >
                <Plus size={17} />

                Cadastrar primeira empresa
              </Button>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Cards para celular */}

          <div className="grid gap-4 md:hidden">
            {acessos.map(
              (acesso) => {
                const empresa =
                  acesso.empresa;

                const permissao =
                  permissoes[
                    acesso.permissao
                  ] ??
                  acesso.permissao;

                const podeEditar =
                  acesso.permissao ===
                  "OWNER";

                return (
                  <article
                    key={acesso.id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Building2
                            size={21}
                          />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">
                            {
                              empresa.razaoSocial
                            }
                          </h2>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {empresa.nomeFantasia ||
                              "Sem nome fantasia"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                          empresa.ativo
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive",
                        ].join(" ")}
                      >
                        {empresa.ativo
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          CNPJ
                        </dt>

                        <dd className="text-right font-medium">
                          {formatarCnpj(
                            empresa.cnpj
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          Município
                        </dt>

                        <dd className="text-right font-medium">
                          {empresa.municipio
                            ? `${empresa.municipio}${
                                empresa.uf
                                  ? ` - ${empresa.uf}`
                                  : ""
                              }`
                            : "Não informado"}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          Permissão
                        </dt>

                        <dd className="inline-flex items-center gap-1.5 text-right font-medium">
                          <ShieldCheck
                            size={15}
                            className="text-primary"
                          />

                          {permissao}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 grid gap-2">
                      {podeEditar && (
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={`/empresas/${empresa.id}/editar`}
                            />
                          }
                          variant="outline"
                          className="h-11 w-full"
                        >
                          <Pencil size={17} />

                          Editar empresa
                        </Button>
                      )}

                      {empresa.ativo ? (
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={`/empresa/${empresa.id}/dashboard`}
                            />
                          }
                          className="h-11 w-full"
                        >
                          <LogIn size={17} />

                          Entrar na empresa
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="h-11 w-full"
                          disabled
                        >
                          Empresa inativa
                        </Button>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Empresa
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CNPJ
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Município
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Permissão
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {acessos.map(
                    (acesso) => {
                      const empresa =
                        acesso.empresa;

                      const permissao =
                        permissoes[
                          acesso.permissao
                        ] ??
                        acesso.permissao;

                      const podeEditar =
                        acesso.permissao ===
                        "OWNER";

                      return (
                        <tr
                          key={
                            acesso.id
                          }
                          className="border-t transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Building2
                                  size={19}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-72 truncate font-medium">
                                  {
                                    empresa.razaoSocial
                                  }
                                </p>

                                <p className="max-w-72 truncate text-sm text-muted-foreground">
                                  {empresa.nomeFantasia ||
                                    "Sem nome fantasia"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatarCnpj(
                              empresa.cnpj
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {empresa.municipio
                              ? `${empresa.municipio}${
                                  empresa.uf
                                    ? ` - ${empresa.uf}`
                                    : ""
                                }`
                              : "Não informado"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-sm">
                              <ShieldCheck
                                size={16}
                                className="text-primary"
                              />

                              {permissao}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                                empresa.ativo
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-destructive/10 text-destructive",
                              ].join(
                                " "
                              )}
                            >
                              {empresa.ativo
                                ? "Ativa"
                                : "Inativa"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {podeEditar && (
                                <Button
                                  nativeButton={
                                    false
                                  }
                                  render={
                                    <Link
                                      href={`/empresas/${empresa.id}/editar`}
                                    />
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  <Pencil
                                    size={16}
                                  />

                                  Editar
                                </Button>
                              )}

                              {empresa.ativo ? (
                                <Button
                                  nativeButton={
                                    false
                                  }
                                  render={
                                    <Link
                                      href={`/empresa/${empresa.id}/dashboard`}
                                    />
                                  }
                                  size="sm"
                                >
                                  <LogIn
                                    size={16}
                                  />

                                  Entrar
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled
                                >
                                  Inativa
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}