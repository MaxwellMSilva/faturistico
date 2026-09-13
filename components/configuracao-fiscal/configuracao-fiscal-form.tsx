"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  CircleDashed,
  CloudCog,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  LoaderCircle,
  ReceiptText,
  Save,
  ShieldAlert,
  Truck,
} from "lucide-react";

import { updateConfiguracaoFiscal } from "@/actions/configuracao-fiscal/update-configuracao-fiscal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AmbienteFiscal =
  | "HOMOLOGACAO"
  | "PRODUCAO";

type RegimeTributario =
  | "SIMPLES_NACIONAL"
  | "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE"
  | "REGIME_NORMAL";

type FinalidadeCte =
  | "NORMAL"
  | "COMPLEMENTO"
  | "SUBSTITUICAO";

type TipoEmissaoCte =
  | "NORMAL"
  | "REGIME_ESPECIAL_NFF"
  | "EPEC_SVC"
  | "CONTINGENCIA_FSDA"
  | "SVC_RS"
  | "SVC_SP";

type ModalCte =
  | "RODOVIARIO"
  | "AEREO"
  | "AQUAVIARIO"
  | "FERROVIARIO"
  | "DUTOVIARIO"
  | "MULTIMODAL";

type TipoServicoCte =
  | "NORMAL"
  | "SUBCONTRATACAO"
  | "REDESPACHO"
  | "REDESPACHO_INTERMEDIARIO"
  | "VINCULADO_MULTIMODAL";

type Configuracao = {
  ambiente: AmbienteFiscal;
  regimeTributario: RegimeTributario;
  serieNfe: number;
  ultimoNumeroNfe: number;
  serieNfce: number;

  modeloCte: number;
  ambienteCte: AmbienteFiscal;
  finalidadeCte: string;
  tipoEmissaoCte: string;
  modalCte: string;
  tipoServicoCte: string;
  serieCte: number;
  ultimoNumeroCte: number;
  numeracaoManualCte: boolean;

  idCsc: string | null;
  possuiCsc: boolean;
  possuiTokenNuvemFiscal: boolean;
};

type Props = {
  empresaId: string;
  configuracao: Configuracao | null;
};

function criarEstadoInicial(
  configuracao: Configuracao | null
) {
  return {
    ambiente:
      configuracao?.ambiente ??
      ("HOMOLOGACAO" as AmbienteFiscal),
    regimeTributario:
      configuracao?.regimeTributario ??
      ("SIMPLES_NACIONAL" as RegimeTributario),
    serieNfe: String(
      configuracao?.serieNfe ?? 1
    ),
    atualizarUltimoNumeroNfe: false,
    ultimoNumeroNfe: String(
      configuracao?.ultimoNumeroNfe ?? 0
    ),
    serieNfce: String(
      configuracao?.serieNfce ?? 1
    ),

    ambienteCte:
      configuracao?.ambienteCte ??
      configuracao?.ambiente ??
      ("HOMOLOGACAO" as AmbienteFiscal),
    finalidadeCte:
      (configuracao?.finalidadeCte ??
        "NORMAL") as FinalidadeCte,
    tipoEmissaoCte:
      (configuracao?.tipoEmissaoCte ??
        "NORMAL") as TipoEmissaoCte,
    modalCte:
      (configuracao?.modalCte ??
        "RODOVIARIO") as ModalCte,
    tipoServicoCte:
      (configuracao?.tipoServicoCte ??
        "NORMAL") as TipoServicoCte,
    serieCte: String(
      configuracao?.serieCte ?? 1
    ),
    numeracaoManualCte:
      configuracao?.numeracaoManualCte ??
      false,
    atualizarUltimoNumeroCte: false,
    ultimoNumeroCte: String(
      configuracao?.ultimoNumeroCte ?? 0
    ),

    idCsc: configuracao?.idCsc ?? "",
    csc: "",
    tokenNuvemFiscal: "",
  };
}

type FormConfiguracao = ReturnType<
  typeof criarEstadoInicial
>;

