"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";

import { addItemNfe } from "@/actions/nfe/add-item-nfe";
import { deleteItemNfe } from "@/actions/nfe/delete-item-nfe";

import { NfeDadosAdicionaisForm } from "@/components/nfe/nfe-dados-adicionais-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NfeResumoTributos } from "./nfe-resumo-tributos";
import { ValidarNfeButton } from "./validar-nfe-button";

type Produto = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: "PRODUTO" | "SERVICO";
  unidade: string;
  ncm: string | null;
  cfopPadrao: string | null;
  valorUnitario: number;
};

type Item = {
  id: string;
  produtoId: string;

  codigoProduto: string;
  descricao: string;
  unidade: string;

  ean: string | null;
  ncm: string | null;
  cest: string | null;
  cfop: string | null;

  quantidade: number;
  valorUnitario: number;
  valorBruto: number;
  valorDesconto: number;
  valorTotal: number;

  origemMercadoria: number;

  cstIcms: string | null;
  csosnIcms: string | null;

  baseCalculoIcms: number;
  aliquotaIcms: number;
  valorIcms: number;

  cstPis: string | null;
  baseCalculoPis: number;
  aliquotaPis: number;
  valorPis: number;

  cstCofins: string | null;
  baseCalculoCofins: number;
  aliquotaCofins: number;
  valorCofins: number;

  cstIpi: string | null;

  codigoEnquadramentoIpi:
    | string
    | null;

  baseCalculoIpi: number;
  aliquotaIpi: number;
  valorIpi: number;
};

type Nota = {
  id: string;

  numero: number;
  serie: number;

  status: string;

  dataEmissao: string;

  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  };

  naturezaOperacao: {
    id: string;
    descricao: string;
    cfop: string;
  } | null;

  informacoesComplementares:
    | string
    | null;

  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  valorOutros: number;
  valorBaseIcms: number;
  valorIcms: number;
  valorPis: number;
  valorCofins: number;
  valorIpi: number;
  valorTotal: number;

  itens: Item[];
};

type Props = {
  empresaId: string;
  nota: Nota;
  produtos: Produto[];
};

