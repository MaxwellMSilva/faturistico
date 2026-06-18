import Link from "next/link";

import { PrivilegioEmpresa } from "@prisma/client";

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardList,
  Power,
  PowerOff,
  Search,
} from "lucide-react";

import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-naturezas-operacao";

import { NaturezaDeleteButton } from "@/components/naturezas-operacao/natureza-delete-button";
import { NaturezaOperacaoDialog } from "@/components/naturezas-operacao/natureza-operacao-dialog";
import { NaturezaStatusButton } from "@/components/naturezas-operacao/natureza-status-button";

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
    status?: string;
    pagina?: string;
  }>;
};

type FiltroStatus =
  | "TODAS"
  | "ATIVAS"
  | "INATIVAS";

const NATUREZAS_POR_PAGINA = 10;

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

function normalizarStatus(
  valor?: string
): FiltroStatus {
  const status =
    valor?.toUpperCase();

  if (status === "ATIVAS") {
    return "ATIVAS";
  }

  if (status === "INATIVAS") {
    return "INATIVAS";
  }

  return "TODAS";
}

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

export default async function NaturezasOperacaoPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const {
    busca = "",
    status = "",
    pagina = "1",
  } = await searchParams;

  const filtroStatus =
    normalizarStatus(status);

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.NATUREZAS_VISUALIZAR,
      {
        exigirEmpresaAtiva:
          false,
      }
    );

  const naturezasRaw =
    await getNaturezasOperacao(
      empresaId
    );

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
      PrivilegioEmpresa.NATUREZAS_CRIAR
    );

  const podeEditar =
    possuiPrivilegio(
      PrivilegioEmpresa.NATUREZAS_EDITAR
    );

  const podeAlterarStatus =
    possuiPrivilegio(
      PrivilegioEmpresa.NATUREZAS_ALTERAR_STATUS
    );

  const podeExcluir =
    possuiPrivilegio(
      PrivilegioEmpresa.NATUREZAS_EXCLUIR
    );

  /*
   * Filtro por status
   */

  const naturezasPorStatus =
    naturezasRaw.filter(
      (natureza) => {
        if (
          filtroStatus ===
          "ATIVAS"
        ) {
          return natureza.ativo;
        }

        if (
          filtroStatus ===
          "INATIVAS"
        ) {
          return !natureza.ativo;
        }

        return true;
      }
    );

  /*
   * Busca
   */

  const termo =
    busca
      .trim()
      .toLowerCase();

  const naturezasFiltradas =
    termo
      ? naturezasPorStatus.filter(
          (natureza) => {
            const finalidade =
              obterFinalidade(
                natureza.finalidadeNfe
              );

            const statusNatureza =
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
              statusNatureza,
              consumidorFinal,
              contribuinteIcms,
            ].some((valor) =>
              valor
                .toLowerCase()
                .includes(termo)
            );
          }
        )
      : naturezasPorStatus;

  /*
   * Paginação
   */

  const totalFiltrado =
    naturezasFiltradas.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalFiltrado /
          NATUREZAS_POR_PAGINA
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
    NATUREZAS_POR_PAGINA;

  const indiceFinal =
    Math.min(
      indiceInicial +
        NATUREZAS_POR_PAGINA,
      totalFiltrado
    );

  const naturezas =
    naturezasFiltradas.slice(
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

  const totalAtivas =
    naturezasRaw.filter(
      (natureza) =>
        natureza.ativo
    ).length;

  const totalInativas =
    naturezasRaw.length -
    totalAtivas;

  const rotaBase =
    `/empresa/${empresaId}/naturezas-operacao`;

  function criarHref({
    novoStatus =
      filtroStatus,

    incluirBusca = true,

    novaPagina = 1,
  }: {
    novoStatus?:
      FiltroStatus;

    incluirBusca?:
      boolean;

    novaPagina?:
      number;
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

    if (
      novoStatus !== "TODAS"
    ) {
      parametros.set(
        "status",
        novoStatus.toLowerCase()
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

  function renderizarAcoes(
    natureza:
      (typeof naturezasRaw)[number]
  ) {
    const possuiAlgumaAcao =
      podeEditar ||
      podeAlterarStatus ||
      podeExcluir;

    if (!possuiAlgumaAcao) {
      return (
        <span className="text-sm text-muted-foreground">
          Sem ações disponíveis
        </span>
      );
    }

    return (
      <div className="flex flex-wrap justify-end gap-2">
        {podeEditar && (
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
        )}

        {podeAlterarStatus && (
          <NaturezaStatusButton
            empresaId={
              empresaId
            }
            naturezaId={
              natureza.id
            }
            descricao={
              natureza.descricao
            }
            ativo={
              natureza.ativo
            }
          />
        )}

        {podeExcluir && (
          <NaturezaDeleteButton
            empresaId={
              empresaId
            }
            naturezaId={
              natureza.id
            }
            descricao={
              natureza.descricao
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
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

        {podeCriar && (
          <NaturezaOperacaoDialog
            empresaId={empresaId}
          />
        )}
      </div>

      {/* Somente leitura */}

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. As
          naturezas de operação estão
          disponíveis somente para
          consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador
          titulo="Total de naturezas"
          valor={
            naturezasRaw.length
          }
          icone={
            ClipboardList
          }
        />

        <Indicador
          titulo="Naturezas ativas"
          valor={
            totalAtivas
          }
          icone={
            CircleCheck
          }
          variante="sucesso"
        />

        <Indicador
          titulo="Naturezas inativas"
          valor={
            totalInativas
          }
          icone={
            CircleX
          }
          variante="aviso"
          className="sm:col-span-2 xl:col-span-1"
        />
      </section>

      {/* Filtros e busca */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            nativeButton={
              false
            }
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "TODAS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "TODAS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            Todas
          </Button>

          <Button
            nativeButton={
              false
            }
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "ATIVAS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "ATIVAS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <Power size={15} />

            Ativas
          </Button>

          <Button
            nativeButton={
              false
            }
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "INATIVAS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "INATIVAS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <PowerOff size={15} />

            Inativas
          </Button>
        </div>

        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          {filtroStatus !==
            "TODAS" && (
            <input
              type="hidden"
              name="status"
              value={filtroStatus.toLowerCase()}
            />
          )}

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

        {(busca ||
          filtroStatus !==
            "TODAS") && (
          <p className="mt-3 text-xs text-muted-foreground">
            {totalFiltrado === 1
              ? "1 natureza encontrada."
              : `${totalFiltrado} naturezas encontradas.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {totalFiltrado === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList
                size={30}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Nenhuma natureza encontrada
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos naturezas
              de operação correspondentes
              aos filtros informados.
            </p>

            <Button
              nativeButton={false}
              render={
                <Link
                  href={rotaBase}
                />
              }
              variant="outline"
              className="mt-6 h-11"
            >
              Limpar filtros
            </Button>
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
                  className={[
                    "rounded-2xl border bg-card p-5 shadow-sm",

                    !natureza.ativo
                      ? "opacity-80"
                      : "",
                  ].join(" ")}
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
                    <LinhaInformacao
                      titulo="Finalidade"
                      valor={obterFinalidade(
                        natureza.finalidadeNfe
                      )}
                    />

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
              <table className="w-full min-w-[1200px]">
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
                        className={[
                          "border-t transition-colors hover:bg-muted/20",

                          !natureza.ativo
                            ? "bg-muted/10 opacity-80"
                            : "",
                        ].join(" ")}
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

          {/* Paginação */}

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação de naturezas de operação"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {primeiroRegistro} a{" "}
                {ultimoRegistro} de{" "}
                {totalFiltrado}{" "}
                {totalFiltrado === 1
                  ? "natureza"
                  : "naturezas"}
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

type IndicadorProps = {
  titulo: string;
  valor: number;

  icone:
    typeof ClipboardList;

  variante?:
    | "padrao"
    | "sucesso"
    | "aviso";

  className?: string;
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
  className,
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "aviso"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-primary/10 text-primary";

  return (
    <div
      className={[
        "rounded-2xl border bg-card p-5 shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {titulo}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight">
            {valor}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            classeIcone,
          ].join(" ")}
        >
          <Icone size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
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
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      ].join(" ")}
    >
      {ativo
        ? "Ativa"
        : "Inativa"}
    </span>
  );
}

function BooleanBadge({
  valor,
}: {
  valor: boolean;
}) {
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

      <dd
        className="max-w-52 truncate text-right font-medium"
        title={valor}
      >
        {valor}
      </dd>
    </div>
  );
}