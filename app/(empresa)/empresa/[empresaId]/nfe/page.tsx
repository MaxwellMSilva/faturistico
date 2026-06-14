import Link from "next/link";

import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Clock3,
  FileSearch,
  FileText,
  Search,
  type LucideIcon,
} from "lucide-react";

import { getNotasFiscais } from "@/actions/nfe/get-notas-fiscais";
import { getDadosNovaNfe } from "@/actions/nfe/get-dados-nova-nfe";

import { NovaNfeDialog } from "@/components/nfe/nova-nfe-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
  }>;
};

const statusLabel: Record<
  string,
  string
> = {
  RASCUNHO: "Rascunho",
  VALIDANDO: "Validando",
  AUTORIZADA: "Autorizada",
  REJEITADA: "Rejeitada",
  CANCELADA: "Cancelada",
};

const statusClasses: Record<
  string,
  string
> = {
  RASCUNHO:
    "bg-muted text-muted-foreground",

  VALIDANDO:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400",

  AUTORIZADA:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

  REJEITADA:
    "bg-destructive/10 text-destructive",

  CANCELADA:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
};

function somenteNumeros(
  valor?: string | null
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function formatarDocumento(
  documento?: string | null
) {
  if (!documento) {
    return "Não informado";
  }

  const numeros =
    somenteNumeros(documento);

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }

  if (numeros.length === 14) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  return documento;
}

