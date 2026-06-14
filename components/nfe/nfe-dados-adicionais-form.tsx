"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Save } from "lucide-react";

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
      String(valorFrete)
    );

  const [
    outrasDespesas,
    setOutrasDespesas,
  ] = useState(
    String(valorOutros)
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const valorFreteNumero =
      Number(
        frete
          .replace(/\./g, "")
          .replace(",", ".")
      );

    const valorOutrosNumero =
      Number(
        outrasDespesas
          .replace(/\./g, "")
          .replace(",", ".")
      );

    if (
      !Number.isFinite(
        valorFreteNumero
      ) ||
      valorFreteNumero < 0
    ) {
      alert(
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
      alert(
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
            informacoes,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Dados da NF-e atualizados com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível atualizar a NF-e."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Dados adicionais
        </h2>

        <p className="text-sm text-muted-foreground">
          Informe frete, outras despesas
          e observações da NF-e.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          className="h-12"
          placeholder="Valor do frete"
          inputMode="decimal"
          value={frete}
          onChange={(event) =>
            setFrete(
              event.target.value
            )
          }
          disabled={
            carregando ||
            !podeEditar
          }
        />

        <Input
          className="h-12"
          placeholder="Outras despesas"
          inputMode="decimal"
          value={outrasDespesas}
          onChange={(event) =>
            setOutrasDespesas(
              event.target.value
            )
          }
          disabled={
            carregando ||
            !podeEditar
          }
        />

        <textarea
          placeholder="Informações complementares"
          value={informacoes}
          onChange={(event) =>
            setInformacoes(
              event.target.value
            )
          }
          className="min-h-32 w-full resize-y rounded-md border bg-background p-3 text-sm md:col-span-2"
          disabled={
            carregando ||
            !podeEditar
          }
        />
      </div>

      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={carregando}
          >
            <Save size={17} />

            {carregando
              ? "Salvando..."
              : "Salvar dados adicionais"}
          </Button>
        </div>
      )}
    </form>
  );
}