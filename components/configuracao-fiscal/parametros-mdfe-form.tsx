"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  LoaderCircle,
  Save,
  ShieldAlert,
  Truck,
} from "lucide-react";

import { updateParametrosMdfe } from "@/actions/configuracao-fiscal/update-parametros-mdfe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AmbienteFiscal =
  | "HOMOLOGACAO"
  | "PRODUCAO";

type TipoEmissaoMdfe =
  | "NORMAL"
  | "CONTINGENCIA";

type ModalMdfe =
  | "RODOVIARIO"
  | "AEREO"
  | "AQUAVIARIO"
  | "FERROVIARIO";

type TipoEmitenteMdfe =
  | "PRESTADOR_SERVICO_TRANSPORTE"
  | "TRANSPORTADOR_CARGA_PROPRIA"
  | "PRESTADOR_SERVICO_CTE_GLOBALIZADO";

type ConfiguracaoMdfe = {
  ambiente: AmbienteFiscal;
  modeloMdfe: number;
  ambienteMdfe: AmbienteFiscal;
  tipoEmissaoMdfe: string;
  modalMdfe: string;
  tipoEmitenteMdfe: string;
  serieMdfe: number;
  ultimoNumeroMdfe: number;
  numeracaoManualMdfe: boolean;
};

type Props = {
  empresaId: string;
  configuracao: ConfiguracaoMdfe | null;
};

function criarEstadoInicial(
  configuracao: ConfiguracaoMdfe | null
) {
  return {
    ambienteMdfe:
      configuracao?.ambienteMdfe ??
      configuracao?.ambiente ??
      ("HOMOLOGACAO" as AmbienteFiscal),
    tipoEmissaoMdfe:
      (configuracao?.tipoEmissaoMdfe ??
        "NORMAL") as TipoEmissaoMdfe,
    modalMdfe:
      (configuracao?.modalMdfe ??
        "RODOVIARIO") as ModalMdfe,
    tipoEmitenteMdfe:
      (configuracao?.tipoEmitenteMdfe ??
        "PRESTADOR_SERVICO_TRANSPORTE") as TipoEmitenteMdfe,
    serieMdfe: String(
      configuracao?.serieMdfe ?? 1
    ),
    numeracaoManualMdfe:
      configuracao?.numeracaoManualMdfe ??
      false,
    atualizarUltimoNumeroMdfe: false,
    ultimoNumeroMdfe: String(
      configuracao?.ultimoNumeroMdfe ?? 0
    ),
  };
}

type FormMdfe = ReturnType<
  typeof criarEstadoInicial
>;