function formatarValor(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function formatarData(
  valor: string
) {
  const data = new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(data);
}

function formatarNumeroNota(
  numero: number,
  serie: number
) {
  return {
    numero:
      String(numero).padStart(
        9,
        "0"
      ),

    serie:
      String(serie),
  };
}

export default async function NfePage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const [
    notasRaw,
    dadosNovaNfe,
  ] = await Promise.all([
    getNotasFiscais(
      empresaId
    ),

    getDadosNovaNfe(
      empresaId
    ),
  ]);

  const termoTexto =
    busca
      .trim()
      .toLowerCase();

  const termoNumerico =
    somenteNumeros(busca);

  const notas = termoTexto
    ? notasRaw.filter(
        (nota) => {
          const encontrouTexto = [
            nota.clienteNome,
            nota.status,
            statusLabel[
              nota.status
            ],
            String(nota.numero),
            String(nota.serie),
          ].some((valor) =>
            String(valor ?? "")
              .toLowerCase()
              .includes(termoTexto)
          );

          const encontrouNumero =
            Boolean(
              termoNumerico
            ) &&
            [
              String(nota.numero),
              String(nota.serie),
              nota.clienteDocumento,
            ].some((valor) =>
              somenteNumeros(
                valor
              ).includes(
                termoNumerico
              )
            );

          return (
            encontrouTexto ||
            encontrouNumero
          );
        }
      )
    : notasRaw;

  const totalRascunhos =
    notasRaw.filter(
      (nota) =>
        nota.status ===
        "RASCUNHO"
    ).length;

  const totalAutorizadas =
    notasRaw.filter(
      (nota) =>
        nota.status ===
        "AUTORIZADA"
    ).length;

  const totalRejeitadas =
    notasRaw.filter(
      (nota) =>
        nota.status ===
        "REJEITADA"
    ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Cabeçalho */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              NF-e
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie os rascunhos,
              validações e documentos
              fiscais eletrônicos desta
              empresa.
            </p>
          </div>
        </div>

        <NovaNfeDialog
          empresaId={empresaId}
          clientes={
            dadosNovaNfe.clientes
          }
          naturezas={
            dadosNovaNfe.naturezas
          }
          serieNfe={
            dadosNovaNfe.serieNfe
          }
        />
      </div>

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCard
          titulo="Total de NF-e"
          valor={notasRaw.length}
          descricao="Todos os documentos cadastrados"
          icone={FileText}
        />

        <IndicadorCard
          titulo="Rascunhos"
          valor={totalRascunhos}
          descricao="Documentos ainda editáveis"
          icone={Clock3}
        />

        <IndicadorCard
          titulo="Autorizadas"
          valor={totalAutorizadas}
          descricao="Documentos autorizados pela SEFAZ"
          icone={CircleCheck}
          variante="sucesso"
        />

        <IndicadorCard
          titulo="Rejeitadas"
          valor={totalRejeitadas}
          descricao="Documentos que precisam de correção"
          icone={CircleX}
          variante="erro"
        />
      </section>

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
              placeholder="Buscar por número, série, cliente, documento ou status..."
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
                <Link
                  href={`/empresa/${empresaId}/nfe`}
                />
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
            {notas.length === 1
              ? "1 NF-e encontrada."
              : `${notas.length} NF-e encontradas.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {notas.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {busca
                ? "Nenhuma NF-e encontrada"
                : "Nenhuma NF-e cadastrada"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos documentos correspondentes aos termos informados."
                : "Crie uma NF-e em rascunho para adicionar os itens, calcular os tributos e validar os dados fiscais."}
            </p>

            {busca && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/empresa/${empresaId}/nfe`}
                  />
                }
                variant="outline"
                className="mt-6 h-11"
              >
                Limpar busca
              </Button>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Cards para celular */}

          <div className="grid gap-4 md:hidden">
            {notas.map((nota) => {
              const identificacao =
                formatarNumeroNota(
                  nota.numero,
                  nota.serie
                );

              return (
                <article
                  key={nota.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText
                          size={21}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          NF-e
                        </p>

                        <h2 className="font-semibold">
                          Nº{" "}
                          {
                            identificacao.numero
                          }
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Série{" "}
                          {
                            identificacao.serie
                          }
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        nota.status
                      }
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Cliente
                      </dt>

                      <dd className="max-w-52 truncate text-right font-medium">
                        {
                          nota.clienteNome
                        }
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        CPF/CNPJ
                      </dt>

                      <dd className="text-right font-medium">
                        {formatarDocumento(
                          nota.clienteDocumento
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Emissão
                      </dt>

                      <dd className="text-right font-medium">
                        {formatarData(
                          nota.dataEmissao
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Itens
                      </dt>

                      <dd className="text-right font-medium">
                        {
                          nota.quantidadeItens
                        }
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Valor total
                      </dt>

                      <dd className="text-right font-semibold">
                        {formatarValor(
                          nota.valorTotal
                        )}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/empresa/${empresaId}/nfe/${nota.id}`}
                      />
                    }
                    className="mt-5 h-11 w-full"
                  >
                    <FileSearch
                      size={17}
                    />

                    Abrir NF-e
                  </Button>
                </article>
              );
            })}
          </div>

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      NF-e
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Cliente
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Emissão
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Itens
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Valor
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
                  {notas.map((nota) => {
                    const identificacao =
                      formatarNumeroNota(
                        nota.numero,
                        nota.serie
                      );

                    return (
                      <tr
                        key={nota.id}
                        className="border-t transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <FileText
                                size={19}
                              />
                            </div>

                            <div>
                              <p className="font-medium">
                                Nº{" "}
                                {
                                  identificacao.numero
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Série{" "}
                                {
                                  identificacao.serie
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-72 truncate font-medium">
                            {
                              nota.clienteNome
                            }
                          </p>

                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {formatarDocumento(
                              nota.clienteDocumento
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarData(
                            nota.dataEmissao
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {
                              nota.quantidadeItens
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {formatarValor(
                            nota.valorTotal
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              nota.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              nativeButton={
                                false
                              }
                              render={
                                <Link
                                  href={`/empresa/${empresaId}/nfe/${nota.id}`}
                                />
                              }
                            >
                              <FileSearch
                                size={16}
                              />

                              Abrir

                              <ArrowRight
                                size={15}
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type IndicadorCardProps = {
  titulo: string;
  valor: number;
  descricao: string;
  icone: LucideIcon;

  variante?:
    | "padrao"
    | "sucesso"
    | "erro";
};

function IndicadorCard({
  titulo,
  valor,
  descricao,
  icone: Icone,
  variante = "padrao",
}: IndicadorCardProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "erro"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {titulo}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight">
            {valor}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${classeIcone}`}
        >
          <Icone size={21} />
        </div>
      </div>

      <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        statusClasses[
          status
        ] ??
          "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {statusLabel[status] ??
        status}
    </span>
  );
}