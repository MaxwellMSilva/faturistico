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

  const owner =
    usuarioAtual.role === "OWNER";

  let empresasRaw: EmpresaLista[];

  /*
   * O OWNER global visualiza todas as
   * empresas, inclusive as inativas.
   */

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
        },

        orderBy: {
          razaoSocial: "asc",
        },
      });

    empresasRaw =
      empresas.map(
        (empresa) => ({
          ...empresa,
          permissao: "OWNER",
        })
      );
  } else {
    /*
     * ADMIN e usuários comuns visualizam
     * somente empresas ativas com vínculo
     * também ativo.
     */

    const acessos =
      await prisma.usuarioEmpresa.findMany({
        where: {
          usuarioId:
            usuarioAtual.id,

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
            },
          },
        },

        orderBy: {
          empresa: {
            razaoSocial: "asc",
          },
        },
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

  const termo =
    busca
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
      (empresa) =>
        empresa.ativo
    ).length;

  const totalInativas =
    empresasRaw.length -
    totalAtivas;

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
      usuarioAtual.role ===
        "ADMIN" &&
      empresa.permissao ===
        "ADMIN"
    );
  }

  function podeEntrarEmpresa(
    empresa: EmpresaLista
  ) {
    return (
      empresa.ativo ||
      owner
    );
  }

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
                {owner
                  ? "Cadastre, ative, inative e acesse as empresas da plataforma."
                  : "Escolha uma empresa ativa vinculada à sua conta."}
              </p>
            </div>
          </div>
        </div>

        {owner && (
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
        )}
      </div>

      {/* Indicadores */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Indicador
          titulo="Empresas disponíveis"
          valor={empresasRaw.length}
          icon={Building2}
        />

        <Indicador
          titulo="Empresas ativas"
          valor={totalAtivas}
          icon={CircleCheck}
          variante="sucesso"
        />

        <Indicador
          titulo="Empresas inativas"
          valor={totalInativas}
          icon={CircleX}
          variante="erro"
        />
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

        {busca && (
          <p className="mt-3 text-xs text-muted-foreground">
            {empresas.length === 1
              ? "1 empresa encontrada."
              : `${empresas.length} empresas encontradas.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {empresas.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              {busca
                ? "Nenhuma empresa encontrada"
                : owner
                  ? "Nenhuma empresa cadastrada"
                  : "Nenhuma empresa disponível"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos empresas correspondentes aos termos informados."
                : owner
                  ? "Cadastre sua primeira empresa para começar a utilizar o sistema."
                  : "Sua conta não possui acesso a nenhuma empresa ativa."}
            </p>

            {busca && (
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
            )}

            {!busca && owner && (
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
          {/* Cards mobile */}

          <div className="grid gap-4 md:hidden">
            {empresas.map(
              (empresa) => {
                const podeEditar =
                  podeEditarEmpresa(
                    empresa
                  );

                const podeEntrar =
                  podeEntrarEmpresa(
                    empresa
                  );

                return (
                  <article
                    key={empresa.id}
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

                      <StatusEmpresa
                        ativo={
                          empresa.ativo
                        }
                      />
                    </div>

                    <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                      <LinhaInformacao
                        titulo="CNPJ"
                        valor={formatarCnpj(
                          empresa.cnpj
                        )}
                      />

                      <LinhaInformacao
                        titulo="Município"
                        valor={
                          empresa.municipio
                            ? `${empresa.municipio}${
                                empresa.uf
                                  ? ` - ${empresa.uf}`
                                  : ""
                              }`
                            : "Não informado"
                        }
                      />

                      <LinhaInformacao
                        titulo="Permissão"
                        valor={
                          permissoes[
                            empresa
                              .permissao
                          ] ??
                          empresa.permissao
                        }
                      />
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

                      {owner && (
                        <EmpresaStatusButton
                          empresaId={
                            empresa.id
                          }
                          empresaNome={
                            empresa.nomeFantasia ??
                            empresa.razaoSocial
                          }
                          ativo={
                            empresa.ativo
                          }
                        />
                      )}

                      {podeEntrar ? (
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={`/empresa/${empresa.id}/dashboard`}
                            />
                          }
                          className="h-11 w-full"
                        >
                          {empresa.ativo ? (
                            <LogIn
                              size={17}
                            />
                          ) : (
                            <Eye
                              size={17}
                            />
                          )}

                          {empresa.ativo
                            ? "Entrar na empresa"
                            : "Visualizar empresa"}
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

          {/* Tabela desktop */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
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
                  {empresas.map(
                    (empresa) => {
                      const podeEditar =
                        podeEditarEmpresa(
                          empresa
                        );

                      const podeEntrar =
                        podeEntrarEmpresa(
                          empresa
                        );

                      return (
                        <tr
                          key={empresa.id}
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

                              {permissoes[
                                empresa
                                  .permissao
                              ] ??
                                empresa.permissao}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusEmpresa
                              ativo={
                                empresa.ativo
                              }
                            />
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

                              {owner && (
                                <EmpresaStatusButton
                                  empresaId={
                                    empresa.id
                                  }
                                  empresaNome={
                                    empresa.nomeFantasia ??
                                    empresa.razaoSocial
                                  }
                                  ativo={
                                    empresa.ativo
                                  }
                                />
                              )}

                              {podeEntrar ? (
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
                                  {empresa.ativo ? (
                                    <LogIn
                                      size={16}
                                    />
                                  ) : (
                                    <Eye
                                      size={16}
                                    />
                                  )}

                                  {empresa.ativo
                                    ? "Entrar"
                                    : "Visualizar"}
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

type IndicadorProps = {
  titulo: string;
  valor: number;

  icon: typeof Building2;

  variante?:
    | "padrao"
    | "sucesso"
    | "erro";
};

function Indicador({
  titulo,
  valor,
  icon: Icone,
  variante = "padrao",
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "erro"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {titulo}
          </p>

          <p className="mt-1 text-3xl font-bold">
            {valor}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${classeIcone}`}
        >
          <Icone size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusEmpresa({
  ativo,
}: {
  ativo: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        ativo
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive",
      ].join(" ")}
    >
      {ativo
        ? "Ativa"
        : "Inativa"}
    </span>
  );
}

function LinhaInformacao({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">
        {titulo}
      </dt>

      <dd className="text-right font-medium">
        {valor}
      </dd>
    </div>
  );
}