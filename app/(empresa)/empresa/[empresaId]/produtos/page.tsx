import {
  Package,
  Search,
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
    busca.trim().toLowerCase();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Produtos
          </h1>

          <p className="text-muted-foreground">
            Gerencie os produtos e serviços
            desta empresa.
          </p>
        </div>

        <NovoProdutoDialog
          empresaId={empresaId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de Produtos
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {produtosRaw.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package size={22} />
            </div>
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="flex max-w-xl gap-2"
      >
        <Input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por código, descrição, NCM, CEST ou CFOP..."
        />

        <Button
          type="submit"
          variant="outline"
        >
          <Search size={17} />

          Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Código
              </th>

              <th className="p-4 text-left">
                Descrição
              </th>

              <th className="p-4 text-left">
                Tipo
              </th>

              <th className="p-4 text-left">
                Unidade
              </th>

              <th className="p-4 text-left">
                NCM
              </th>

              <th className="p-4 text-left">
                CFOP
              </th>

              <th className="p-4 text-left">
                Valor
              </th>

              <th className="p-4 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhum produto encontrado."
                    : "Nenhum produto cadastrado nesta empresa."}
                </td>
              </tr>
            ) : (
              produtos.map(
                (produto) => {
                  const valorUnitario =
                    Number(
                      produto.valorUnitario
                    );

                  return (
                    <tr
                      key={produto.id}
                      className="border-t transition-colors hover:bg-muted/20"
                    >
                      <td className="p-4 font-medium">
                        {produto.codigo}
                      </td>

                      <td className="p-4">
                        {produto.descricao}
                      </td>

                      <td className="p-4">
                        {produto.tipo ===
                        "SERVICO"
                          ? "Serviço"
                          : "Produto"}
                      </td>

                      <td className="p-4">
                        {produto.unidade}
                      </td>

                      <td className="p-4">
                        {produto.ncm ?? "-"}
                      </td>

                      <td className="p-4">
                        {produto.cfopPadrao ??
                          "-"}
                      </td>

                      <td className="p-4">
                        {formatarValor(
                          valorUnitario
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <ProdutoEditButton
                            empresaId={
                              empresaId
                            }
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

                              // ICMS

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

                              // PIS

                              cstPis:
                                produto.cstPis,

                              aliquotaPis:
                                Number(
                                  produto.aliquotaPis ??
                                    0
                                ),

                              // COFINS

                              cstCofins:
                                produto.cstCofins,

                              aliquotaCofins:
                                Number(
                                  produto.aliquotaCofins ??
                                    0
                                ),

                              // IPI

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

                              // IBS e CBS

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
                                  produto.aliquotaIbsMun ??
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
                            empresaId={
                              empresaId
                            }
                            produtoId={
                              produto.id
                            }
                            produtoDescricao={
                              produto.descricao
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}