"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  ClipboardList,
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
  type LucideIcon,
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

type Configuracao = {
  ambiente: AmbienteFiscal;
  regimeTributario: RegimeTributario;

  serieNfe: number;
  proximoNumeroNfe: number;

  serieNfce: number;
  proximoNumeroNfce: number;

  serieCte: number;
  proximoNumeroCte: number;

  serieMdfe: number;
  proximoNumeroMdfe: number;

  rntrc: string | null;

  idCsc: string | null;
  possuiCsc: boolean;
  possuiTokenNuvemFiscal: boolean;
};

type Props = {
  empresaId: string;
  configuracao: Configuracao | null;
  podeEditar?: boolean;
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
    proximoNumeroNfe: String(
      configuracao?.proximoNumeroNfe ?? 1
    ),

    serieNfce: String(
      configuracao?.serieNfce ?? 1
    ),
    proximoNumeroNfce: String(
      configuracao?.proximoNumeroNfce ?? 1
    ),

    serieCte: String(
      configuracao?.serieCte ?? 1
    ),
    proximoNumeroCte: String(
      configuracao?.proximoNumeroCte ?? 1
    ),

    serieMdfe: String(
      configuracao?.serieMdfe ?? 1
    ),
    proximoNumeroMdfe: String(
      configuracao?.proximoNumeroMdfe ?? 1
    ),

    rntrc:
      configuracao?.rntrc ?? "",

    idCsc:
      configuracao?.idCsc ?? "",
    csc: "",

    tokenNuvemFiscal: "",
  };
}

type FormConfiguracao =
  ReturnType<typeof criarEstadoInicial>;