function formatarMoeda(
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

function converterNumero(
  valor: string
) {
  return Number(
    valor
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

export function NfeRascunhoForm({
  empresaId,
  nota,
  produtos,
}: Props) {
  const router = useRouter();

  const [produtoId, setProdutoId] =
    useState("");

  const [quantidade, setQuantidade] =
    useState("1");

  const [
    valorUnitario,
    setValorUnitario,
  ] = useState("");

  const [
    valorDesconto,
    setValorDesconto,
  ] = useState("0");

  const [carregando, setCarregando] =
    useState(false);

  const [
    itemExcluindo,
    setItemExcluindo,
  ] = useState<string | null>(null);

  const podeEditar =
    nota.status === "RASCUNHO";

  function selecionarProduto(
    id: string
  ) {
    setProdutoId(id);

    const produto =
      produtos.find(
        (item) => item.id === id
      );

    setValorUnitario(
      produto
        ? String(
            produto.valorUnitario
          )
        : ""
    );
  }

  async function handleAdicionar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!produtoId) {
      alert(
        "Selecione um produto."
      );

      return;
    }

    const quantidadeNumero =
      converterNumero(quantidade);

    const valorUnitarioNumero =
      converterNumero(
        valorUnitario
      );

    const valorDescontoNumero =
      converterNumero(
        valorDesconto || "0"
      );

    if (
      !Number.isFinite(
        quantidadeNumero
      ) ||
      quantidadeNumero <= 0
    ) {
      alert(
        "Informe uma quantidade válida."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorUnitarioNumero
      ) ||
      valorUnitarioNumero < 0
    ) {
      alert(
        "Informe um valor unitário válido."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorDescontoNumero
      ) ||
      valorDescontoNumero < 0
    ) {
      alert(
        "Informe um desconto válido."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await addItemNfe({
          empresaId,

          notaFiscalId:
            nota.id,

          produtoId,

          quantidade:
            quantidadeNumero,

          valorUnitario:
            valorUnitarioNumero,

          valorDesconto:
            valorDescontoNumero,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      setProdutoId("");
      setQuantidade("1");
      setValorUnitario("");
      setValorDesconto("0");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível adicionar o item."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluir(
    itemId: string,
    descricao: string
  ) {
    const confirmado =
      window.confirm(
        `Remover o item "${descricao}" da NF-e?`
      );

    if (!confirmado) {
      return;
    }

    try {
      setItemExcluindo(itemId);

      const resultado =
        await deleteItemNfe({
          empresaId,

          notaFiscalId:
            nota.id,

          itemId,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível remover o item."
      );
    } finally {
      setItemExcluindo(null);
    }
  }

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="outline"
      >
        <Link
          href={`/empresa/${empresaId}/nfe`}
        >
          <ArrowLeft size={17} />

          Voltar para NF-e
        </Link>
      </Button>

      {/* Cabeçalho da NF-e */}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">
              NF-e
            </p>

            <p className="font-semibold">
              {nota.numero}/
              {nota.serie}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Cliente
            </p>

            <p className="font-semibold">
              {nota.cliente.nome}
            </p>

            <p className="text-xs text-muted-foreground">
              {nota.cliente.cpfCnpj}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Natureza
            </p>

            <p className="font-semibold">
              {nota.naturezaOperacao
                ?.descricao ??
                "Não informada"}
            </p>

            {nota.naturezaOperacao && (
              <p className="text-xs text-muted-foreground">
                CFOP{" "}
                {
                  nota
                    .naturezaOperacao
                    .cfop
                }
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="font-semibold">
              {nota.status}
            </p>
          </div>
        </div>
      </div>

      {/* Adicionar item */}

      {podeEditar && (
        <form
          onSubmit={handleAdicionar}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Adicionar item
            </h2>

            <p className="text-sm text-muted-foreground">
              Selecione um produto e informe
              a quantidade, o valor e o
              desconto.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <select
              value={produtoId}
              onChange={(event) =>
                selecionarProduto(
                  event.target.value
                )
              }
              className="h-12 rounded-md border bg-background px-3 text-sm lg:col-span-2"
              disabled={carregando}
              required
            >
              <option value="">
                Selecione o produto
              </option>

              {produtos.map(
                (produto) => (
                  <option
                    key={produto.id}
                    value={produto.id}
                  >
                    {produto.codigo} —{" "}
                    {produto.descricao}
                  </option>
                )
              )}
            </select>

            <Input
              className="h-12"
              placeholder="Quantidade"
              inputMode="decimal"
              value={quantidade}
              onChange={(event) =>
                setQuantidade(
                  event.target.value
                )
              }
              disabled={carregando}
              required
            />

            <Input
              className="h-12"
              placeholder="Valor unitário"
              inputMode="decimal"
              value={valorUnitario}
              onChange={(event) =>
                setValorUnitario(
                  event.target.value
                )
              }
              disabled={carregando}
              required
            />

            <Input
              className="h-12"
              placeholder="Desconto"
              inputMode="decimal"
              value={valorDesconto}
              onChange={(event) =>
                setValorDesconto(
                  event.target.value
                )
              }
              disabled={carregando}
            />

            <Button
              type="submit"
              className="h-12 lg:col-span-3"
              disabled={carregando}
            >
              <Plus size={17} />

              {carregando
                ? "Adicionando..."
                : "Adicionar item"}
            </Button>
          </div>
        </form>
      )}

      {/* Tabela de itens */}

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
                NCM
              </th>

              <th className="p-4 text-left">
                CFOP
              </th>

              <th className="p-4 text-right">
                Quantidade
              </th>

              <th className="p-4 text-right">
                Valor unitário
              </th>

              <th className="p-4 text-right">
                Desconto
              </th>

              <th className="p-4 text-right">
                Total
              </th>

              <th className="p-4 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {nota.itens.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-muted-foreground"
                >
                  Nenhum item adicionado à
                  NF-e.
                </td>
              </tr>
            ) : (
              nota.itens.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-t transition-colors hover:bg-muted/20"
                  >
                    <td className="p-4">
                      {item.codigoProduto}
                    </td>

                    <td className="p-4">
                      <p className="font-medium">
                        {item.descricao}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Unidade:{" "}
                        {item.unidade}
                      </p>
                    </td>

                    <td className="p-4">
                      {item.ncm ?? "-"}
                    </td>

                    <td className="p-4">
                      {item.cfop ?? "-"}
                    </td>

                    <td className="p-4 text-right">
                      {item.quantidade}
                    </td>

                    <td className="p-4 text-right">
                      {formatarMoeda(
                        item.valorUnitario
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {formatarMoeda(
                        item.valorDesconto
                      )}
                    </td>

                    <td className="p-4 text-right font-medium">
                      {formatarMoeda(
                        item.valorTotal
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {podeEditar && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleExcluir(
                              item.id,
                              item.descricao
                            )
                          }
                          disabled={
                            itemExcluindo ===
                            item.id
                          }
                        >
                          <Trash2
                            size={16}
                          />

                          {itemExcluindo ===
                          item.id
                            ? "Removendo..."
                            : "Remover"}
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Dados adicionais */}

      <NfeDadosAdicionaisForm
        empresaId={empresaId}
        notaFiscalId={nota.id}
        valorFrete={nota.valorFrete}
        valorOutros={nota.valorOutros}
        informacoesComplementares={
          nota.informacoesComplementares
        }
        podeEditar={podeEditar}
      />

      {/* Resumo dos tributos */}

      <NfeResumoTributos
        valorBaseIcms={
          nota.valorBaseIcms
        }
        valorIcms={
          nota.valorIcms
        }
        valorPis={
          nota.valorPis
        }
        valorCofins={
          nota.valorCofins
        }
        valorIpi={
          nota.valorIpi
        }
      />

      {/* Totais da NF-e */}

      <div className="ml-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Totais da NF-e
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Produtos
            </span>

            <span>
              {formatarMoeda(
                nota.valorProdutos
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Descontos
            </span>

            <span>
              -{" "}
              {formatarMoeda(
                nota.valorDesconto
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Frete
            </span>

            <span>
              {formatarMoeda(
                nota.valorFrete
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Outras despesas
            </span>

            <span>
              {formatarMoeda(
                nota.valorOutros
              )}
            </span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>
              Total
            </span>

            <span>
              {formatarMoeda(
                nota.valorTotal
              )}
            </span>
          </div>
        </div>
      </div>

      {podeEditar && (
        <div className="flex justify-end">
          <ValidarNfeButton
            empresaId={empresaId}
            notaFiscalId={nota.id}
            disabled={
              nota.itens.length === 0
            }
          />
        </div>
      )}
    </div>
  );
}