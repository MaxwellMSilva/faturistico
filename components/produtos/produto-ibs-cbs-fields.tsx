"use client";

import { Input } from "@/components/ui/input";

export type ProdutoIbsCbsForm = {
  cstIbsCbs: string;
  classificacaoTributariaIbsCbs: string;
  aliquotaIbsUf: string;
  aliquotaIbsMun: string;
  aliquotaCbs: string;
};

type Props = {
  form: ProdutoIbsCbsForm;

  atualizarCampo: (
    campo: keyof ProdutoIbsCbsForm,
    valor: string
  ) => void;

  disabled?: boolean;
};

export function ProdutoIbsCbsFields({
  form,
  atualizarCampo,
  disabled = false,
}: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-semibold">
          IBS e CBS
        </h3>

        <p className="text-xs text-muted-foreground">
          Informe os códigos conforme a
          classificação tributária da
          operação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          placeholder="CST IBS/CBS"
          inputMode="numeric"
          maxLength={3}
          value={form.cstIbsCbs}
          onChange={(event) =>
            atualizarCampo(
              "cstIbsCbs",
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 3)
            )
          }
          disabled={disabled}
        />

        <Input
          placeholder="cClassTrib"
          inputMode="numeric"
          maxLength={6}
          value={
            form
              .classificacaoTributariaIbsCbs
          }
          onChange={(event) =>
            atualizarCampo(
              "classificacaoTributariaIbsCbs",
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          disabled={disabled}
        />

        <Input
          placeholder="Alíquota IBS estadual (%)"
          inputMode="decimal"
          value={form.aliquotaIbsUf}
          onChange={(event) =>
            atualizarCampo(
              "aliquotaIbsUf",
              event.target.value
            )
          }
          disabled={disabled}
        />

        <Input
          placeholder="Alíquota IBS municipal (%)"
          inputMode="decimal"
          value={form.aliquotaIbsMun}
          onChange={(event) =>
            atualizarCampo(
              "aliquotaIbsMun",
              event.target.value
            )
          }
          disabled={disabled}
        />

        <Input
          placeholder="Alíquota CBS (%)"
          inputMode="decimal"
          value={form.aliquotaCbs}
          onChange={(event) =>
            atualizarCampo(
              "aliquotaCbs",
              event.target.value
            )
          }
          className="md:col-span-2"
          disabled={disabled}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        A validação completa do CST e do
        cClassTrib será feita posteriormente
        utilizando a tabela oficial.
      </p>
    </section>
  );
}