export function ConfiguracaoFiscalForm({
  empresaId,
  configuracao,
  podeEditar = true,
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

  const desabilitado =
    carregando || !podeEditar;

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

  function inteiroPositivo(
    valor: string,
    label: string,
    maximo: number
  ) {
    const numero = Number(valor);

    if (
      !Number.isInteger(numero) ||
      numero <= 0 ||
      numero > maximo
    ) {
      setErro(
        `${label} deve ser um número inteiro entre 1 e ${maximo}.`
      );

      return null;
    }

    return numero;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!podeEditar) {
      return;
    }

    limparMensagens();

    const serieNfe = inteiroPositivo(
      form.serieNfe,
      "A série da NF-e",
      999
    );
    const proximoNumeroNfe =
      inteiroPositivo(
        form.proximoNumeroNfe,
        "O próximo número da NF-e",
        999_999_999
      );

    const serieNfce = inteiroPositivo(
      form.serieNfce,
      "A série da NFC-e",
      999
    );
    const proximoNumeroNfce =
      inteiroPositivo(
        form.proximoNumeroNfce,
        "O próximo número da NFC-e",
        999_999_999
      );

    const serieCte = inteiroPositivo(
      form.serieCte,
      "A série do CT-e",
      999
    );
    const proximoNumeroCte =
      inteiroPositivo(
        form.proximoNumeroCte,
        "O próximo número do CT-e",
        999_999_999
      );

    const serieMdfe = inteiroPositivo(
      form.serieMdfe,
      "A série do MDF-e",
      999
    );
    const proximoNumeroMdfe =
      inteiroPositivo(
        form.proximoNumeroMdfe,
        "O próximo número do MDF-e",
        999_999_999
      );

    if (
      serieNfe === null ||
      proximoNumeroNfe === null ||
      serieNfce === null ||
      proximoNumeroNfce === null ||
      serieCte === null ||
      proximoNumeroCte === null ||
      serieMdfe === null ||
      proximoNumeroMdfe === null
    ) {
      return;
    }

    const idCsc = form.idCsc.trim();
    const csc = form.csc.trim();
    const tokenNuvemFiscal =
      form.tokenNuvemFiscal.trim();

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

          serieNfe,
          proximoNumeroNfe,

          serieNfce,
          proximoNumeroNfce,

          serieCte,
          proximoNumeroCte,

          serieMdfe,
          proximoNumeroMdfe,

          rntrc: form.rntrc,

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
        csc: "",
        tokenNuvemFiscal: "",
      }));

      setMostrarCsc(false);
      setMostrarToken(false);

      setMensagem(
        "Parâmetros de emissão salvos com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar parâmetros de emissão:",
        error
      );

      setErro(
        "Não foi possível salvar os parâmetros de emissão. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const producao =
    form.ambiente === "PRODUCAO";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {!podeEditar && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Você possui acesso somente para consulta. Os parâmetros de emissão não podem ser alterados.
        </div>
      )}

      <BlocoConfiguracao
        icone={Landmark}
        titulo="Parâmetros gerais"
        descricao="Defina o ambiente e o regime tributário usados pelos documentos fiscais da empresa."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <CampoSelect
            id="ambienteFiscal"
            label="Ambiente de emissão"
            descricao="Use homologação para testes e produção somente para documentos com validade fiscal."
            value={form.ambiente}
            disabled={desabilitado}
            onChange={(valor) =>
              atualizarCampo(
                "ambiente",
                valor as AmbienteFiscal
              )
            }
            opcoes={[
              {
                value: "HOMOLOGACAO",
                label: "Homologação",
              },
              {
                value: "PRODUCAO",
                label: "Produção",
              },
            ]}
          />

          <CampoSelect
            id="regimeTributario"
            label="Regime tributário"
            descricao="Regime fiscal utilizado nas regras tributárias de emissão."
            value={form.regimeTributario}
            disabled={desabilitado}
            onChange={(valor) =>
              atualizarCampo(
                "regimeTributario",
                valor as RegimeTributario
              )
            }
            opcoes={[
              {
                value: "SIMPLES_NACIONAL",
                label: "Simples Nacional",
              },
              {
                value:
                  "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE",
                label:
                  "Simples Nacional — excesso de sublimite",
              },
              {
                value: "REGIME_NORMAL",
                label: "Regime Normal",
              },
            ]}
          />
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
                Os documentos enviados neste ambiente terão validade fiscal. Revise séries, numeração, cadastro da empresa e certificado antes da transmissão.
              </p>
            </div>
          </div>
        )}
      </BlocoConfiguracao>

      <BlocoConfiguracao
        icone={FileText}
        titulo="NF-e — modelo 55"
        descricao="Parâmetros de numeração utilizados na emissão de Nota Fiscal Eletrônica."
      >
        <GridNumeracao
          serie={form.serieNfe}
          proximoNumero={
            form.proximoNumeroNfe
          }
          serieId="serieNfe"
          numeroId="proximoNumeroNfe"
          documento="NF-e"
          disabled={desabilitado}
          onSerieChange={(valor) =>
            atualizarCampo(
              "serieNfe",
              valor
            )
          }
          onNumeroChange={(valor) =>
            atualizarCampo(
              "proximoNumeroNfe",
              valor
            )
          }
        />
      </BlocoConfiguracao>

      <BlocoConfiguracao
        icone={ReceiptText}
        titulo="NFC-e — modelo 65"
        descricao="Série, numeração e Código de Segurança do Contribuinte utilizados na NFC-e."
        status={
          configuracao?.possuiCsc
            ? "CSC configurado"
            : "CSC pendente"
        }
      >
        <GridNumeracao
          serie={form.serieNfce}
          proximoNumero={
            form.proximoNumeroNfce
          }
          serieId="serieNfce"
          numeroId="proximoNumeroNfce"
          documento="NFC-e"
          disabled={desabilitado}
          onSerieChange={(valor) =>
            atualizarCampo(
              "serieNfce",
              valor
            )
          }
          onNumeroChange={(valor) =>
            atualizarCampo(
              "proximoNumeroNfce",
              valor
            )
          }
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <CampoTexto
            id="idCsc"
            label="Identificador do CSC"
            descricao="Identificador fornecido pela administração tributária."
            value={form.idCsc}
            disabled={desabilitado}
            placeholder="Ex.: 000001"
            onChange={(valor) =>
              atualizarCampo(
                "idCsc",
                valor
              )
            }
          />

          <CampoSecreto
            id="csc"
            label="Código CSC"
            descricao="Deixe vazio para manter o código já armazenado."
            placeholder={
              configuracao?.possuiCsc
                ? "CSC configurado — preencha para substituir"
                : "Informe o código CSC"
            }
            value={form.csc}
            mostrar={mostrarCsc}
            disabled={desabilitado}
            onMostrar={() =>
              setMostrarCsc(
                (valor) => !valor
              )
            }
            onChange={(valor) =>
              atualizarCampo(
                "csc",
                valor
              )
            }
          />
        </div>
      </BlocoConfiguracao>

      <BlocoConfiguracao
        icone={Truck}
        titulo="CT-e — modelo 57"
        descricao="Parâmetros de emissão do Conhecimento de Transporte Eletrônico no modal rodoviário."
      >
        <GridNumeracao
          serie={form.serieCte}
          proximoNumero={
            form.proximoNumeroCte
          }
          serieId="serieCte"
          numeroId="proximoNumeroCte"
          documento="CT-e"
          disabled={desabilitado}
          onSerieChange={(valor) =>
            atualizarCampo(
              "serieCte",
              valor
            )
          }
          onNumeroChange={(valor) =>
            atualizarCampo(
              "proximoNumeroCte",
              valor
            )
          }
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <CampoTexto
            id="rntrcCte"
            label="RNTRC do emitente"
            descricao="Informe 8 dígitos ou ISENTO. O mesmo RNTRC é utilizado no MDF-e."
            value={form.rntrc}
            disabled={desabilitado}
            placeholder="Ex.: 12345678"
            onChange={(valor) =>
              atualizarCampo(
                "rntrc",
                valor
              )
            }
          />

          <CampoSomenteLeitura
            label="Modal habilitado"
            value="Rodoviário"
            descricao="O módulo atual de CT-e está preparado para o modal rodoviário."
          />
        </div>
      </BlocoConfiguracao>

      <BlocoConfiguracao
        icone={ClipboardList}
        titulo="MDF-e — modelo 58"
        descricao="Parâmetros de emissão do Manifesto Eletrônico de Documentos Fiscais."
      >
        <GridNumeracao
          serie={form.serieMdfe}
          proximoNumero={
            form.proximoNumeroMdfe
          }
          serieId="serieMdfe"
          numeroId="proximoNumeroMdfe"
          documento="MDF-e"
          disabled={desabilitado}
          onSerieChange={(valor) =>
            atualizarCampo(
              "serieMdfe",
              valor
            )
          }
          onNumeroChange={(valor) =>
            atualizarCampo(
              "proximoNumeroMdfe",
              valor
            )
          }
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <CampoTexto
            id="rntrcMdfe"
            label="RNTRC do emitente"
            descricao="Parâmetro compartilhado com o CT-e. Alterar aqui também atualiza o CT-e."
            value={form.rntrc}
            disabled={desabilitado}
            placeholder="Ex.: 12345678"
            onChange={(valor) =>
              atualizarCampo(
                "rntrc",
                valor
              )
            }
          />

          <CampoSomenteLeitura
            label="Modal padrão"
            value="Rodoviário"
            descricao="Parâmetro preparado para a implementação do MDF-e rodoviário."
          />
        </div>
      </BlocoConfiguracao>

      <BlocoConfiguracao
        icone={CloudCog}
        titulo="Integrações"
        descricao="Credenciais opcionais utilizadas nas integrações externas de emissão."
        status={
          configuracao
            ?.possuiTokenNuvemFiscal
            ? "Token configurado"
            : "Opcional"
        }
      >
        <CampoSecreto
          id="tokenNuvemFiscal"
          label="Token da Nuvem Fiscal"
          descricao="Deixe vazio para manter o token atualmente armazenado."
          placeholder={
            configuracao
              ?.possuiTokenNuvemFiscal
              ? "Token configurado — preencha para substituir"
              : "Informe o token de integração"
          }
          value={form.tokenNuvemFiscal}
          mostrar={mostrarToken}
          disabled={desabilitado}
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
        />
      </BlocoConfiguracao>

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

      {podeEditar && (
        <div className="flex justify-end rounded-2xl border bg-card p-5 shadow-sm">
          <Button
            type="submit"
            className="h-11 min-w-52"
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
                Salvar parâmetros
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

type BlocoConfiguracaoProps = {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  status?: string;
  children: ReactNode;
};

function BlocoConfiguracao({
  icone: Icone,
  titulo,
  descricao,
  status,
  children,
}: BlocoConfiguracaoProps) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icone size={21} />
          </div>

          <div>
            <h3 className="font-semibold tracking-tight">
              {titulo}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {descricao}
            </p>
          </div>
        </div>

        {status && (
          <span className="hidden shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            {status}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

type GridNumeracaoProps = {
  serie: string;
  proximoNumero: string;
  serieId: string;
  numeroId: string;
  documento: string;
  disabled: boolean;
  onSerieChange: (valor: string) => void;
  onNumeroChange: (valor: string) => void;
};

function GridNumeracao({
  serie,
  proximoNumero,
  serieId,
  numeroId,
  documento,
  disabled,
  onSerieChange,
  onNumeroChange,
}: GridNumeracaoProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <CampoNumero
        id={serieId}
        label={`Série da ${documento}`}
        descricao="Série utilizada para compor a chave e a numeração do documento."
        value={serie}
        min={1}
        max={999}
        disabled={disabled}
        onChange={onSerieChange}
      />

      <CampoNumero
        id={numeroId}
        label={`Próximo número da ${documento}`}
        descricao="Pode ser avançado. O sistema não permite voltar abaixo de numeração já utilizada."
        value={proximoNumero}
        min={1}
        max={999999999}
        disabled={disabled}
        onChange={onNumeroChange}
      />
    </div>
  );
}

type CampoNumeroProps = {
  id: string;
  label: string;
  descricao: string;
  value: string;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (valor: string) => void;
};

function CampoNumero({
  id,
  label,
  descricao,
  value,
  min,
  max,
  disabled,
  onChange,
}: CampoNumeroProps) {
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
        type="number"
        min={min}
        max={max}
        step={1}
        inputMode="numeric"
        className="h-11"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

type CampoTextoProps = {
  id: string;
  label: string;
  descricao: string;
  value: string;
  placeholder?: string;
  disabled: boolean;
  onChange: (valor: string) => void;
};

function CampoTexto({
  id,
  label,
  descricao,
  value,
  placeholder,
  disabled,
  onChange,
}: CampoTextoProps) {
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
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

type CampoSecretoProps = {
  id: string;
  label: string;
  descricao: string;
  value: string;
  placeholder: string;
  mostrar: boolean;
  disabled: boolean;
  onMostrar: () => void;
  onChange: (valor: string) => void;
};

function CampoSecreto({
  id,
  label,
  descricao,
  value,
  placeholder,
  mostrar,
  disabled,
  onMostrar,
  onChange,
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
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        <button
          type="button"
          aria-label={
            mostrar
              ? "Ocultar valor"
              : "Mostrar valor"
          }
          onClick={onMostrar}
          disabled={disabled}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {mostrar ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

type CampoSelectProps = {
  id: string;
  label: string;
  descricao: string;
  value: string;
  disabled: boolean;
  onChange: (valor: string) => void;
  opcoes: Array<{
    value: string;
    label: string;
  }>;
};

function CampoSelect({
  id,
  label,
  descricao,
  value,
  disabled,
  onChange,
  opcoes,
}: CampoSelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {opcoes.map((opcao) => (
          <option
            key={opcao.value}
            value={opcao.value}
          >
            {opcao.label}
          </option>
        ))}
      </select>

      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

function CampoSomenteLeitura({
  label,
  value,
  descricao,
}: {
  label: string;
  value: string;
  descricao: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {label}
      </p>
      <div className="flex h-11 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
        {value}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}
