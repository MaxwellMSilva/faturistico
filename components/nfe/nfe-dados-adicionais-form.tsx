"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  BadgeCheck,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  ReceiptText,
  Save,
  Truck,
} from "lucide-react";

import { updateDadosNfe } from "@/actions/nfe/update-dados-nfe";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  empresaId: string;
  notaFiscalId: string;

  valorFrete: number;
  valorOutros: number;

  informacoesComplementares:
    | string
    | null;

  podeEditar: boolean;
};

function valorParaCampo(
  valor: number
) {
  if (!Number.isFinite(valor)) {
    return "0,00";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(valor);
}

function formatarValorMonetario(
  valor: string
) {
  const numeros = valor
    .replace(/\D/g, "")
    .slice(0, 15);

  if (!numeros) {
    return "0,00";
  }

  const valorNumerico =
    Number(numeros) / 100;

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(valorNumerico);
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

export function NfeDadosAdicionaisForm({
  empresaId,
  notaFiscalId,
  valorFrete,
  valorOutros,
  informacoesComplementares,
  podeEditar,
}: Props) {
  const router = useRouter();

  const [frete, setFrete] =
    useState(
      valorParaCampo(valorFrete)
    );

  const [
    outrasDespesas,
    setOutrasDespesas,
  ] = useState(
    valorParaCampo(valorOutros)
  );

  const [
    informacoes,
    setInformacoes,
  ] = useState(
    informacoesComplementares ?? ""
  );

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  useEffect(() => {
    setFrete(
      valorParaCampo(valorFrete)
    );

    setOutrasDespesas(
      valorParaCampo(valorOutros)
    );

    setInformacoes(
      informacoesComplementares ??
        ""
    );
  }, [
    valorFrete,
    valorOutros,
    informacoesComplementares,
  ]);

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    if (!podeEditar) {
      setErro(
        "Esta NF-e não pode mais ser editada."
      );

      return;
    }

    const valorFreteNumero =
      converterNumero(frete);

    const valorOutrosNumero =
      converterNumero(
        outrasDespesas
      );

    if (
      !Number.isFinite(
        valorFreteNumero
      ) ||
      valorFreteNumero < 0
    ) {
      setErro(
        "Informe um valor de frete válido."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorOutrosNumero
      ) ||
      valorOutrosNumero < 0
    ) {
      setErro(
        "Informe um valor válido para outras despesas."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateDadosNfe({
          empresaId,
          notaFiscalId,

          valorFrete:
            valorFreteNumero,

          valorOutros:
            valorOutrosNumero,

          informacoesComplementares:
            informacoes.trim(),
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setMensagem(
        "Dados adicionais salvos com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar dados da NF-e:",
        error
      );

      setErro(
        "Não foi possível atualizar os dados da NF-e. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const bloqueado =
    carregando ||
    !podeEditar;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      {/* Cabeçalho */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Dados adicionais
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Informe os valores de frete,
              outras despesas e as
              informações complementares
              da NF-e.
            </p>
          </div>
        </div>

        {!podeEditar && (
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <LockKeyhole size={13} />

            Somente leitura
          </span>
        )}
      </div>

      {/* Valores */}

      <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
        <div className="mb-5">
          <h3 className="font-semibold">
            Valores adicionais
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Estes valores participam do
            cálculo total da nota fiscal.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <CampoMoeda
            id={`frete-${notaFiscalId}`}
            label="Valor do frete"
            descricao="Valor cobrado pelo transporte das mercadorias."
            icone={Truck}
            value={frete}
            onChange={(valor) => {
              setFrete(valor);
              limparMensagens();
            }}
            disabled={bloqueado}
          />

          <CampoMoeda
            id={`outras-despesas-${notaFiscalId}`}
            label="Outras despesas"
            descricao="Seguro, despesas acessórias e demais acréscimos."
            icone={ReceiptText}
            value={outrasDespesas}
            onChange={(valor) => {
              setOutrasDespesas(
                valor
              );

              limparMensagens();
            }}
            disabled={bloqueado}
          />
        </div>
      </section>

      {/* Informações complementares */}

      <section className="mt-5 rounded-xl border bg-muted/10 p-4 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareText
              size={17}
            />
          </div>

          <div>
            <h3 className="font-semibold">
              Informações complementares
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Texto adicional que será
              incluído nas informações da
              NF-e.
            </p>
          </div>
        </div>

        <label
          htmlFor={`informacoes-${notaFiscalId}`}
          className="sr-only"
        >
          Informações complementares
        </label>

        <textarea
          id={`informacoes-${notaFiscalId}`}
          placeholder="Ex.: dados bancários, número do pedido, observações fiscais ou informações de entrega..."
          value={informacoes}
          onChange={(event) => {
            setInformacoes(
              event.target.value
            );

            limparMensagens();
          }}
          className="min-h-36 w-full resize-y rounded-md border bg-background px-3 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={bloqueado}
        />
      </section>

      {/* Mensagens */}

      <div
        aria-live="polite"
        className="mt-5 space-y-3"
      >
        {mensagem && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <BadgeCheck
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{mensagem}</p>
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{erro}</p>
          </div>
        )}
      </div>

      {/* Ações */}

      {podeEditar && (
        <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Revise os valores e as
              informações antes de salvar.
            </p>
          </div>

          <Button
            type="submit"
            className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-56"
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

                Salvar dados adicionais
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

type CampoMoedaProps = {
  id: string;
  label: string;
  descricao: string;

  icone: typeof Truck;

  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoMoeda({
  id,
  label,
  descricao,
  icone: Icone,
  value,
  onChange,
  disabled = false,
}: CampoMoedaProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <Icone
          size={16}
          className="text-muted-foreground"
        />

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
          inputMode="numeric"
          value={value}
          onFocus={(event) =>
            event.currentTarget.select()
          }
          onChange={(event) =>
            onChange(
              formatarValorMonetario(
                event.target.value
              )
            )
          }
          disabled={disabled}
        />
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}