export function ParametrosMdfeForm({
  empresaId,
  configuracao,
}: Props) {
  const router = useRouter();

  const [form, setForm] =
    useState<FormMdfe>(
      criarEstadoInicial(configuracao)
    );
  const [carregando, setCarregando] =
    useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] =
    useState("");

  useEffect(() => {
    setForm(
      criarEstadoInicial(configuracao)
    );
  }, [configuracao]);

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function atualizarCampo<
    Campo extends keyof FormMdfe,
  >(
    campo: Campo,
    valor: FormMdfe[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
    limparMensagens();
  }

  function atualizarSerieMdfe(
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      serieMdfe: valor,
      atualizarUltimoNumeroMdfe: false,
      ultimoNumeroMdfe: "",
    }));
    limparMensagens();
  }

  function alternarUltimoNumeroMdfe(
    marcado: boolean
  ) {
    const mesmaSerie =
      configuracao &&
      String(configuracao.serieMdfe) ===
        form.serieMdfe;

    setForm((anterior) => ({
      ...anterior,
      atualizarUltimoNumeroMdfe: marcado,
      ultimoNumeroMdfe: marcado
        ? anterior.ultimoNumeroMdfe ||
          String(
            mesmaSerie
              ? configuracao?.ultimoNumeroMdfe ?? 0
              : 0
          )
        : anterior.ultimoNumeroMdfe,
    }));
    limparMensagens();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    limparMensagens();

    if (!configuracao) {
      setErro(
        "Salve primeiro a configuração fiscal geral da empresa."
      );
      return;
    }

    const serieMdfe = Number(form.serieMdfe);
    const ultimoNumeroMdfe =
      Number(form.ultimoNumeroMdfe);

    if (
      !Number.isInteger(serieMdfe) ||
      serieMdfe < 0 ||
      serieMdfe > 999
    ) {
      setErro(
        "Informe uma série de MDF-e entre 0 e 999."
      );
      return;
    }

    if (
      form.atualizarUltimoNumeroMdfe &&
      (
        !Number.isInteger(ultimoNumeroMdfe) ||
        ultimoNumeroMdfe < 0 ||
        ultimoNumeroMdfe > 999_999_999
      )
    ) {
      setErro(
        "Informe um último número de MDF-e entre 0 e 999999999."
      );
      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateParametrosMdfe({
          empresaId,
          modeloMdfe: 58,
          ambienteMdfe: form.ambienteMdfe,
          tipoEmissaoMdfe:
            form.tipoEmissaoMdfe,
          modalMdfe: form.modalMdfe,
          tipoEmitenteMdfe:
            form.tipoEmitenteMdfe,
          serieMdfe,
          numeracaoManualMdfe:
            form.numeracaoManualMdfe,
          atualizarUltimoNumeroMdfe:
            form.atualizarUltimoNumeroMdfe,
          ultimoNumeroMdfe:
            form.atualizarUltimoNumeroMdfe
              ? ultimoNumeroMdfe
              : undefined,
        });

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setForm((anterior) => ({
        ...anterior,
        atualizarUltimoNumeroMdfe: false,
      }));
      setMensagem(
        "Parâmetros de MDF-e salvos com sucesso."
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar parâmetros do MDF-e:",
        error
      );
      setErro(
        "Não foi possível salvar os parâmetros do MDF-e."
      );
    } finally {
      setCarregando(false);
    }
  }

  const mesmaSerie =
    configuracao
      ? String(configuracao.serieMdfe) ===
        form.serieMdfe
      : false;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Truck size={20} />
          </div>

          <div>
            <h3 className="font-semibold">
              Parâmetros de MDF-e
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Configure os padrões do Manifesto Eletrônico de Documentos Fiscais, modelo 58.
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <BadgeCheck size={14} />
          Modelo 58
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="modeloMdfe"
            className="text-sm font-medium"
          >
            Modelo MDF-e
          </label>
          <Input
            id="modeloMdfe"
            className="h-11"
            value="58 — MDF-e"
            disabled
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            O MDF-e utiliza o modelo fiscal 58.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="ambienteMdfe"
            className="text-sm font-medium"
          >
            Ambiente MDF-e
          </label>
          <select
            id="ambienteMdfe"
            value={form.ambienteMdfe}
            onChange={(event) =>
              atualizarCampo(
                "ambienteMdfe",
                event.target.value as AmbienteFiscal
              )
            }
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="HOMOLOGACAO">
              Homologação
            </option>
            <option value="PRODUCAO">
              Produção
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="serieMdfe"
            className="text-sm font-medium"
          >
            Série do MDF-e
          </label>
          <Input
            id="serieMdfe"
            className="h-11"
            type="number"
            min={0}
            max={999}
            step={1}
            inputMode="numeric"
            value={form.serieMdfe}
            onChange={(event) =>
              atualizarSerieMdfe(
                event.target.value
              )
            }
            disabled={carregando}
            required
          />
          <p className="text-xs text-muted-foreground">
            Série utilizada na numeração dos MDF-e.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tipoEmissaoMdfe"
            className="text-sm font-medium"
          >
            Tipo de emissão
          </label>
          <select
            id="tipoEmissaoMdfe"
            value={form.tipoEmissaoMdfe}
            onChange={(event) =>
              atualizarCampo(
                "tipoEmissaoMdfe",
                event.target.value as TipoEmissaoMdfe
              )
            }
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="NORMAL">
              Normal
            </option>
            <option value="CONTINGENCIA">
              Contingência
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="modalMdfe"
            className="text-sm font-medium"
          >
            Modal padrão
          </label>
          <select
            id="modalMdfe"
            value={form.modalMdfe}
            onChange={(event) =>
              atualizarCampo(
                "modalMdfe",
                event.target.value as ModalMdfe
              )
            }
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="RODOVIARIO">
              Rodoviário
            </option>
            <option value="AEREO">
              Aéreo
            </option>
            <option value="AQUAVIARIO">
              Aquaviário
            </option>
            <option value="FERROVIARIO">
              Ferroviário
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tipoEmitenteMdfe"
            className="text-sm font-medium"
          >
            Tipo de emitente padrão
          </label>
          <select
            id="tipoEmitenteMdfe"
            value={form.tipoEmitenteMdfe}
            onChange={(event) =>
              atualizarCampo(
                "tipoEmitenteMdfe",
                event.target.value as TipoEmitenteMdfe
              )
            }
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="PRESTADOR_SERVICO_TRANSPORTE">
              Prestador de serviço de transporte
            </option>
            <option value="TRANSPORTADOR_CARGA_PROPRIA">
              Transportador de carga própria
            </option>
            <option value="PRESTADOR_SERVICO_CTE_GLOBALIZADO">
              Prestador de serviço — CT-e globalizado
            </option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <input
              id="numeracaoManualMdfe"
              type="checkbox"
              checked={form.numeracaoManualMdfe}
              onChange={(event) =>
                atualizarCampo(
                  "numeracaoManualMdfe",
                  event.target.checked
                )
              }
              disabled={carregando}
              className="mt-1 h-4 w-4 rounded border"
            />
            <div>
              <label
                htmlFor="numeracaoManualMdfe"
                className="cursor-pointer text-sm font-medium"
              >
                Permitir numeração manual
              </label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Quando a emissão do MDF-e estiver disponível, permite editar o número antes da emissão.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <input
              id="atualizarUltimoNumeroMdfe"
              type="checkbox"
              checked={
                form.atualizarUltimoNumeroMdfe
              }
              onChange={(event) =>
                alternarUltimoNumeroMdfe(
                  event.target.checked
                )
              }
              disabled={carregando}
              className="mt-1 h-4 w-4 rounded border"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="atualizarUltimoNumeroMdfe"
                className="cursor-pointer text-sm font-medium"
              >
                Informar último número de MDF-e
              </label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use para continuar a numeração já utilizada fora do Faturístico.
              </p>

              {mesmaSerie && (
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  Último número registrado na série {configuracao?.serieMdfe}: {configuracao?.ultimoNumeroMdfe ?? 0}
                </p>
              )}

              {!mesmaSerie && configuracao && (
                <p className="mt-2 text-xs text-muted-foreground">
                  A série foi alterada. Se ela já foi utilizada, informe o último número emitido nessa série.
                </p>
              )}

              {form.atualizarUltimoNumeroMdfe && (
                <div className="mt-4 space-y-2">
                  <label
                    htmlFor="ultimoNumeroMdfe"
                    className="text-sm font-medium"
                  >
                    Último MDF-e emitido
                  </label>
                  <Input
                    id="ultimoNumeroMdfe"
                    type="number"
                    min={0}
                    max={999999999}
                    step={1}
                    inputMode="numeric"
                    value={form.ultimoNumeroMdfe}
                    onChange={(event) =>
                      atualizarCampo(
                        "ultimoNumeroMdfe",
                        event.target.value
                      )
                    }
                    className="h-11"
                    disabled={carregando}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex.: informando 250, o próximo número automático será 251.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {form.ambienteMdfe === "PRODUCAO" && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <ShieldAlert
            size={19}
            className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
          />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              MDF-e configurado para produção
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Quando o módulo de emissão estiver disponível, esse ambiente produzirá documentos fiscais com validade.
            </p>
          </div>
        </div>
      )}

      <div
        aria-live="polite"
        className="mt-5 space-y-3"
      >
        {mensagem && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            {mensagem}
          </div>
        )}
        {erro && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          className="h-11 min-w-44"
          disabled={carregando || !configuracao}
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
              Salvar MDF-e
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
