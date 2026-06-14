"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteNfe } from "@/actions/nfe/delete-nfe";
import { updateDadosNfe } from "@/actions/nfe/update-dados-nfe";

import { gerarXmlNfe } from "@/actions/nfe/gerar-xml";

type Props = {
  nota: any;
  clientes: any[];
  naturezas: any[];
  produtos: any[];
};

export function NfeEditForm({
  nota,
  clientes,
  naturezas,
  produtos,
}: Props) {
  const router = useRouter();

  const [editing, setEditing] =
    useState(false);

  const [clienteId, setClienteId] =
    useState(nota.clienteId);

  const [
    naturezaOperacaoId,
    setNaturezaOperacaoId,
  ] = useState(
    nota.naturezaOperacaoId ?? ""
  );

  const [itens, setItens] = useState(
    nota.itens.map((item: any) => ({
      produtoId: item.produtoId,
      descricao: item.produto.descricao,
      quantidade: Number(item.quantidade),
      valorUnitario: Number(item.valorUnitario),
    }))
  );

  const [produtoSelecionado,
    setProdutoSelecionado] =
    useState("");

  async function handleDelete() {
    const confirmado = confirm(
      "Deseja realmente excluir esta NF-e?"
    );

    if (!confirmado) return;

    try {
      await deleteNfe(nota.id);

      window.location.href = "/nfe";
    } catch (error) {
      console.error(error);

      alert("Erro ao excluir a NF-e.");
    }
  }

  async function handleSave() {
    try {
      await updateNfe({
        id: nota.id,
        clienteId,
        naturezaOperacaoId,
        itens: itens.map((item: any) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        }))
      });

      alert(
        "NF-e atualizada com sucesso."
      );

      setEditing(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao atualizar a NF-e."
      );
    }
  }

  function adicionarProduto() {
    if (!produtoSelecionado) return;

    const produto = produtos.find(
      (p: any) => p.id === produtoSelecionado
    );

    if (!produto) return;

    setItens((old: any[]) => [
      ...old,
      {
        produtoId: produto.id,
        descricao: produto.descricao,
        quantidade: 1,
        valorUnitario: Number(
          produto.valorUnitario
        ),
      },
    ]);

    setProdutoSelecionado("");
  }

  function removerItem(index: number) {
    setItens((old: any[]) =>
      old.filter((_, i) => i !== index)
    );
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

  const total = itens.reduce(
    (acc: number, item: any) =>
      acc +
      item.quantidade *
        item.valorUnitario,
    0
  );

  async function handleGerarXml() {
    const xml = await gerarXmlNfe(
      nota.id
    );

    const blob = new Blob(
      [xml],
      {
        type: "application/xml",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download = `NFe-${nota.numero}.xml`;

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          NF-e #{nota.numero}
        </h1>

        <p className="text-muted-foreground">
          Status: {nota.status}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Cliente
          </p>

          {editing ? (
            <select
              value={clienteId}
              onChange={(e) =>
                setClienteId(
                  e.target.value
                )
              }
              className="mt-2 h-10 w-full rounded-md border px-3"
            >
              {clientes.map(
                (cliente: any) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nome}
                  </option>
                )
              )}
            </select>
          ) : (
            <p className="font-semibold">
              {nota.cliente.nome}
            </p>
          )}
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Natureza
          </p>

          {editing ? (
            <select
              value={
                naturezaOperacaoId
              }
              onChange={(e) =>
                setNaturezaOperacaoId(
                  e.target.value
                )
              }
              className="mt-2 h-10 w-full rounded-md border px-3"
            >
              {naturezas.map(
                (natureza: any) => (
                  <option
                    key={natureza.id}
                    value={
                      natureza.id
                    }
                  >
                    {
                      natureza.descricao
                    }
                  </option>
                )
              )}
            </select>
          ) : (
            <p className="font-semibold">
              {nota
                .naturezaOperacao
                ?.descricao ?? "-"}
            </p>
          )}
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Itens
          </p>

          <p className="font-semibold">
            {nota.itens.length}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Total
          </p>

          <p className="font-semibold">
            R${" "}
            {Number(
              nota.valorTotal
            ).toFixed(2)}
          </p>
        </div>

      </div>

      <div className="overflow-hidden rounded-xl border">

        {editing && (
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

              {produtos.map((produto: any) => (
                <option
                  key={produto.id}
                  value={produto.id}
                >
                  {produto.codigo} - {produto.descricao}
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
        )}

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
            </tr>
          </thead>

          <tbody>

            {itens.map(
              (item: any, index: number) => (
                <tr
                  key={`${item.produtoId}-${index}`}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.descricao}
                  </td>

                  <td className="p-4">

                    {editing ? (
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
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
                    ) : (
                      item.quantidade
                    )}

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

                    {editing && (
                      <button
                        onClick={() =>
                          removerItem(index)
                        }
                        className="rounded-lg border border-red-300 px-3 py-1 text-red-600"
                      >
                        Remover
                      </button>
                    )}

                  </td>

                </tr>
              )
            )}

          </tbody>
        </table>

        <div className="flex justify-end border-t p-4">
          <div className="text-lg font-bold">
            Total da NF-e: R$ {total.toFixed(2)}
          </div>
        </div>

      </div>

      <div className="flex gap-2">

        {editing ? (
          <button
            onClick={handleSave}
            className="rounded-lg bg-green-600 px-4 py-2 text-white"
          >
            Salvar
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Editar
          </button>
        )}

        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
        >
          Excluir
        </button>

        <button
          onClick={handleGerarXml}
          className="rounded-lg border px-4 py-2"
        >
          Gerar XML
        </button>

      </div>

    </div>
  );
}