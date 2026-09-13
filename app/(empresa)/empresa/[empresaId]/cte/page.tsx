import Link from "next/link";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  ArrowRight,
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  FileSearch,
  FileText,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";

import { getCtes } from "@/actions/cte/get-ctes";
import { CteDeleteButton } from "@/components/cte/cte-delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  contextoPossuiPrivilegioEmpresa,
  validarPrivilegioEmpresa,
} from "@/lib/empresa/validar-privilegio-empresa";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
    pagina?: string;
  }>;
};

const CTES_POR_PAGINA = 10;

const statusLabel: Record<
  string,
  string
> = {
  RASCUNHO: "Rascunho",
  VALIDANDO: "Validando",
  VALIDADO: "Validado",
  PROCESSANDO: "Processando",
  AUTORIZADO: "Autorizado",
  REJEITADO: "Rejeitado",
  CANCELADO: "Cancelado",
};

const statusClasses: Record<
  string,
  string
> = {
  RASCUNHO:
    "bg-muted text-muted-foreground",
  VALIDANDO:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  VALIDADO:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  PROCESSANDO:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  AUTORIZADO:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJEITADO:
    "bg-destructive/10 text-destructive",
  CANCELADO:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
};

function normalizarPagina(
  valor?: string
) {
  const pagina = Number(valor);

  if (
    !Number.isInteger(pagina) ||
    pagina < 1
  ) {
    return 1;
  }

  return pagina;
}

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
  valor: Date | string
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
      timeZone:
        "America/Porto_Velho",
    }
  ).format(data);
}

function formatarNumeroCte(
  numero: number,
  serie: number
) {
  return {
    numero:
      String(numero).padStart(
        9,
        "0"
      ),
    serie: String(serie),
  };
}

