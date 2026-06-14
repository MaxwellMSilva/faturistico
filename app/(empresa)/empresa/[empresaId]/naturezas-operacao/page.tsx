import Link from "next/link";

import {
  CircleCheck,
  CircleX,
  ClipboardList,
  Search,
} from "lucide-react";

import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-naturezas-operacao";

import { NaturezaOperacaoDialog } from "@/components/naturezas-operacao/natureza-operacao-dialog";
import { NaturezaDeleteButton } from "@/components/naturezas-operacao/natureza-delete-button";

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

const finalidades: Record<
  string,
  string
> = {
  NORMAL: "Normal",
  COMPLEMENTAR: "Complementar",
  AJUSTE: "Ajuste",
  DEVOLUCAO: "Devolução",
};

function obterFinalidade(
  finalidade: string
) {
  return (
    finalidades[finalidade] ??
    finalidade
  );
}

export default async function NaturezasOperacaoPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const naturezasRaw =
    await getNaturezasOperacao(
      empresaId
    );

  const termo =
    busca
      .trim()
      .toLowerCase();

  const naturezas = termo
    ? naturezasRaw.filter(
        (natureza) => {
          const finalidade =
            obterFinalidade(
              natureza.finalidadeNfe
            );

          const status =
            natureza.ativo
              ? "ativa"
              : "inativa";

          const consumidorFinal =
            natureza.consumidorFinal
              ? "sim"
              : "não";

          const contribuinteIcms =
            natureza.contribuinteIcms
              ? "sim"
              : "não";

          return [
            natureza.descricao,
            natureza.cfop,
            natureza.finalidadeNfe,
            finalidade,
            status,
            consumidorFinal,
            contribuinteIcms,
          ].some((valor) =>
            valor
              .toLowerCase()
              .includes(termo)
          );
        }
      )
    : naturezasRaw;

  const totalAtivas =
    naturezasRaw.filter(
      (natureza) =>
        natureza.ativo
    ).length;

  const totalInativas =
    naturezasRaw.length -
    totalAtivas;

  function renderizarAcoes(
    natureza: (typeof naturezasRaw)[number]
  ) {
    return (
      <div className="flex justify-end gap-2">
        <NaturezaOperacaoDialog
          empresaId={empresaId}
          natureza={{
            id:
              natureza.id,

            descricao:
              natureza.descricao,

            cfop:
              natureza.cfop,

            finalidadeNfe:
              natureza.finalidadeNfe,

            consumidorFinal:
              natureza.consumidorFinal,

            contribuinteIcms:
              natureza.contribuinteIcms,

            ativo:
              natureza.ativo,
          }}
        />

        <NaturezaDeleteButton
          empresaId={empresaId}
          naturezaId={natureza.id}
          descricao={
            natureza.descricao
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Cabeçalho */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList
              size={24}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Naturezas de operação
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie as operações
              fiscais, CFOPs, finalidades
              e regras utilizadas na
              emissão dos documentos.
            </p>
          </div>
        </div>

        <NaturezaOperacaoDialog
          empresaId={empresaId}
        />
      </div>

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de naturezas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {naturezasRaw.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList
                size={21}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Naturezas ativas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalAtivas}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CircleCheck
                size={21}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Naturezas inativas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalInativas}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <CircleX size={21} />
            </div>
          </div>
        </div>
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
              placeholder="Buscar por descrição, CFOP, finalidade ou status..."
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
                  href={`/empresa/${empresaId}/naturezas-operacao`}
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
            {naturezas.length === 1
              ? "1 natureza encontrada."
              : `${naturezas.length} naturezas encontradas.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {naturezas.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList
                size={30}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {busca
                ? "Nenhuma natureza encontrada"
                : "Nenhuma natureza cadastrada"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos naturezas de operação correspondentes aos termos informados."
                : "Cadastre uma natureza de operação para utilizá-la nas notas fiscais da empresa."}
            </p>

            {busca && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/empresa/${empresaId}/naturezas-operacao`}
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
            {naturezas.map(
              (natureza) => (
                <article
                  key={natureza.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ClipboardList
                          size={21}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {
                            natureza.descricao
                          }
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          CFOP{" "}
                          {natureza.cfop}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      ativo={
                        natureza.ativo
                      }
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Finalidade
                      </dt>

                      <dd className="text-right font-medium">
                        {obterFinalidade(
                          natureza.finalidadeNfe
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Consumidor final
                      </dt>

                      <dd>
                        <BooleanBadge
                          valor={
                            natureza.consumidorFinal
                          }
                        />
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Contribuinte ICMS
                      </dt>

                      <dd>
                        <BooleanBadge
                          valor={
                            natureza.contribuinteIcms
                          }
                        />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 border-t pt-4">
                    {renderizarAcoes(
                      natureza
                    )}
                  </div>
                </article>
              )
            )}
          </div>

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Natureza
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CFOP
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Finalidade
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Consumidor final
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Contribuinte ICMS
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
                  {naturezas.map(
                    (natureza) => (
                      <tr
                        key={natureza.id}
                        className="border-t transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <ClipboardList
                                size={19}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-72 truncate font-medium">
                                {
                                  natureza.descricao
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Operação fiscal
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-md border bg-muted/20 px-2.5 py-1 font-mono text-sm font-medium">
                            {natureza.cfop}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {obterFinalidade(
                            natureza.finalidadeNfe
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <BooleanBadge
                            valor={
                              natureza.consumidorFinal
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <BooleanBadge
                            valor={
                              natureza.contribuinteIcms
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            ativo={
                              natureza.ativo
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          {renderizarAcoes(
                            natureza
                          )}
                        </td>
                      </tr>
                    )
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

type StatusBadgeProps = {
  ativo: boolean;
};

function StatusBadge({
  ativo,
}: StatusBadgeProps) {
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

type BooleanBadgeProps = {
  valor: boolean;
};

function BooleanBadge({
  valor,
}: BooleanBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        valor
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {valor
        ? "Sim"
        : "Não"}
    </span>
  );
}