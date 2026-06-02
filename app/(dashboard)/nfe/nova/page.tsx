import { getClientes } from "@/actions/clientes/get-clientes";
import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-natureza-operacao";
import { getProdutos } from "@/actions/produtos/get-produto";

import { NfeForm } from "@/components/nfe/nfe-form";

export const dynamic = "force-dynamic";

export default async function NovaNfePage() {
  const clientes = await getClientes();

  const naturezas =
    await getNaturezasOperacao();

  const produtos =
    await getProdutos();

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Nova NF-e
        </h1>

        <p className="text-muted-foreground">
          Emissão de Nota Fiscal Eletrônica.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">

        <div className="grid gap-4 md:grid-cols-2">

          <select className="h-10 rounded-md border px-3">
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

          <select className="h-10 rounded-md border px-3">
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

      </div>

      <div className="rounded-xl border bg-card p-6">

        <h2 className="mb-4 font-semibold">
          Itens da Nota
        </h2>

        <NfeForm
        produtos={produtos.map((produto) => ({
            id: produto.id,
            codigo: produto.codigo,
            descricao: produto.descricao,
            valorUnitario: Number(produto.valorUnitario),
        }))}
        clientes={clientes.map((cliente) => ({
            id: cliente.id,
            nome: cliente.nome,
        }))}
        naturezas={naturezas.map((natureza) => ({
            id: natureza.id,
            descricao: natureza.descricao,
        }))}
        />

      </div>

    </div>
  );
}