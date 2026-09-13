"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  Landmark,
  LoaderCircle,
  Percent,
  RefreshCcw,
} from "lucide-react";

import { getClassificacoesRtc } from "@/actions/rtc/get-classificacoes-rtc";
import { sincronizarClassificacoesRtc } from "@/actions/rtc/sincronizar-classificacoes-rtc";
import { Button } from "@/components/ui/button";
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

type ClassificacaoRtc = {
  cst: string;
  codigo: string;
  descricao: string;
  tipoAliquota: string | null;
  reducaoIbs: number | null;
  reducaoCbs: number | null;
  tributacaoRegular: boolean | null;
};

function somenteNumeros(
  valor: string,
  limite: number
) {
  return valor
    .replace(/\D/g, "")
    .slice(0, limite);
}

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return null;
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(data);
}

export function ProdutoIbsCbsFields({
  form,
  atualizarCampo,
  disabled = false,
}: Props) {
  const params = useParams<{
    empresaId?: string;
  }>();

  const empresaId =
    typeof params?.empresaId === "string"
      ? params.empresaId
      : "";

  const [classificacoes, setClassificacoes] =
    useState<ClassificacaoRtc[]>([]);
  const [atualizadoEm, setAtualizadoEm] =
    useState<string | null>(null);
  const [desatualizada, setDesatualizada] =
    useState(true);
  const [carregandoTabela, setCarregandoTabela] =
    useState(false);
  const [sincronizando, setSincronizando] =
    useState(false);
  const [erroTabela, setErroTabela] =
    useState("");

  const carregarTabela = useCallback(
    async () => {
      if (!empresaId) {
        return;
      }

      setCarregandoTabela(true);
      setErroTabela("");

      try {
        const resultado =
          await getClassificacoesRtc(
            empresaId
          );

        if (!resultado.success) {
          setErroTabela(
            resultado.message
          );
          return;
        }

        setClassificacoes(
          resultado.classificacoes
        );
        setAtualizadoEm(
          resultado.atualizadoEm
        );
        setDesatualizada(
          resultado.desatualizada
        );
      } catch (error) {
        console.error(
          "Erro ao carregar tabela RTC:",
          error
        );

        setErroTabela(
          "Não foi possível carregar a tabela oficial de classificação tributária."
        );
      } finally {
        setCarregandoTabela(false);
      }
    },
    [empresaId]
  );

  useEffect(() => {
    void carregarTabela();
  }, [carregarTabela]);

  const classificacaoSelecionada =
    useMemo(
      () =>
        classificacoes.find(
          (item) =>
            item.codigo ===
            form.classificacaoTributariaIbsCbs
        ) ?? null,
      [
        classificacoes,
        form.classificacaoTributariaIbsCbs,
      ]
    );

  async function handleSincronizar() {
    if (!empresaId) {
      return;
    }

    setSincronizando(true);
    setErroTabela("");

    try {
      const resultado =
        await sincronizarClassificacoesRtc(
          empresaId
        );

      if (!resultado.success) {
        setErroTabela(
          resultado.message
        );
        return;
      }

      await carregarTabela();
    } catch (error) {
      console.error(
        "Erro ao sincronizar tabela RTC:",
        error
      );

      setErroTabela(
        "Não foi possível atualizar a tabela oficial da Reforma Tributária."
      );
    } finally {
      setSincronizando(false);
    }
  }

  function selecionarClassificacao(
    codigo: string
  ) {
    const classificacao =
      classificacoes.find(
        (item) =>
          item.codigo === codigo
      );

    atualizarCampo(
      "classificacaoTributariaIbsCbs",
      codigo
    );

    if (classificacao) {
      atualizarCampo(
        "cstIbsCbs",
        classificacao.cst
      );

      if (
        classificacao.cst === "000" &&
        classificacao.codigo === "000001"
      ) {
        atualizarCampo(
          "aliquotaIbsUf",
          "0,10"
        );
        atualizarCampo(
          "aliquotaIbsMun",
          "0"
        );
        atualizarCampo(
          "aliquotaCbs",
          "0,90"
        );
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Landmark size={20} />
        </div>

        <div>
          <h3 className="font-semibold">
            IBS e CBS
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Classificação tributária e
            alíquotas da Reforma Tributária
            do Consumo.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Tabela oficial CST / cClassTrib
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Fonte: SVRS Conformidade Fácil.
              {atualizadoEm
                ? ` Atualizada em ${formatarData(
                    atualizadoEm
                  )}.`
                : " Ainda não sincronizada."}
              {desatualizada && atualizadoEm
                ? " Recomenda-se atualizar a tabela."
                : ""}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSincronizar}
            disabled={
              disabled ||
              sincronizando ||
              carregandoTabela
            }
          >
            {sincronizando ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <RefreshCcw size={15} />
            )}
            Atualizar tabela
          </Button>
        </div>

        {erroTabela && (
          <p className="mt-3 text-xs text-destructive">
            {erroTabela}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">
            Classificação tributária
          </h4>

          <p className="mt-1 text-xs text-muted-foreground">
            Quando a tabela oficial estiver
            disponível, selecione o cClassTrib
            em vez de digitar o código.
          </p>
        </div>

        {classificacoes.length > 0 && (
          <label className="space-y-2">
            <span className="text-sm font-medium">
              cClassTrib oficial
            </span>

            <select
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              value={
                form.classificacaoTributariaIbsCbs
              }
              onChange={(event) =>
                selecionarClassificacao(
                  event.target.value
                )
              }
              disabled={disabled}
            >
              <option value="">
                Selecione uma classificação
              </option>

              {classificacoes.map(
                (item) => (
                  <option
                    key={item.codigo}
                    value={item.codigo}
                  >
                    {item.codigo} — {item.descricao}
                  </option>
                )
              )}
            </select>
          </label>
        )}

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
                form.classificacaoTributariaIbsCbs
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

        {classificacaoSelecionada && (
          <div className="rounded-lg border px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {classificacaoSelecionada.codigo}
            </span>
            {" — "}
            {classificacaoSelecionada.descricao}
          </div>
        )}
      </div>

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
              Em 2026, a tributação integral
              padrão utiliza IBS estadual de
              0,10%, IBS municipal de 0% e
              CBS de 0,90%.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <CampoPercentual
            label="IBS estadual"
            placeholder="0,00"
            value={form.aliquotaIbsUf}
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
            value={form.aliquotaIbsMun}
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
            value={form.aliquotaCbs}
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

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs leading-5 text-muted-foreground">
          A classificação sincronizada é usada
          como referência oficial. Operações com
          redução, diferimento, monofasia,
          crédito presumido ou tributação regular
          terão seus grupos específicos tratados
          na etapa de emissão da NF-e.
        </p>
      </div>
    </div>
  );
}

type CampoPercentualProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
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
            onChange(event.target.value)
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
