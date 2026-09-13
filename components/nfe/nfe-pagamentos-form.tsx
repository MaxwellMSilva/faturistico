"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { salvarPagamentosNfe } from "@/actions/nfe/salvar-pagamentos-nfe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pagamento = {
  id?: string;
  indicador: "A_VISTA" | "A_PRAZO";
  meioPagamento: string;
  valor: number;
  descricaoMeioPagamento: string | null;
};

type Props = {
  empresaId: string;
  notaFiscalId: string;
  valorTotal: number;
  podeEditar: boolean;
  pagamentos: Pagamento[];
};

const MEIOS_PAGAMENTO = [
  ["01", "Dinheiro"],
  ["02", "Cheque"],
  ["03", "Cartão de crédito"],
  ["04", "Cartão de débito"],
  ["05", "Crédito loja"],
  ["10", "Vale alimentação"],
  ["11", "Vale refeição"],
  ["12", "Vale presente"],
  ["13", "Vale combustível"],
  ["15", "Boleto bancário"],
  ["16", "Depósito bancário"],
  ["17", "PIX"],
  ["18", "Transferência / carteira digital"],
  ["19", "Fidelidade / cashback / crédito virtual"],
  ["90", "Sem pagamento"],
  ["99", "Outros"],
] as const;

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

function novoPagamento(
  valorTotal: number
): Pagamento {
  return {
    indicador: "A_VISTA",
    meioPagamento: "01",
    valor: valorTotal,
    descricaoMeioPagamento: null,
  };
}

export function NfePagamentosForm({
  empresaId,
  notaFiscalId,
  valorTotal,
  podeEditar,
  pagamentos,
}: Props) {
  const router = useRouter();

  const [itens, setItens] = useState<
    Pagamento[]
  >(
    pagamentos.length > 0
      ? pagamentos
      : [novoPagamento(valorTotal)]
  );

  const [salvando, setSalvando] =
    useState(false);
  const [erro, setErro] =
    useState("");
  const [mensagem, setMensagem] =
    useState("");

  const totalInformado = useMemo(
    () =>
      itens.reduce(
        (total, item) =>
          total +
          (Number.isFinite(item.valor)
            ? item.valor
            : 0),
        0
      ),
    [itens]
  );

  function atualizar(
    indice: number,
    alteracao: Partial<Pagamento>
  ) {
    setItens((anteriores) =>
      anteriores.map((item, posicao) =>
        posicao === indice
          ? { ...item, ...alteracao }
          : item
      )
    );
    setErro("");
    setMensagem("");
  }

  function adicionar() {
    setItens((anteriores) => [
      ...anteriores,
      {
        indicador: "A_VISTA",
        meioPagamento: "17",
        valor: 0,
        descricaoMeioPagamento: null,
      },
    ]);
  }

  function remover(indice: number) {
    setItens((anteriores) =>
      anteriores.filter(
        (_, posicao) =>
          posicao !== indice
      )
    );
  }

  async function salvar() {
    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resultado =
        await salvarPagamentosNfe(
          empresaId,
          notaFiscalId,
          itens.map((item) => ({
            indicador: item.indicador,
            meioPagamento:
              item.meioPagamento,
            valor: item.valor,
            descricaoMeioPagamento:
              item.descricaoMeioPagamento ??
              undefined,
          }))
        );

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setMensagem(
        "Formas de pagamento salvas."
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar pagamentos:",
        error
      );
      setErro(
        "Não foi possível salvar as formas de pagamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard size={19} />
          </div>

          <div>
            <h2 className="font-semibold">
              Pagamentos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Informe as formas de pagamento
              que serão enviadas no XML da
              NF-e.
            </p>
          </div>
        </div>

        {podeEditar && (
          <Button
            type="button"
            variant="outline"
            onClick={adicionar}
            disabled={salvando}
          >
            <Plus size={16} />
            Adicionar
          </Button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {itens.map((item, indice) => (
          <div
            key={`${item.id ?? "novo"}-${indice}`}
            className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[160px_minmax(220px,1fr)_180px_minmax(180px,1fr)_auto]"
          >
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Condição
              </span>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={item.indicador}
                onChange={(event) =>
                  atualizar(indice, {
                    indicador:
                      event.target.value as
                        | "A_VISTA"
                        | "A_PRAZO",
                  })
                }
                disabled={
                  !podeEditar || salvando
                }
              >
                <option value="A_VISTA">
                  À vista
                </option>
                <option value="A_PRAZO">
                  A prazo
                </option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Meio de pagamento
              </span>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={item.meioPagamento}
                onChange={(event) => {
                  const meio =
                    event.target.value;
                  atualizar(indice, {
                    meioPagamento: meio,
                    valor:
                      meio === "90"
                        ? 0
                        : item.valor,
                  });
                }}
                disabled={
                  !podeEditar || salvando
                }
              >
                {MEIOS_PAGAMENTO.map(
                  ([codigo, nome]) => (
                    <option
                      key={codigo}
                      value={codigo}
                    >
                      {codigo} — {nome}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Valor
              </span>
              <Input
                className="h-10"
                type="number"
                min="0"
                step="0.01"
                value={item.valor}
                onChange={(event) =>
                  atualizar(indice, {
                    valor: Number(
                      event.target.value
                    ),
                  })
                }
                disabled={
                  !podeEditar ||
                  salvando ||
                  item.meioPagamento === "90"
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Descrição
              </span>
              <Input
                className="h-10"
                placeholder={
                  item.meioPagamento === "99"
                    ? "Descreva o pagamento"
                    : "Não se aplica"
                }
                value={
                  item.descricaoMeioPagamento ??
                  ""
                }
                onChange={(event) =>
                  atualizar(indice, {
                    descricaoMeioPagamento:
                      event.target.value,
                  })
                }
                disabled={
                  !podeEditar ||
                  salvando ||
                  item.meioPagamento !== "99"
                }
              />
            </label>

            {podeEditar && (
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover pagamento"
                  onClick={() =>
                    remover(indice)
                  }
                  disabled={
                    salvando ||
                    itens.length === 1
                  }
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">
            Total da NF-e: {" "}
          </span>
          <strong>
            {formatarMoeda(valorTotal)}
          </strong>
          <span className="mx-2 text-muted-foreground">
            •
          </span>
          <span className="text-muted-foreground">
            Pagamentos: {" "}
          </span>
          <strong>
            {formatarMoeda(totalInformado)}
          </strong>
        </div>

        {podeEditar && (
          <Button
            type="button"
            onClick={salvar}
            disabled={
              salvando || itens.length === 0
            }
          >
            {salvando ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}
            Salvar pagamentos
          </Button>
        )}
      </div>

      {erro && (
        <p className="mt-4 text-sm text-destructive">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
          {mensagem}
        </p>
      )}
    </section>
  );
}
