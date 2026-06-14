"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Pencil } from "lucide-react";

import { updateItemNfe } from "@/actions/nfe/update-item-nfe";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  empresaId: string;
  notaFiscalId: string;

  item: {
    id: string;

    codigoProduto: string;
    descricao: string;
    unidade: string;

    quantidade: number;
    valorUnitario: number;
    valorDesconto: number;
    valorTotal: number;
  };

  disabled?: boolean;
};

function valorParaCampo(
  valor: number
) {
  return String(valor);
}

function converterNumero(
  valor: string
) {
  const texto =
    valor.trim();

  if (!texto) {
    return 0;
  }

  if (texto.includes(",")) {
    return Number(
      texto
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  return Number(texto);
}

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

export function NfeItemEditDialog({
  empresaId,
  notaFiscalId,
  item,
  disabled = false,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  function criarEstadoInicial() {
    return {
      quantidade:
        valorParaCampo(
          item.quantidade
        ),

      valorUnitario:
        valorParaCampo(
          item.valorUnitario
        ),

      valorDesconto:
        valorParaCampo(
          item.valorDesconto
        ),
    };
  }

  const [form, setForm] =
    useState(
      criarEstadoInicial
    );

  function atualizarCampo(
    campo: keyof ReturnType<
      typeof criarEstadoInicial
    >,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  const quantidadeNumero =
    converterNumero(
      form.quantidade
    );

  const valorUnitarioNumero =
    converterNumero(
      form.valorUnitario
    );

  const valorDescontoNumero =
    converterNumero(
      form.valorDesconto
    );

  const valorBrutoCalculado =
    Number.isFinite(
      quantidadeNumero
    ) &&
    Number.isFinite(
      valorUnitarioNumero
    )
      ? quantidadeNumero *
        valorUnitarioNumero
      : 0;

  const valorTotalCalculado =
    Math.max(
      valorBrutoCalculado -
        (
          Number.isFinite(
            valorDescontoNumero
          )
            ? valorDescontoNumero
            : 0
        ),
      0
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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

    if (
      valorDescontoNumero >
      valorBrutoCalculado
    ) {
      alert(
        "O desconto não pode ser maior que o valor bruto do item."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateItemNfe({
          empresaId,
          notaFiscalId,

          itemId:
            item.id,

          quantidade:
            quantidadeNumero,

          valorUnitario:
            valorUnitarioNumero,

          valorDesconto:
            valorDescontoNumero,
        });

      if (!resultado.success) {
        alert(
          resultado.message
        );

        return;
      }

      alert(
        "Item atualizado com sucesso."
      );

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar item:",
        error
      );

      alert(
        "Não foi possível atualizar o item."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            disabled ||
            carregando
          }
        >
          <Pencil size={16} />

          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Editar item
          </DialogTitle>

          <DialogDescription>
            Atualize a quantidade, o valor
            unitário ou o desconto do item.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              Produto
            </p>

            <p className="font-medium">
              {item.codigoProduto} —{" "}
              {item.descricao}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Unidade: {item.unidade}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantidade
              </label>

              <Input
                inputMode="decimal"
                value={
                  form.quantidade
                }
                onChange={(event) =>
                  atualizarCampo(
                    "quantidade",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Valor unitário
              </label>

              <Input
                inputMode="decimal"
                value={
                  form.valorUnitario
                }
                onChange={(event) =>
                  atualizarCampo(
                    "valorUnitario",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">
                Desconto do item
              </label>

              <Input
                inputMode="decimal"
                value={
                  form.valorDesconto
                }
                onChange={(event) =>
                  atualizarCampo(
                    "valorDesconto",
                    event.target.value
                  )
                }
                disabled={carregando}
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Valor bruto
              </p>

              <p className="font-medium">
                {formatarMoeda(
                  valorBrutoCalculado
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Desconto
              </p>

              <p className="font-medium">
                {formatarMoeda(
                  Number.isFinite(
                    valorDescontoNumero
                  )
                    ? valorDescontoNumero
                    : 0
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Total estimado
              </p>

              <p className="font-semibold">
                {formatarMoeda(
                  valorTotalCalculado
                )}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Os tributos e os totais da NF-e
            serão recalculados automaticamente
            ao salvar.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}