export function ConfiguracaoFiscalForm({
  empresaId,
  configuracao,
}: Props) {
  const router = useRouter();

  const [form, setForm] =
    useState<FormConfiguracao>(
      criarEstadoInicial(configuracao)
    );

  const [carregando, setCarregando] =
    useState(false);
  const [mostrarCsc, setMostrarCsc] =
    useState(false);
  const [mostrarToken, setMostrarToken] =
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
    Campo extends keyof FormConfiguracao,
  >(
    campo: Campo,
    valor: FormConfiguracao[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    limparMensagens();
  }

  function atualizarSerieNfe(
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      serieNfe: valor,
      atualizarUltimoNumeroNfe: false,
      ultimoNumeroNfe: "",
    }));

    limparMensagens();
  }

  function atualizarSerieCte(
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      serieCte: valor,
      atualizarUltimoNumeroCte: false,
      ultimoNumeroCte: "",
    }));

    limparMensagens();
  }

  function alternarUltimoNumeroNfe(
    marcado: boolean
  ) {
    const mesmaSerie =
      configuracao &&
      String(configuracao.serieNfe) ===
        form.serieNfe;

    setForm((anterior) => ({
      ...anterior,
      atualizarUltimoNumeroNfe: marcado,
      ultimoNumeroNfe: marcado
        ? anterior.ultimoNumeroNfe ||
          String(
            mesmaSerie
              ? configuracao?.ultimoNumeroNfe ??
                  0
              : 0
          )
        : anterior.ultimoNumeroNfe,
    }));

    limparMensagens();
  }

  function alternarUltimoNumeroCte(
    marcado: boolean
  ) {
    const mesmaSerie =
      configuracao &&
      String(configuracao.serieCte) ===
        form.serieCte;

    setForm((anterior) => ({
      ...anterior,
      atualizarUltimoNumeroCte: marcado,
      ultimoNumeroCte: marcado
        ? anterior.ultimoNumeroCte ||
          String(
            mesmaSerie
              ? configuracao?.ultimoNumeroCte ??
                  0
              : 0
          )
        : anterior.ultimoNumeroCte,
    }));

    limparMensagens();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    limparMensagens();

    const numeroSerieNfe =
      Number(form.serieNfe);
    const numeroSerieNfce =
      Number(form.serieNfce);
    const ultimoNumeroNfe =
      Number(form.ultimoNumeroNfe);
    const numeroSerieCte =
      Number(form.serieCte);
    const ultimoNumeroCte =
      Number(form.ultimoNumeroCte);
    const idCsc = form.idCsc.trim();
    const csc = form.csc.trim();
    const tokenNuvemFiscal =
      form.tokenNuvemFiscal.trim();

    if (
      !Number.isInteger(numeroSerieNfe) ||
      numeroSerieNfe <= 0
    ) {
      setErro(
        "Informe uma série válida para a NF-e."
      );
      return;
    }

    if (
      form.atualizarUltimoNumeroNfe &&
      (
        !Number.isInteger(ultimoNumeroNfe) ||
        ultimoNumeroNfe < 0 ||
        ultimoNumeroNfe > 999_999_999
      )
    ) {
      setErro(
        "Informe um último número de NF-e entre 0 e 999999999."
      );
      return;
    }

    if (
      !Number.isInteger(numeroSerieNfce) ||
      numeroSerieNfce <= 0
    ) {
      setErro(
        "Informe uma série válida para a NFC-e."
      );
      return;
    }

    if (
      !Number.isInteger(numeroSerieCte) ||
      numeroSerieCte < 0 ||
      numeroSerieCte > 999
    ) {
      setErro(
        "Informe uma série de CT-e entre 0 e 999."
      );
      return;
    }

    if (
      form.atualizarUltimoNumeroCte &&
      (
        !Number.isInteger(ultimoNumeroCte) ||
        ultimoNumeroCte < 0 ||
        ultimoNumeroCte > 999_999_999
      )
    ) {
      setErro(
        "Informe um último número de CT-e entre 0 e 999999999."
      );
      return;
    }

    if (csc && !idCsc) {
      setErro(
        "Informe o identificador do CSC."
      );
      return;
    }

    if (
      !configuracao?.possuiCsc &&
      Boolean(idCsc || csc) &&
      (!idCsc || !csc)
    ) {
      setErro(
        "Para cadastrar o CSC pela primeira vez, informe o ID e o código CSC."
      );
      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateConfiguracaoFiscal({
          empresaId,
          ambiente: form.ambiente,
          regimeTributario:
            form.regimeTributario,
          serieNfe: numeroSerieNfe,
          serieNfce: numeroSerieNfce,
          atualizarUltimoNumeroNfe:
            form.atualizarUltimoNumeroNfe,
          ultimoNumeroNfe:
            form.atualizarUltimoNumeroNfe
              ? ultimoNumeroNfe
              : undefined,

          modeloCte: 57,
          ambienteCte: form.ambienteCte,
          finalidadeCte:
            form.finalidadeCte,
          tipoEmissaoCte:
            form.tipoEmissaoCte,
          modalCte: form.modalCte,
          tipoServicoCte:
            form.tipoServicoCte,
          serieCte: numeroSerieCte,
          numeracaoManualCte:
            form.numeracaoManualCte,
          atualizarUltimoNumeroCte:
            form.atualizarUltimoNumeroCte,
          ultimoNumeroCte:
            form.atualizarUltimoNumeroCte
              ? ultimoNumeroCte
              : undefined,

          idCsc,
          csc,
          tokenNuvemFiscal,
        });

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setForm((anterior) => ({
        ...anterior,
        atualizarUltimoNumeroNfe: false,
        atualizarUltimoNumeroCte: false,
        csc: "",
        tokenNuvemFiscal: "",
      }));

      setMostrarCsc(false);
      setMostrarToken(false);
      setMensagem(
        "Configuração fiscal salva com sucesso."
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar configuração fiscal:",
        error
      );
      setErro(
        "Não foi possível salvar a configuração fiscal. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const producao =
    form.ambiente === "PRODUCAO";

  const serieNfeAtual =
    configuracao
      ? String(configuracao.serieNfe) ===
        form.serieNfe
      : false;

  const serieCteAtual =
    configuracao
      ? String(configuracao.serieCte) ===
        form.serieCte
      : false;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={Landmark}
          titulo="Emissão fiscal"
          descricao="Configure os parâmetros gerais utilizados na emissão dos documentos fiscais da empresa."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="ambienteFiscal"
              className="text-sm font-medium"
            >
              Ambiente de emissão
            </label>

            <select
              id="ambienteFiscal"
              value={form.ambiente}
              onChange={(event) =>
                atualizarCampo(
                  "ambiente",
                  event.target
                    .value as AmbienteFiscal
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

            <p className="text-xs text-muted-foreground">
              Use homologação enquanto estiver
              realizando testes.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="regimeTributario"
              className="text-sm font-medium"
            >
              Regime tributário
            </label>

            <select
              id="regimeTributario"
              value={form.regimeTributario}
              onChange={(event) =>
                atualizarCampo(
                  "regimeTributario",
                  event.target
                    .value as RegimeTributario
                )
              }
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
            >
              <option value="SIMPLES_NACIONAL">
                Simples Nacional
              </option>
              <option value="SIMPLES_NACIONAL_EXCESSO_SUBLIMITE">
                Simples Nacional — excesso de
                sublimite
              </option>
              <option value="REGIME_NORMAL">
                Regime Normal
              </option>
            </select>

            <p className="text-xs text-muted-foreground">
              O regime define o uso de CST ou
              CSOSN nos itens da nota.
            </p>
          </div>
        </div>

        {producao && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <ShieldAlert
              size={19}
              className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
            />

            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Ambiente de produção
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Os documentos enviados neste
                ambiente terão validade fiscal.
                Revise o cadastro da empresa antes
                da transmissão.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={FileText}
          titulo="Parâmetros de NF-e"
          descricao="Configure os parâmetros específicos da Nota Fiscal Eletrônica utilizada no modelo 55."
          status={
            configuracao
              ? "configurado"
              : "pendente"
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="modeloNfe"
              className="text-sm font-medium"
            >
              Modelo
            </label>

            <Input
              id="modeloNfe"
              className="h-11"
              value="55 — NF-e"
              disabled
              readOnly
            />

            <p className="text-xs text-muted-foreground">
              O Faturístico utiliza o modelo 55
              para emissão de NF-e.
            </p>
          </div>

          <CampoSerie
            id="serieNfe"
            label="Série da NF-e"
            descricao="Série utilizada na numeração das NF-e emitidas por esta empresa."
            value={form.serieNfe}
            onChange={atualizarSerieNfe}
            disabled={carregando}
          />
        </div>

        <div className="mt-5 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <input
              id="atualizarUltimoNumeroNfe"
              type="checkbox"
              checked={
                form.atualizarUltimoNumeroNfe
              }
              onChange={(event) =>
                alternarUltimoNumeroNfe(
                  event.target.checked
                )
              }
              disabled={carregando}
              className="mt-1 h-4 w-4 rounded border"
            />

            <div className="min-w-0 flex-1">
              <label
                htmlFor="atualizarUltimoNumeroNfe"
                className="cursor-pointer text-sm font-medium"
              >
                Informar último número de NF-e
              </label>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use esta opção para ajustar a
                sequência de numeração. O próximo
                rascunho utilizará o número
                seguinte ao informado.
              </p>

              {serieNfeAtual && (
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  Último número registrado na série
                  {" "}{configuracao?.serieNfe}: {" "}
                  {configuracao?.ultimoNumeroNfe ?? 0}
                </p>
              )}

              {!serieNfeAtual &&
                configuracao && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    A série foi alterada. Se ela já
                    possui numeração anterior,
                    marque a opção e informe o
                    último número utilizado.
                  </p>
                )}

              {form.atualizarUltimoNumeroNfe && (
                <div className="mt-4 max-w-sm space-y-2">
                  <label
                    htmlFor="ultimoNumeroNfe"
                    className="text-sm font-medium"
                  >
                    Último número de NF-e
                  </label>

                  <Input
                    id="ultimoNumeroNfe"
                    type="number"
                    min={0}
                    max={999999999}
                    step={1}
                    inputMode="numeric"
                    value={form.ultimoNumeroNfe}
                    onChange={(event) =>
                      atualizarCampo(
                        "ultimoNumeroNfe",
                        event.target.value
                      )
                    }
                    className="h-11"
                    disabled={carregando}
                    required
                  />

                  <p className="text-xs text-muted-foreground">
                    Ex.: informando 1500, a próxima
                    NF-e criada será a 1501.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={Truck}
          titulo="Parâmetros de CT-e"
          descricao="Deixe definidos os padrões que serão utilizados na futura emissão do CT-e de transporte de carga."
          status={
            configuracao
              ? "configurado"
              : "pendente"
          }
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="modeloCte"
              className="text-sm font-medium"
            >
              Modelo CT-e
            </label>

            <Input
              id="modeloCte"
              className="h-11"
              value="57 — CT-e"
              disabled
              readOnly
            />

            <p className="text-xs text-muted-foreground">
              O padrão desta etapa é o CT-e de
              transporte de carga modelo 57.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="ambienteCte"
              className="text-sm font-medium"
            >
              Ambiente CT-e
            </label>

            <select
              id="ambienteCte"
              value={form.ambienteCte}
              onChange={(event) =>
                atualizarCampo(
                  "ambienteCte",
                  event.target
                    .value as AmbienteFiscal
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

            <p className="text-xs text-muted-foreground">
              Pode ser configurado separadamente
              do ambiente geral da NF-e.
            </p>
          </div>

          <CampoSerie
            id="serieCte"
            label="Série do CT-e"
            descricao="A série 0 também é válida quando a empresa utiliza série única."
            value={form.serieCte}
            onChange={atualizarSerieCte}
            disabled={carregando}
            min={0}
            max={999}
          />

          <div className="space-y-2">
            <label
              htmlFor="finalidadeCte"
              className="text-sm font-medium"
            >
              Finalidade CT-e
            </label>

            <select
              id="finalidadeCte"
              value={form.finalidadeCte}
              onChange={(event) =>
                atualizarCampo(
                  "finalidadeCte",
                  event.target
                    .value as FinalidadeCte
                )
              }
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
            >
              <option value="NORMAL">
                Normal
              </option>
              <option value="COMPLEMENTO">
                Complemento de valores
              </option>
              <option value="SUBSTITUICAO">
                Substituição
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tipoEmissaoCte"
              className="text-sm font-medium"
            >
              Tipo de emissão
            </label>

            <select
              id="tipoEmissaoCte"
              value={form.tipoEmissaoCte}
              onChange={(event) =>
                atualizarCampo(
                  "tipoEmissaoCte",
                  event.target
                    .value as TipoEmissaoCte
                )
              }
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
            >
              <option value="NORMAL">
                Normal
              </option>
              <option value="REGIME_ESPECIAL_NFF">
                Regime Especial NFF
              </option>
              <option value="EPEC_SVC">
                EPEC pela SVC
              </option>
              <option value="CONTINGENCIA_FSDA">
                Contingência FS-DA
              </option>
              <option value="SVC_RS">
                SVC-RS
              </option>
              <option value="SVC_SP">
                SVC-SP
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="modalCte"
              className="text-sm font-medium"
            >
              Modal
            </label>

            <select
              id="modalCte"
              value={form.modalCte}
              onChange={(event) =>
                atualizarCampo(
                  "modalCte",
                  event.target
                    .value as ModalCte
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
              <option value="DUTOVIARIO">
                Dutoviário
              </option>
              <option value="MULTIMODAL">
                Multimodal
              </option>
            </select>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label
              htmlFor="tipoServicoCte"
              className="text-sm font-medium"
            >
              Tipo de serviço
            </label>

            <select
              id="tipoServicoCte"
              value={form.tipoServicoCte}
              onChange={(event) =>
                atualizarCampo(
                  "tipoServicoCte",
                  event.target
                    .value as TipoServicoCte
                )
              }
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
            >
              <option value="NORMAL">
                Normal
              </option>
              <option value="SUBCONTRATACAO">
                Subcontratação
              </option>
              <option value="REDESPACHO">
                Redespacho
              </option>
              <option value="REDESPACHO_INTERMEDIARIO">
                Redespacho intermediário
              </option>
              <option value="VINCULADO_MULTIMODAL">
                Serviço vinculado a multimodal
              </option>
            </select>

            <p className="text-xs text-muted-foreground">
              O padrão inicial é serviço normal.
              Os demais exigirão grupos específicos
              no XML quando a emissão for criada.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <input
                id="numeracaoManualCte"
                type="checkbox"
                checked={form.numeracaoManualCte}
                onChange={(event) =>
                  atualizarCampo(
                    "numeracaoManualCte",
                    event.target.checked
                  )
                }
                disabled={carregando}
                className="mt-1 h-4 w-4 rounded border"
              />

              <div>
                <label
                  htmlFor="numeracaoManualCte"
                  className="cursor-pointer text-sm font-medium"
                >
                  Permitir numeração manual
                </label>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Quando a tela de CT-e for criada,
                  este parâmetro permitirá editar o
                  número antes da emissão. Desmarcado,
                  a numeração será automática.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <input
                id="atualizarUltimoNumeroCte"
                type="checkbox"
                checked={
                  form.atualizarUltimoNumeroCte
                }
                onChange={(event) =>
                  alternarUltimoNumeroCte(
                    event.target.checked
                  )
                }
                disabled={carregando}
                className="mt-1 h-4 w-4 rounded border"
              />

              <div className="min-w-0 flex-1">
                <label
                  htmlFor="atualizarUltimoNumeroCte"
                  className="cursor-pointer text-sm font-medium"
                >
                  Informar último número de CT-e
                </label>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Use para iniciar a sequência com o
                  último CT-e já emitido fora do
                  Faturístico.
                </p>

                {serieCteAtual && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Último número registrado na série
                    {" "}{configuracao?.serieCte}: {" "}
                    {configuracao?.ultimoNumeroCte ?? 0}
                  </p>
                )}

                {!serieCteAtual &&
                  configuracao && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      A série foi alterada. Se ela já
                      foi utilizada, informe o último
                      número emitido nessa série.
                    </p>
                  )}

                {form.atualizarUltimoNumeroCte && (
                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor="ultimoNumeroCte"
                      className="text-sm font-medium"
                    >
                      Último CT-e emitido
                    </label>

                    <Input
                      id="ultimoNumeroCte"
                      type="number"
                      min={0}
                      max={999999999}
                      step={1}
                      inputMode="numeric"
                      value={form.ultimoNumeroCte}
                      onChange={(event) =>
                        atualizarCampo(
                          "ultimoNumeroCte",
                          event.target.value
                        )
                      }
                      className="h-11"
                      disabled={carregando}
                      required
                    />

                    <p className="text-xs text-muted-foreground">
                      Ex.: informando 850, o próximo
                      número automático será 851.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {form.ambienteCte === "PRODUCAO" && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <ShieldAlert
              size={19}
              className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
            />

            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                CT-e configurado para produção
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Quando o módulo de emissão estiver
                disponível, esse ambiente produzirá
                documentos fiscais com validade.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={ReceiptText}
          titulo="NFC-e e CSC"
          descricao="Configure a série e o Código de Segurança do Contribuinte utilizados na NFC-e."
          status={
            configuracao?.possuiCsc
              ? "configurado"
              : "pendente"
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          <CampoSerie
            id="serieNfce"
            label="Série da NFC-e"
            descricao="Série utilizada para o modelo 65."
            value={form.serieNfce}
            onChange={(valor) =>
              atualizarCampo(
                "serieNfce",
                valor
              )
            }
            disabled={carregando}
          />

          <div className="space-y-2">
            <label
              htmlFor="idCsc"
              className="text-sm font-medium"
            >
              Identificador do CSC
            </label>

            <Input
              id="idCsc"
              className="h-11"
              placeholder="Ex.: 000001"
              value={form.idCsc}
              onChange={(event) =>
                atualizarCampo(
                  "idCsc",
                  event.target.value
                )
              }
              disabled={carregando}
              autoComplete="off"
            />

            <p className="text-xs text-muted-foreground">
              Identificador fornecido pela
              administração tributária.
            </p>
          </div>

          <CampoSecreto
            id="csc"
            label="Código CSC"
            placeholder={
              configuracao?.possuiCsc
                ? "CSC configurado — preencha para substituir"
                : "Informe o código CSC"
            }
            value={form.csc}
            mostrar={mostrarCsc}
            onMostrar={() =>
              setMostrarCsc(
                (valor) => !valor
              )
            }
            onChange={(valor) =>
              atualizarCampo("csc", valor)
            }
            disabled={carregando}
          />
        </div>

        {configuracao?.possuiCsc && (
          <p className="mt-5 text-xs text-muted-foreground">
            Por segurança, o CSC atual não é
            exibido. Deixe o campo vazio para
            manter o código existente.
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={CloudCog}
          titulo="Integração Nuvem Fiscal"
          descricao="Configure o token utilizado na integração externa."
          status={
            configuracao
              ?.possuiTokenNuvemFiscal
              ? "configurado"
              : "pendente"
          }
        />

        <CampoSecreto
          id="tokenNuvemFiscal"
          label="Token da Nuvem Fiscal"
          placeholder={
            configuracao
              ?.possuiTokenNuvemFiscal
              ? "Token configurado — preencha para substituir"
              : "Informe o token de integração"
          }
          value={form.tokenNuvemFiscal}
          mostrar={mostrarToken}
          onMostrar={() =>
            setMostrarToken(
              (valor) => !valor
            )
          }
          onChange={(valor) =>
            atualizarCampo(
              "tokenNuvemFiscal",
              valor
            )
          }
          disabled={carregando}
        />

        <p className="mt-3 text-xs text-muted-foreground">
          Campo opcional. Deixe vazio para manter
          o token já armazenado.
        </p>
      </section>

      <div
        aria-live="polite"
        className="space-y-3"
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
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </div>
        )}
      </div>

      <div className="flex justify-end rounded-2xl border bg-card p-5 shadow-sm">
        <Button
          type="submit"
          className="h-11 min-w-48"
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
              Salvar configuração
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

type CabecalhoSecaoProps = {
  icone: typeof Landmark;
  titulo: string;
  descricao: string;
  status?: "configurado" | "pendente";
};

function CabecalhoSecao({
  icone: Icone,
  titulo,
  descricao,
  status,
}: CabecalhoSecaoProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icone size={20} />
        </div>

        <div>
          <h3 className="font-semibold">
            {titulo}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {descricao}
          </p>
        </div>
      </div>

      {status && (
        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            status === "configurado"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          ].join(" ")}
        >
          {status === "configurado" ? (
            <BadgeCheck size={14} />
          ) : (
            <CircleDashed size={14} />
          )}
          {status === "configurado"
            ? "Configurado"
            : "Pendente"}
        </span>
      )}
    </div>
  );
}

type CampoSerieProps = {
  id: string;
  label: string;
  descricao: string;
  value: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function CampoSerie({
  id,
  label,
  descricao,
  value,
  onChange,
  disabled = false,
  min = 1,
  max,
}: CampoSerieProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <Input
        id={id}
        className="h-11"
        type="number"
        min={min}
        max={max}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        required
      />

      <p className="text-xs text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

type CampoSecretoProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  mostrar: boolean;
  onMostrar: () => void;
  onChange: (valor: string) => void;
  disabled?: boolean;
};

function CampoSecreto({
  id,
  label,
  placeholder,
  value,
  mostrar,
  onMostrar,
  onChange,
  disabled = false,
}: CampoSecretoProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          type={mostrar ? "text" : "password"}
          className="h-11 pr-11"
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={onMostrar}
          disabled={disabled}
          aria-label={
            mostrar
              ? `Ocultar ${label}`
              : `Mostrar ${label}`
          }
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {mostrar ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}
