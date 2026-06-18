import Link from "next/link";

import { PrivilegioEmpresa } from "@prisma/client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  FileSearch,
  FileText,
  Search,
  type LucideIcon,
} from "lucide-react";

import { getDadosNovaNfe } from "@/actions/nfe/get-dados-nova-nfe";
import { getNotasFiscais } from "@/actions/nfe/get-notas-fiscais";

import { NovaNfeDialog } from "@/components/nfe/nova-nfe-dialog";
import { NfeDeleteButton } from "@/components/nfe/nfe-delete-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

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

const NFES_POR_PAGINA = 10;

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

  const {
    busca = "",
    pagina = "1",
  } = await searchParams;

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.NFE_VISUALIZAR,
      {
        exigirEmpresaAtiva:
          false,
      }
    );

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

  function possuiPrivilegio(
    privilegio:
      PrivilegioEmpresa
  ) {
    if (
      contexto.somenteLeitura
    ) {
      return false;
    }

    if (
      contexto.usuario.role ===
      "OWNER"
    ) {
      return true;
    }

    const acesso =
      contexto.acesso;

    if (
      !acesso ||
      !acesso.ativo
    ) {
      return false;
    }

    if (
      contexto.usuario.role ===
      "ADMIN"
    ) {
      return (
        acesso.permissao ===
        "ADMIN"
      );
    }

    if (
      acesso.permissao ===
      "PERSONALIZADO"
    ) {
      return acesso.privilegios.some(
        (item) =>
          item.privilegio ===
          privilegio
      );
    }

    return false;
  }

  const podeCriar =
    possuiPrivilegio(
      PrivilegioEmpresa.NFE_CRIAR
    );

  const podeExcluirRascunho =
    possuiPrivilegio(
      PrivilegioEmpresa.NFE_EXCLUIR_RASCUNHO
    );

  /*
   * Busca
   */

  const termoTexto =
    busca
      .trim()
      .toLowerCase();

  const termoNumerico =
    somenteNumeros(busca);

  const notasFiltradas =
    termoTexto
      ? notasRaw.filter(
          (nota) => {
            const encontrouTexto = [
              nota.clienteNome,
              nota.status,
              statusLabel[
                nota.status
              ],
              String(
                nota.numero
              ),
              String(
                nota.serie
              ),
            ].some((valor) =>
              String(
                valor ?? ""
              )
                .toLowerCase()
                .includes(
                  termoTexto
                )
            );

            const encontrouNumero =
              Boolean(
                termoNumerico
              ) &&
              [
                String(
                  nota.numero
                ),
                String(
                  nota.serie
                ),
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

  /*
   * Paginação
   */

  const totalFiltrado =
    notasFiltradas.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalFiltrado /
          NFES_POR_PAGINA
      )
    );

  const paginaSolicitada =
    normalizarPagina(
      pagina
    );

  const paginaAtual =
    Math.min(
      paginaSolicitada,
      totalPaginas
    );

  const indiceInicial =
    (paginaAtual - 1) *
    NFES_POR_PAGINA;

  const indiceFinal =
    Math.min(
      indiceInicial +
        NFES_POR_PAGINA,
      totalFiltrado
    );

  const notas =
    notasFiltradas.slice(
      indiceInicial,
      indiceFinal
    );

  const primeiroRegistro =
    totalFiltrado === 0
      ? 0
      : indiceInicial + 1;

  const ultimoRegistro =
    indiceFinal;

  /*
   * Páginas numéricas
   *
   * Exibe no máximo cinco páginas.
   */

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

  /*
   * Indicadores
   */

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

  const rotaBase =
    `/empresa/${empresaId}/nfe`;

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
      {/* Cabeçalho */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText
              size={24}
            />
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

        {podeCriar && (
          <NovaNfeDialog
            empresaId={
              empresaId
            }
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
        )}
      </div>

      {/* Somente leitura */}

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa.
          As NF-e estão disponíveis
          somente para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCard
          titulo="Total de NF-e"
          valor={
            notasRaw.length
          }
          descricao="Todos os documentos cadastrados"
          icone={
            FileText
          }
        />

        <IndicadorCard
          titulo="Rascunhos"
          valor={
            totalRascunhos
          }
          descricao="Documentos ainda editáveis"
          icone={
            Clock3
          }
        />

        <IndicadorCard
          titulo="Autorizadas"
          valor={
            totalAutorizadas
          }
          descricao="Documentos autorizados pela SEFAZ"
          icone={
            CircleCheck
          }
          variante="sucesso"
        />

        <IndicadorCard
          titulo="Rejeitadas"
          valor={
            totalRejeitadas
          }
          descricao="Documentos que precisam de correção"
          icone={
            CircleX
          }
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
              defaultValue={
                busca
              }
              className="h-11 pl-10"
              placeholder="Buscar por número, série, cliente, documento ou status..."
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11"
          >
            <Search
              size={17}
            />

            Buscar
          </Button>

          {busca && (
            <Button
              nativeButton={
                false
              }
              render={
                <Link
                  href={criarHref({
                    incluirBusca:
                      false,
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
              ? "1 NF-e encontrada."
              : `${totalFiltrado} NF-e encontradas.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {totalFiltrado === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText
                size={30}
              />
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
                nativeButton={
                  false
                }
                render={
                  <Link
                    href={
                      rotaBase
                    }
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
          {/* Cards no celular */}

          <div className="grid gap-4 md:hidden">
            {notas.map(
              (nota) => {
                const identificacao =
                  formatarNumeroNota(
                    nota.numero,
                    nota.serie
                  );

                const podeExcluirNota =
                  nota.status ===
                    "RASCUNHO" &&
                  podeExcluirRascunho;

                return (
                  <article
                    key={
                      nota.id
                    }
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText
                            size={
                              21
                            }
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
                      <LinhaInformacao
                        titulo="Cliente"
                        valor={
                          nota.clienteNome
                        }
                      />

                      <LinhaInformacao
                        titulo="CPF/CNPJ"
                        valor={formatarDocumento(
                          nota.clienteDocumento
                        )}
                      />

                      <LinhaInformacao
                        titulo="Emissão"
                        valor={formatarData(
                          nota.dataEmissao
                        )}
                      />

                      <LinhaInformacao
                        titulo="Itens"
                        valor={String(
                          nota.quantidadeItens
                        )}
                      />

                      <LinhaInformacao
                        titulo="Valor total"
                        valor={formatarValor(
                          nota.valorTotal
                        )}
                        destaque
                      />
                    </dl>

                    <div className="mt-5 flex flex-col gap-2">
                      <Button
                        nativeButton={
                          false
                        }
                        render={
                          <Link
                            href={`/empresa/${empresaId}/nfe/${nota.id}`}
                          />
                        }
                        className="h-11 w-full"
                      >
                        <FileSearch
                          size={
                            17
                          }
                        />

                        Abrir NF-e
                      </Button>

                      {podeExcluirNota && (
                        <NfeDeleteButton
                          empresaId={
                            empresaId
                          }
                          notaFiscalId={
                            nota.id
                          }
                          numero={
                            nota.numero
                          }
                          serie={
                            nota.serie
                          }
                          clienteNome={
                            nota.clienteNome
                          }
                        />
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* Tabela no computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
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
                  {notas.map(
                    (nota) => {
                      const identificacao =
                        formatarNumeroNota(
                          nota.numero,
                          nota.serie
                        );

                      const podeExcluirNota =
                        nota.status ===
                          "RASCUNHO" &&
                        podeExcluirRascunho;

                      return (
                        <tr
                          key={
                            nota.id
                          }
                          className="border-t transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText
                                  size={
                                    19
                                  }
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
                            <div className="flex flex-wrap justify-end gap-2">
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
                                  size={
                                    16
                                  }
                                />

                                Abrir

                                <ArrowRight
                                  size={
                                    15
                                  }
                                />
                              </Button>

                              {podeExcluirNota && (
                                <NfeDeleteButton
                                  empresaId={
                                    empresaId
                                  }
                                  notaFiscalId={
                                    nota.id
                                  }
                                  numero={
                                    nota.numero
                                  }
                                  serie={
                                    nota.serie
                                  }
                                  clienteNome={
                                    nota.clienteNome
                                  }
                                />
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

          {/* Paginação */}

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação de notas fiscais"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {primeiroRegistro} a{" "}
                {ultimoRegistro} de{" "}
                {totalFiltrado} NF-e
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {paginaAtual > 1 ? (
                  <Button
                    nativeButton={
                      false
                    }
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual -
                            1,
                        })}
                        aria-label="Página anterior"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Anterior
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Anterior
                  </Button>
                )}

                {paginasVisiveis.map(
                  (numeroPagina) => (
                    <Button
                      key={
                        numeroPagina
                      }
                      nativeButton={
                        false
                      }
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
                    nativeButton={
                      false
                    }
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual +
                            1,
                        })}
                        aria-label="Próxima página"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    Próxima

                    <ChevronRight
                      size={16}
                    />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Próxima

                    <ChevronRight
                      size={16}
                    />
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

        statusClasses[
          status
        ] ??
          "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {statusLabel[
        status
      ] ?? status}
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
          "max-w-52 truncate text-right",

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