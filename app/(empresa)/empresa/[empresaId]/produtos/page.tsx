import Link from "next/link";

import { PrivilegioEmpresa } from "@prisma/client";

import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Package,
  Power,
  PowerOff,
  Search,
  Wrench,
} from "lucide-react";

import { getProdutos } from "@/actions/produtos/get-produto";

import { NovoProdutoDialog } from "@/components/produtos/novo-produto-dialog";
import { ProdutoDeleteButton } from "@/components/produtos/produto-delete-button";
import { ProdutoEditButton } from "@/components/produtos/produto-edit-button";
import { ProdutoStatusButton } from "@/components/produtos/produto-status-button";

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
  | "TODOS"
  | "ATIVOS"
  | "INATIVOS";

const PRODUTOS_POR_PAGINA = 10;

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

function exibirCodigo(
  valor?: string | null
) {
  return (
    valor?.trim() ||
    "Não informado"
  );
}

function normalizarStatus(
  valor?: string
): FiltroStatus {
  const status =
    valor?.toUpperCase();

  if (status === "ATIVOS") {
    return "ATIVOS";
  }

  if (status === "INATIVOS") {
    return "INATIVOS";
  }

  return "TODOS";
}

export default async function ProdutosPage({
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
      PrivilegioEmpresa.PRODUTOS_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );

  const produtosRaw =
    await getProdutos(
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
      PrivilegioEmpresa.PRODUTOS_CRIAR
    );

  const podeEditar =
    possuiPrivilegio(
      PrivilegioEmpresa.PRODUTOS_EDITAR
    );

  const podeAlterarStatus =
    possuiPrivilegio(
      PrivilegioEmpresa.PRODUTOS_ALTERAR_STATUS
    );

  const podeExcluir =
    possuiPrivilegio(
      PrivilegioEmpresa.PRODUTOS_EXCLUIR
    );

  /*
   * Filtro por status
   */

  const produtosPorStatus =
    produtosRaw.filter(
      (produto) => {
        if (
          filtroStatus ===
          "ATIVOS"
        ) {
          return produto.ativo;
        }

        if (
          filtroStatus ===
          "INATIVOS"
        ) {
          return !produto.ativo;
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

  const produtosFiltrados =
    termo
      ? produtosPorStatus.filter(
          (produto) =>
            [
              produto.codigo,
              produto.descricao,
              produto.ean,
              produto.ncm,
              produto.cest,
              produto.cfopPadrao,
              produto.cstIcms,
              produto.csosnIcms,
              produto.cstPis,
              produto.cstCofins,
              produto.cstIpi,
              produto.cstIbsCbs,
              produto
                .classificacaoTributariaIbsCbs,
            ].some((valor) =>
              valor
                ?.toLowerCase()
                .includes(termo)
            )
        )
      : produtosPorStatus;

  /*
   * Paginação
   */

  const totalFiltrado =
    produtosFiltrados.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalFiltrado /
          PRODUTOS_POR_PAGINA
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
    PRODUTOS_POR_PAGINA;

  const indiceFinal =
    Math.min(
      indiceInicial +
        PRODUTOS_POR_PAGINA,
      totalFiltrado
    );

  const produtos =
    produtosFiltrados.slice(
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
   * Exibe no máximo cinco números.
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

  const totalAtivos =
    produtosRaw.filter(
      (produto) =>
        produto.ativo
    ).length;

  const totalInativos =
    produtosRaw.length -
    totalAtivos;

  const totalProdutos =
    produtosRaw.filter(
      (produto) =>
        produto.tipo ===
        "PRODUTO"
    ).length;

  const totalServicos =
    produtosRaw.filter(
      (produto) =>
        produto.tipo ===
        "SERVICO"
    ).length;

  const rotaBase =
    `/empresa/${empresaId}/produtos`;

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
      novoStatus !== "TODOS"
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
    produto:
      (typeof produtosRaw)[number]
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
          <ProdutoEditButton
            empresaId={empresaId}
            produto={{
              id:
                produto.id,

              codigo:
                produto.codigo,

              descricao:
                produto.descricao,

              tipo:
                produto.tipo,

              unidade:
                produto.unidade,

              ean:
                produto.ean,

              ncm:
                produto.ncm,

              cest:
                produto.cest,

              cfopPadrao:
                produto.cfopPadrao,

              valorUnitario:
                Number(
                  produto.valorUnitario
                ),

              origemMercadoria:
                produto.origemMercadoria,

              cstIcms:
                produto.cstIcms,

              csosnIcms:
                produto.csosnIcms,

              modalidadeBcIcms:
                produto.modalidadeBcIcms,

              reducaoBcIcms:
                Number(
                  produto.reducaoBcIcms ??
                    0
                ),

              aliquotaIcms:
                Number(
                  produto.aliquotaIcms ??
                    0
                ),

              cstPis:
                produto.cstPis,

              aliquotaPis:
                Number(
                  produto.aliquotaPis ??
                    0
                ),

              cstCofins:
                produto.cstCofins,

              aliquotaCofins:
                Number(
                  produto
                    .aliquotaCofins ??
                    0
                ),

              cstIpi:
                produto.cstIpi,

              codigoEnquadramentoIpi:
                produto
                  .codigoEnquadramentoIpi,

              aliquotaIpi:
                Number(
                  produto.aliquotaIpi ??
                    0
                ),

              cstIbsCbs:
                produto.cstIbsCbs,

              classificacaoTributariaIbsCbs:
                produto
                  .classificacaoTributariaIbsCbs,

              aliquotaIbsUf:
                Number(
                  produto.aliquotaIbsUf ??
                    0
                ),

              aliquotaIbsMun:
                Number(
                  produto
                    .aliquotaIbsMun ??
                    0
                ),

              aliquotaCbs:
                Number(
                  produto.aliquotaCbs ??
                    0
                ),
            }}
          />
        )}

        {podeAlterarStatus && (
          <ProdutoStatusButton
            empresaId={empresaId}
            produtoId={produto.id}
            produtoDescricao={
              produto.descricao
            }
            ativo={produto.ativo}
          />
        )}

        {podeExcluir && (
          <ProdutoDeleteButton
            empresaId={empresaId}
            produtoId={produto.id}
            produtoDescricao={
              produto.descricao
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
            <Package size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Produtos
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie produtos, serviços,
              valores e informações
              tributárias desta empresa.
            </p>
          </div>
        </div>

        {podeCriar && (
          <NovoProdutoDialog
            empresaId={empresaId}
          />
        )}
      </div>

      {/* Somente leitura */}

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. Os
          cadastros estão disponíveis
          somente para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Indicador
          titulo="Total"
          valor={produtosRaw.length}
          icone={Boxes}
        />

        <Indicador
          titulo="Ativos"
          valor={totalAtivos}
          icone={Power}
          variante="sucesso"
        />

        <Indicador
          titulo="Inativos"
          valor={totalInativos}
          icone={PowerOff}
          variante="aviso"
        />

        <Indicador
          titulo="Produtos"
          valor={totalProdutos}
          icone={Package}
        />

        <Indicador
          titulo="Serviços"
          valor={totalServicos}
          icone={Wrench}
        />
      </section>

      {/* Filtros e busca */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "TODOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "TODOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            Todos
          </Button>

          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "ATIVOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "ATIVOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <Power size={15} />

            Ativos
          </Button>

          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "INATIVOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "INATIVOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <PowerOff size={15} />

            Inativos
          </Button>
        </div>

        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          {filtroStatus !==
            "TODOS" && (
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
              placeholder="Buscar por código, descrição, EAN, NCM, CEST, CFOP ou CST..."
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
            "TODOS") && (
          <p className="mt-3 text-xs text-muted-foreground">
            {totalFiltrado === 1
              ? "1 cadastro encontrado."
              : `${totalFiltrado} cadastros encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {totalFiltrado === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Nenhum cadastro encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos produtos ou
              serviços correspondentes aos
              filtros informados.
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
          {/* Cards no celular */}

          <div className="grid gap-4 md:hidden">
            {produtos.map(
              (produto) => {
                const servico =
                  produto.tipo ===
                  "SERVICO";

                return (
                  <article
                    key={produto.id}
                    className={[
                      "rounded-2xl border bg-card p-5 shadow-sm",

                      !produto.ativo
                        ? "opacity-80"
                        : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {servico ? (
                            <Wrench
                              size={21}
                            />
                          ) : (
                            <Package
                              size={21}
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate font-semibold">
                              {
                                produto.descricao
                              }
                            </h2>

                            <StatusBadge
                              ativo={
                                produto.ativo
                              }
                            />
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Código:{" "}
                            {produto.codigo}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {servico
                          ? "Serviço"
                          : "Produto"}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                      <LinhaInformacao
                        titulo="Unidade"
                        valor={
                          produto.unidade
                        }
                      />

                      <LinhaInformacao
                        titulo="NCM"
                        valor={exibirCodigo(
                          produto.ncm
                        )}
                      />

                      <LinhaInformacao
                        titulo="CFOP"
                        valor={exibirCodigo(
                          produto.cfopPadrao
                        )}
                      />

                      <LinhaInformacao
                        titulo="Valor unitário"
                        valor={formatarValor(
                          Number(
                            produto.valorUnitario
                          )
                        )}
                        destaque
                      />
                    </dl>

                    <div className="mt-5 border-t pt-4">
                      {renderizarAcoes(
                        produto
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
              <table className="w-full min-w-[1200px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Produto
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Tipo
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Unidade
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      NCM
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CFOP
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
                  {produtos.map(
                    (produto) => {
                      const servico =
                        produto.tipo ===
                        "SERVICO";

                      return (
                        <tr
                          key={produto.id}
                          className={[
                            "border-t transition-colors hover:bg-muted/20",

                            !produto.ativo
                              ? "bg-muted/10 opacity-80"
                              : "",
                          ].join(" ")}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                {servico ? (
                                  <Wrench
                                    size={19}
                                  />
                                ) : (
                                  <Package
                                    size={19}
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-72 truncate font-medium">
                                  {
                                    produto.descricao
                                  }
                                </p>

                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  Código:{" "}
                                  {
                                    produto.codigo
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              {servico
                                ? "Serviço"
                                : "Produto"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {
                              produto.unidade
                            }
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {exibirCodigo(
                              produto.ncm
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {exibirCodigo(
                              produto.cfopPadrao
                            )}
                          </td>

                          <td className="px-5 py-4 font-medium">
                            {formatarValor(
                              Number(
                                produto.valorUnitario
                              )
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              ativo={
                                produto.ativo
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            {renderizarAcoes(
                              produto
                            )}
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
              aria-label="Paginação de produtos"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {primeiroRegistro} a{" "}
                {ultimoRegistro} de{" "}
                {totalFiltrado}{" "}
                {totalFiltrado === 1
                  ? "cadastro"
                  : "cadastros"}
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
    typeof Boxes;

  variante?:
    | "padrao"
    | "sucesso"
    | "aviso";
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-600"
      : variante === "aviso"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
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
        ? "Ativo"
        : "Inativo"}
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