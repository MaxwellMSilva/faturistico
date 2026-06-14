import Link from "next/link";

import {
  Boxes,
  Package,
  Search,
  Wrench,
} from "lucide-react";

import { getProdutos } from "@/actions/produtos/get-produto";

import { NovoProdutoDialog } from "@/components/produtos/novo-produto-dialog";
import { ProdutoEditButton } from "@/components/produtos/produto-edit-button";
import { ProdutoDeleteButton } from "@/components/produtos/produto-delete-button";

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
  return valor?.trim() || "Não informado";
}

export default async function ProdutosPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const produtosRaw =
    await getProdutos(
      empresaId
    );

  const termo =
    busca
      .trim()
      .toLowerCase();

  const produtos = termo
    ? produtosRaw.filter(
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
    : produtosRaw;

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

  function renderizarAcoes(
    produto: (typeof produtosRaw)[number]
  ) {
    return (
      <div className="flex justify-end gap-2">
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

        <ProdutoDeleteButton
          empresaId={empresaId}
          produtoId={produto.id}
          produtoDescricao={
            produto.descricao
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

        <NovoProdutoDialog
          empresaId={empresaId}
        />
      </div>

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de cadastros
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {produtosRaw.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Boxes size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Produtos
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalProdutos}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Serviços
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalServicos}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench size={21} />
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
                  href={`/empresa/${empresaId}/produtos`}
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
            {produtos.length === 1
              ? "1 cadastro encontrado."
              : `${produtos.length} cadastros encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {produtos.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {busca
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos produtos ou serviços correspondentes aos termos informados."
                : "Cadastre seu primeiro produto para utilizá-lo nas operações e notas fiscais."}
            </p>

            {busca && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/empresa/${empresaId}/produtos`}
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
            {produtos.map(
              (produto) => {
                const servico =
                  produto.tipo ===
                  "SERVICO";

                return (
                  <article
                    key={produto.id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
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
                          <h2 className="truncate font-semibold">
                            {
                              produto.descricao
                            }
                          </h2>

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
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          Unidade
                        </dt>

                        <dd className="text-right font-medium">
                          {produto.unidade}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          NCM
                        </dt>

                        <dd className="text-right font-medium">
                          {exibirCodigo(
                            produto.ncm
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          CFOP
                        </dt>

                        <dd className="text-right font-medium">
                          {exibirCodigo(
                            produto.cfopPadrao
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">
                          Valor unitário
                        </dt>

                        <dd className="text-right font-semibold">
                          {formatarValor(
                            Number(
                              produto.valorUnitario
                            )
                          )}
                        </dd>
                      </div>
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

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
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
                          className="border-t transition-colors hover:bg-muted/20"
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
                            {produto.unidade}
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
        </>
      )}
    </div>
  );
}