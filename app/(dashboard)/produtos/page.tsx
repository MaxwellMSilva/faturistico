import { getProdutos } from "@/actions/produtos/get-produto";

import { NovoProdutoDialog } from "@/components/produtos/novo-produto-dialog";
import { ProdutoDeleteButton } from "@/components/produtos/produto-delete-button";
import { ProdutoEditButton } from "@/components/produtos/produto-edit-button";

import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const produtosRaw = await getProdutos();

  const produtos = JSON.parse(
    JSON.stringify(produtosRaw)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Produtos
        </h1>

        <p className="text-muted-foreground">
          Gerencie produtos e serviços.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de Produtos
          </p>

          <h2 className="text-3xl font-bold">
            {produtos.length}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar produto..."
          className="max-w-sm"
        />

        <NovoProdutoDialog />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">Código</th>
              <th className="p-4 text-left">Descrição</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-left">NCM</th>
              <th className="p-4 text-left">Valor</th>
              <th className="p-4 text-left">Estoque</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              produtos.map((produto: any) => (
                <tr
                  key={produto.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    {produto.codigo}
                  </td>

                  <td className="p-4">
                    {produto.descricao}
                  </td>

                  <td className="p-4">
                    {produto.tipo}
                  </td>

                  <td className="p-4">
                    {produto.ncm ?? "-"}
                  </td>

                  <td className="p-4">
                    R$ {Number(produto.valorUnitario).toFixed(2)}
                  </td>

                  <td className="p-4">
                    {Number(produto.estoqueAtual ?? 0).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <ProdutoEditButton
                        id={produto.id}
                        codigo={produto.codigo}
                        descricao={produto.descricao}
                        tipo={produto.tipo}
                        unidade={produto.unidade}
                        ncm={produto.ncm}
                        cfopPadrao={produto.cfopPadrao}
                        valorUnitario={Number(produto.valorUnitario)}
                      />

                      <ProdutoDeleteButton
                        id={produto.id}
                        descricao={produto.descricao}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}