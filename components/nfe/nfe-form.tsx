"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { createNfe } from "@/actions/nfe/create-nfe";
import { Button } from "@/components/ui/button";

type Produto = {
  id: string;
  codigo: string;
  descricao: string;
  valorUnitario: number;
};

type Cliente = {
  id: string;
  nome: string;
};

type NaturezaOperacao = {
  id: string;
  descricao: string;
};

type ItemNfe = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

type Props = {
  produtos: Produto[];
  clientes: Cliente[];
  naturezas: NaturezaOperacao[];
};

export function NfeForm({
  produtos,
  clientes,
  naturezas,
}: Props) {
  const [clienteId, setClienteId] =
    useState("");

  const [
    naturezaOperacaoId,
    setNaturezaOperacaoId,
  ] = useState("");

  const [
    produtoSelecionado,
    setProdutoSelecionado,
  ] = useState("");

  const [itens, setItens] = useState<
    ItemNfe[]
  >([]);

  const router = useRouter();

    async function handleSave() {
        if (!clienteId) {
            alert("Selecione o cliente.");
            return;
        }

        if (!naturezaOperacaoId) {
            alert("Selecione a natureza de operação.");
            return;
        }

        if (itens.length === 0) {
            alert("Adicione pelo menos um item.");
            return;
        }

        await createNfe({
            clienteId,
            naturezaOperacaoId,
            itens: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            })),
        });

        alert("NF-e salva como rascunho.");

        router.push("/nfe");
    }

  function adicionarProduto() {
    if (!produtoSelecionado) return;

    const produto = produtos.find(
      (p) => p.id === produtoSelecionado
    );

    if (!produto) return;

    setItens((old) => [
      ...old,
      {
        produtoId: produto.id,
        descricao: produto.descricao,
        quantidade: 1,
        valorUnitario:
          produto.valorUnitario,
      },
    ]);

    setProdutoSelecionado("");
  }

  function alterarQuantidade(
    index: number,
    quantidade: number
  ) {
    const novosItens = [...itens];

    novosItens[index].quantidade =
      quantidade <= 0 ? 1 : quantidade;

    setItens(novosItens);
  }

  function removerItem(index: number) {
    setItens((old) =>
      old.filter((_, i) => i !== index)
    );
  }

  const totalProdutos = useMemo(() => {
    return itens.reduce(
      (acc, item) =>
        acc +
        item.quantidade *
          item.valorUnitario,
      0
    );
  }, [itens]);

  return (
    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2">

        <select
          value={clienteId}
          onChange={(e) =>
            setClienteId(e.target.value)
          }
          className="h-10 rounded-md border px-3"
        >
          <option value="">
            Selecione o Cliente
          </option>

          {clientes.map((cliente) => (
            <option
              key={cliente.id}
              value={cliente.id}
            >
              {cliente.nome}
            </option>
          ))}
        </select>

        <select
          value={naturezaOperacaoId}
          onChange={(e) =>
            setNaturezaOperacaoId(
              e.target.value
            )
          }
          className="h-10 rounded-md border px-3"
        >
          <option value="">
            Natureza de Operação
          </option>

          {naturezas.map((natureza) => (
            <option
              key={natureza.id}
              value={natureza.id}
            >
              {natureza.descricao}
            </option>
          ))}
        </select>

      </div>

      <div className="flex gap-3">

        <select
          value={produtoSelecionado}
          onChange={(e) =>
            setProdutoSelecionado(
              e.target.value
            )
          }
          className="h-10 flex-1 rounded-md border px-3"
        >
          <option value="">
            Selecione um produto
          </option>

          {produtos.map((produto) => (
            <option
              key={produto.id}
              value={produto.id}
            >
              {produto.codigo} -{" "}
              {produto.descricao}
            </option>
          ))}
        </select>

        <button
          onClick={adicionarProduto}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Adicionar
        </button>

      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Produto
              </th>

              <th className="p-4 text-left">
                Quantidade
              </th>

              <th className="p-4 text-left">
                Valor Unitário
              </th>

              <th className="p-4 text-left">
                Total
              </th>

              <th className="p-4 text-left">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nenhum item adicionado
                </td>
              </tr>
            ) : (
              itens.map((item, index) => (
                <tr
                  key={`${item.produtoId}-${index}`}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.descricao}
                  </td>

                  <td className="p-4">
                    <input
                      type="number"
                      min={1}
                      value={
                        item.quantidade
                      }
                      onChange={(e) =>
                        alterarQuantidade(
                          index,
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-24 rounded-md border px-2 py-1"
                    />
                  </td>

                  <td className="p-4">
                    R$ {item.valorUnitario.toFixed(2)}
                  </td>

                  <td className="p-4">
                    R$ {(
                      item.quantidade *
                      item.valorUnitario
                    ).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        removerItem(index)
                      }
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex justify-between text-lg">
          <span>
            Valor dos Produtos
          </span>

          <strong>
            R$ {totalProdutos.toFixed(2)}
          </strong>
        </div>

        <div className="mt-3 flex justify-between text-xl font-bold">
          <span>Total NF-e</span>

          <span>
            R$ {totalProdutos.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
            Salvar Rascunho
        </Button>
      </div>

    </div>
  );
}