"use client";

import {
  Landmark,
  Percent,
} from "lucide-react";

import { Input } from "@/components/ui/input";

export type ProdutoIbsCbsForm = {
  cstIbsCbs: string;

  classificacaoTributariaIbsCbs:
    string;

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

function somenteNumeros(
  valor: string,
  limite: number
) {
  return valor
    .replace(/\D/g, "")
    .slice(0, limite);
}

export function ProdutoIbsCbsFields({
  form,
  atualizarCampo,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Landmark size={20} />
        </div>

        <div>
          <h3 className="font-semibold">
            IBS e CBS
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Informe a classificação
            tributária e as alíquotas
            aplicáveis ao produto.
          </p>
        </div>
      </div>

      {/* Códigos */}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">
            Classificação tributária
          </h4>

          <p className="mt-1 text-xs text-muted-foreground">
            Os códigos devem ser informados
            somente com números.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">
              CST IBS/CBS
            </span>

            <Input
              className="h-11"
              placeholder="000"
              inputMode="numeric"
              maxLength={3}
              autoComplete="off"
              value={form.cstIbsCbs}
              onChange={(event) =>
                atualizarCampo(
                  "cstIbsCbs",
                  somenteNumeros(
                    event.target.value,
                    3
                  )
                )
              }
              disabled={disabled}
            />

            <span className="block text-xs text-muted-foreground">
              Código com 3 números.
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Classificação tributária
            </span>

            <Input
              className="h-11"
              placeholder="000001"
              inputMode="numeric"
              maxLength={6}
              autoComplete="off"
              value={
                form
                  .classificacaoTributariaIbsCbs
              }
              onChange={(event) =>
                atualizarCampo(
                  "classificacaoTributariaIbsCbs",
                  somenteNumeros(
                    event.target.value,
                    6
                  )
                )
              }
              disabled={disabled}
            />

            <span className="block text-xs text-muted-foreground">
              Campo cClassTrib com 6 números.
            </span>
          </label>
        </div>
      </div>

      {/* Alíquotas */}

      <div className="space-y-4 border-t pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Percent size={17} />
          </div>

          <div>
            <h4 className="text-sm font-medium">
              Alíquotas
            </h4>

            <p className="mt-1 text-xs text-muted-foreground">
              Informe os percentuais
              utilizando ponto ou vírgula.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <CampoPercentual
            label="IBS estadual"
            placeholder="0,00"
            value={
              form.aliquotaIbsUf
            }
            onChange={(valor) =>
              atualizarCampo(
                "aliquotaIbsUf",
                valor
              )
            }
            disabled={disabled}
          />

          <CampoPercentual
            label="IBS municipal"
            placeholder="0,00"
            value={
              form.aliquotaIbsMun
            }
            onChange={(valor) =>
              atualizarCampo(
                "aliquotaIbsMun",
                valor
              )
            }
            disabled={disabled}
          />

          <CampoPercentual
            label="CBS"
            placeholder="0,00"
            value={
              form.aliquotaCbs
            }
            onChange={(valor) =>
              atualizarCampo(
                "aliquotaCbs",
                valor
              )
            }
            disabled={disabled}
          />
        </div>
      </div>

      {/* Aviso */}

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs leading-5 text-muted-foreground">
          Nesta etapa, o sistema valida o
          formato do CST IBS/CBS e do
          cClassTrib. A compatibilidade entre
          os códigos será validada
          posteriormente utilizando a tabela
          oficial.
        </p>
      </div>
    </div>
  );
}

type CampoPercentualProps = {
  label: string;
  placeholder: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoPercentual({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: CampoPercentualProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">
        {label}
      </span>

      <div className="relative">
        <Input
          className="h-11 pr-10"
          placeholder={placeholder}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      </div>
    </label>
  );
}