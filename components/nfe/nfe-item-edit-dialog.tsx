"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Calculator,
  LoaderCircle,
  Package,
  Pencil,
  Save,
  X,
} from "lucide-react";

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
  return String(valor).replace(
    ".",
    ","
  );
}

function converterNumero(
  valor: string
) {
  const texto = valor.trim();

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
  ).format(
    Number.isFinite(valor)
      ? valor
      : 0
  );
}

export function NfeItemEditDialog({
  empresaId,
  notaFiscalId,
  item,
  disabled = false,
}: Props) {
  const router = useRouter();

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

  type FormItem = ReturnType<
    typeof criarEstadoInicial
  >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [form, setForm] =
    useState<FormItem>(
      criarEstadoInicial
    );

  function atualizarCampo(
    campo: keyof FormItem,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
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

  const valoresPrincipaisValidos =
    Number.isFinite(
      quantidadeNumero
    ) &&
    Number.isFinite(
      valorUnitarioNumero
    );

  const valorBrutoCalculado =
    valoresPrincipaisValidos
      ? quantidadeNumero *
        valorUnitarioNumero
      : 0;

  const descontoValido =
    Number.isFinite(
      valorDescontoNumero
    )
      ? valorDescontoNumero
      : 0;

  const valorTotalCalculado =
    Math.max(
      valorBrutoCalculado -
        descontoValido,
      0
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    if (
      !Number.isFinite(
        quantidadeNumero
      ) ||
      quantidadeNumero <= 0
    ) {
      setErro(
        "Informe uma quantidade válida e maior que zero."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorUnitarioNumero
      ) ||
      valorUnitarioNumero < 0
    ) {
      setErro(
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
      setErro(
        "Informe um desconto válido."
      );

      return;
    }

    if (
      valorDescontoNumero >
      valorBrutoCalculado
    ) {
      setErro(
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

          itemId: item.id,

          quantidade:
            quantidadeNumero,

          valorUnitario:
            valorUnitarioNumero,

          valorDesconto:
            valorDescontoNumero,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar item:",
        error
      );

      setErro(
        "Não foi possível atualizar o item. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const identificador =
    item.id.replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          setErro("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              disabled ||
              carregando
            }
          />
        }
      >
        <Pencil size={16} />

        Editar
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Editar item
          </DialogTitle>

          <DialogDescription>
            Atualize a quantidade, o valor
            unitário ou o desconto. Os
            tributos serão recalculados
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Produto */}

          <section className="rounded-xl border bg-muted/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Produto
                </p>

                <p className="mt-1 font-medium">
                  {item.codigoProduto} —{" "}
                  {item.descricao}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Unidade comercial:{" "}
                  {item.unidade}
                </p>
              </div>
            </div>
          </section>

          {/* Campos */}

          <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
            <div className="mb-5">
              <h3 className="font-semibold">
                Valores do item
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Informe os valores comerciais
                utilizados no recálculo do
                item.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`quantidade-${identificador}`}
                  className="text-sm font-medium"
                >
                  Quantidade
                </label>

                <Input
                  id={`quantidade-${identificador}`}
                  className="h-11"
                  placeholder="1"
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

                <p className="text-xs text-muted-foreground">
                  Unidade: {item.unidade}
                </p>
              </div>

              <CampoMoeda
                id={`valor-unitario-${identificador}`}
                label="Valor unitário"
                value={
                  form.valorUnitario
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "valorUnitario",
                    valor
                  )
                }
                disabled={carregando}
                required
              />

              <div className="md:col-span-2">
                <CampoMoeda
                  id={`desconto-${identificador}`}
                  label="Desconto do item"
                  value={
                    form.valorDesconto
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "valorDesconto",
                      valor
                    )
                  }
                  disabled={carregando}
                />
              </div>
            </div>
          </section>

          {/* Cálculo */}

          <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator size={18} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Cálculo estimado
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Prévia comercial antes do
                  recálculo tributário.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <ResumoValor
                titulo="Valor bruto"
                valor={formatarMoeda(
                  valorBrutoCalculado
                )}
              />

              <ResumoValor
                titulo="Desconto"
                valor={formatarMoeda(
                  descontoValido
                )}
              />

              <ResumoValor
                titulo="Total estimado"
                valor={formatarMoeda(
                  valorTotalCalculado
                )}
                destaque
              />
            </div>
          </section>

          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
            Ao salvar, o sistema recalculará
            ICMS, PIS, COFINS, IPI, IBS, CBS
            e os totais gerais da NF-e
            conforme os dados fiscais do
            produto.
          </div>

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
            </div>
          )}

          <DialogFooter className="border-t pt-5 sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">
                Revise os valores antes de
                salvar as alterações do item.
              </p>
            </div>

            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() =>
                  setAberto(false)
                }
                disabled={carregando}
              >
                <X size={17} />

                Cancelar
              </Button>

              <Button
                type="submit"
                className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-48"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    Salvar alterações
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CampoMoedaProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;
};

function CampoMoeda({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}: CampoMoedaProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          R$
        </span>

        <Input
          id={id}
          className="h-11 pl-10"
          placeholder="0,00"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
}

type ResumoValorProps = {
  titulo: string;
  valor: string;
  destaque?: boolean;
};

function ResumoValor({
  titulo,
  valor,
  destaque = false,
}: ResumoValorProps) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">
        {titulo}
      </p>

      <p
        className={[
          "mt-1",
          destaque
            ? "font-bold text-primary"
            : "font-medium",
        ].join(" ")}
      >
        {valor}
      </p>
    </div>
  );
}