export default async function CtePage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const {
    busca = "",
    pagina = "1",
  } = await searchParams;

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.CTE_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );

  const podeCriar =
    contextoPossuiPrivilegioEmpresa(
      contexto,
      PrivilegioEmpresa.CTE_CRIAR
    );

  const podeExcluirRascunho =
    contextoPossuiPrivilegioEmpresa(
      contexto,
      PrivilegioEmpresa.CTE_EXCLUIR_RASCUNHO
    );

  const ctesRaw =
    await getCtes(empresaId);

  const termoTexto =
    busca.trim().toLowerCase();

  const termoNumerico =
    somenteNumeros(busca);

  const ctesFiltrados =
    termoTexto
      ? ctesRaw.filter((cte) => {
          const encontrouTexto = [
            cte.status,
            statusLabel[cte.status],
            String(cte.numero),
            String(cte.serie),
            cte.remetente?.nome,
            cte.destinatario?.nome,
            cte.municipioInicio,
            cte.ufInicio,
            cte.municipioFim,
            cte.ufFim,
            cte.chaveAcesso,
          ].some((valor) =>
            String(valor ?? "")
              .toLowerCase()
              .includes(termoTexto)
          );

          const encontrouNumero =
            Boolean(termoNumerico) &&
            [
              String(cte.numero),
              String(cte.serie),
              cte.remetente?.cpfCnpj,
              cte.destinatario?.cpfCnpj,
              cte.chaveAcesso,
            ].some((valor) =>
              somenteNumeros(valor).includes(
                termoNumerico
              )
            );

          return (
            encontrouTexto ||
            encontrouNumero
          );
        })
      : ctesRaw;

  const totalFiltrado =
    ctesFiltrados.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalFiltrado /
          CTES_POR_PAGINA
      )
    );

  const paginaSolicitada =
    normalizarPagina(pagina);

  const paginaAtual =
    Math.min(
      paginaSolicitada,
      totalPaginas
    );

  const indiceInicial =
    (paginaAtual - 1) *
    CTES_POR_PAGINA;

  const indiceFinal =
    Math.min(
      indiceInicial +
        CTES_POR_PAGINA,
      totalFiltrado
    );

  const ctes =
    ctesFiltrados.slice(
      indiceInicial,
      indiceFinal
    );

  const primeiroRegistro =
    totalFiltrado === 0
      ? 0
      : indiceInicial + 1;

  const ultimoRegistro =
    indiceFinal;

  const primeiraPaginaVisivel =
    Math.max(
      1,
      Math.min(
        paginaAtual - 2,
        totalPaginas - 4
      )
    );

  const ultimaPaginaVisivel =
    Math.min(
      totalPaginas,
      primeiraPaginaVisivel + 4
    );

  const paginasVisiveis =
    Array.from(
      {
        length:
          ultimaPaginaVisivel -
          primeiraPaginaVisivel +
          1,
      },
      (_, indice) =>
        primeiraPaginaVisivel +
        indice
    );

  const totalRascunhos =
    ctesRaw.filter(
      (cte) =>
        cte.status === "RASCUNHO"
    ).length;

  const totalAutorizados =
    ctesRaw.filter(
      (cte) =>
        cte.status === "AUTORIZADO"
    ).length;

  const totalRejeitados =
    ctesRaw.filter(
      (cte) =>
        cte.status === "REJEITADO"
    ).length;

  const rotaBase =
    `/empresa/${empresaId}/cte`;

  function criarHref({
    incluirBusca = true,
    novaPagina = 1,
  }: {
    incluirBusca?: boolean;
    novaPagina?: number;
  }) {
    const parametros =
      new URLSearchParams();

    if (
      incluirBusca &&
      busca.trim()
    ) {
      parametros.set(
        "busca",
        busca.trim()
      );
    }

    if (novaPagina > 1) {
      parametros.set(
        "pagina",
        String(novaPagina)
      );
    }

    const query =
      parametros.toString();

    return query
      ? `${rotaBase}?${query}`
      : rotaBase;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              CT-e
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie os rascunhos, validações e Conhecimentos de Transporte Eletrônicos desta empresa.
            </p>
          </div>
        </div>

        {podeCriar && (
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/empresa/${empresaId}/cte/novo`}
              />
            }
            className="h-11"
          >
            <Plus size={17} />
            Novo CT-e
          </Button>
        )}
      </div>

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. Os CT-e estão disponíveis somente para consulta.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCard
          titulo="Total de CT-e"
          valor={ctesRaw.length}
          descricao="Todos os conhecimentos cadastrados"
          icone={FileText}
        />

        <IndicadorCard
          titulo="Rascunhos"
          valor={totalRascunhos}
          descricao="Documentos ainda editáveis"
          icone={Clock3}
        />

        <IndicadorCard
          titulo="Autorizados"
          valor={totalAutorizados}
          descricao="Documentos autorizados pela SEFAZ"
          icone={CircleCheck}
          variante="sucesso"
        />

        <IndicadorCard
          titulo="Rejeitados"
          valor={totalRejeitados}
          descricao="Documentos que precisam de correção"
          icone={CircleX}
          variante="erro"
        />
      </section>

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
              placeholder="Buscar por número, série, remetente, destinatário, rota, chave ou status..."
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
                  href={criarHref({
                    incluirBusca: false,
                  })}
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
            {totalFiltrado === 1
              ? "1 CT-e encontrado."
              : `${totalFiltrado} CT-e encontrados.`}
          </p>
        )}
      </section>

      {totalFiltrado === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {busca
                ? "Nenhum CT-e encontrado"
                : "Nenhum CT-e cadastrado"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos documentos correspondentes aos termos informados."
                : "Crie um CT-e em rascunho para informar participantes, documentos transportados, carga, valores e tributos."}
            </p>

            {busca && (
              <Button
                nativeButton={false}
                render={
                  <Link href={rotaBase} />
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
          <div className="grid gap-4 md:hidden">
            {ctes.map((cte) => {
              const identificacao =
                formatarNumeroCte(
                  cte.numero,
                  cte.serie
                );

              const podeExcluirCte =
                cte.status === "RASCUNHO" &&
                podeExcluirRascunho;

              return (
                <article
                  key={cte.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          CT-e
                        </p>
                        <h2 className="font-semibold">
                          Nº {identificacao.numero}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Série {identificacao.serie}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={cte.status}
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <LinhaInformacao
                      titulo="Remetente"
                      valor={
                        cte.remetente?.nome ??
                        "Não informado"
                      }
                    />
                    <LinhaInformacao
                      titulo="CPF/CNPJ"
                      valor={formatarDocumento(
                        cte.remetente?.cpfCnpj
                      )}
                    />
                    <LinhaInformacao
                      titulo="Destinatário"
                      valor={
                        cte.destinatario?.nome ??
                        "Não informado"
                      }
                    />
                    <LinhaInformacao
                      titulo="Rota"
                      valor={`${cte.municipioInicio}/${cte.ufInicio} → ${cte.municipioFim}/${cte.ufFim}`}
                    />
                    <LinhaInformacao
                      titulo="Emissão"
                      valor={formatarData(
                        cte.dataEmissao
                      )}
                    />
                    <LinhaInformacao
                      titulo="Valor da prestação"
                      valor={formatarValor(
                        cte.valorPrestacao
                      )}
                      destaque
                    />
                  </dl>

                  <div className="mt-5 flex flex-col gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={`/empresa/${empresaId}/cte/${cte.id}`}
                        />
                      }
                      className="h-11 w-full"
                    >
                      <FileSearch size={17} />
                      Abrir CT-e
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      disabled
                      title="A geração de CIOT será conectada em uma próxima etapa."
                    >
                      <BadgeDollarSign size={17} />
                      Gerar CIOT
                    </Button>

                    {podeExcluirCte && (
                      <CteDeleteButton
                        empresaId={empresaId}
                        cteId={cte.id}
                        numero={cte.numero}
                        serie={cte.serie}
                        remetenteNome={
                          cte.remetente?.nome ??
                          "Não informado"
                        }
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CT-e
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Remetente
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Destinatário
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Rota
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Emissão
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Prestação
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
                  {ctes.map((cte) => {
                    const identificacao =
                      formatarNumeroCte(
                        cte.numero,
                        cte.serie
                      );

                    const podeExcluirCte =
                      cte.status ===
                        "RASCUNHO" &&
                      podeExcluirRascunho;

                    return (
                      <tr
                        key={cte.id}
                        className="border-t transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <FileText size={19} />
                            </div>

                            <div>
                              <p className="font-medium">
                                Nº {identificacao.numero}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Série {identificacao.serie}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-64 truncate font-medium">
                            {cte.remetente?.nome ??
                              "Não informado"}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {formatarDocumento(
                              cte.remetente?.cpfCnpj
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-64 truncate font-medium">
                            {cte.destinatario?.nome ??
                              "Não informado"}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {formatarDocumento(
                              cte.destinatario?.cpfCnpj
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          <p className="font-medium">
                            {cte.municipioInicio}/{cte.ufInicio}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            até {cte.municipioFim}/{cte.ufFim}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarData(
                            cte.dataEmissao
                          )}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {formatarValor(
                            cte.valorPrestacao
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={cte.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              nativeButton={false}
                              render={
                                <Link
                                  href={`/empresa/${empresaId}/cte/${cte.id}`}
                                />
                              }
                            >
                              <FileSearch size={16} />
                              Abrir
                              <ArrowRight size={15} />
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled
                              title="A geração de CIOT será conectada em uma próxima etapa."
                            >
                              <BadgeDollarSign size={16} />
                              Gerar CIOT
                            </Button>

                            {podeExcluirCte && (
                              <CteDeleteButton
                                empresaId={empresaId}
                                cteId={cte.id}
                                numero={cte.numero}
                                serie={cte.serie}
                                remetenteNome={
                                  cte.remetente?.nome ??
                                  "Não informado"
                                }
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação de CT-e"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando {primeiroRegistro} a {ultimoRegistro} de {totalFiltrado} CT-e
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {paginaAtual > 1 ? (
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual - 1,
                        })}
                        aria-label="Página anterior"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                )}

                {paginasVisiveis.map(
                  (numeroPagina) => (
                    <Button
                      key={numeroPagina}
                      nativeButton={false}
                      render={
                        <Link
                          href={criarHref({
                            novaPagina:
                              numeroPagina,
                          })}
                          aria-label={`Ir para a página ${numeroPagina}`}
                          aria-current={
                            numeroPagina ===
                            paginaAtual
                              ? "page"
                              : undefined
                          }
                        />
                      }
                      variant={
                        numeroPagina ===
                        paginaAtual
                          ? "default"
                          : "outline"
                      }
                      size="icon-sm"
                    >
                      {numeroPagina}
                    </Button>
                  )
                )}

                {paginaAtual <
                totalPaginas ? (
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual + 1,
                        })}
                        aria-label="Próxima página"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </nav>
          )}
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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        statusClasses[status] ??
          "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}

function LinhaInformacao({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">
        {titulo}
      </dt>
      <dd
        className={[
          "max-w-56 truncate text-right",
          destaque
            ? "font-semibold"
            : "font-medium",
        ].join(" ")}
        title={valor}
      >
        {valor}
      </dd>
    </div>
  );
}
