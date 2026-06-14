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
  Landmark,
  LoaderCircle,
  ReceiptText,
  Save,
  ShieldAlert,
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

  regimeTributario:
    RegimeTributario;

  serieNfe: number;
  serieNfce: number;

  idCsc: string | null;

  possuiCsc: boolean;

  possuiTokenNuvemFiscal:
    boolean;
};

type Props = {
  empresaId: string;

  configuracao:
    | Configuracao
    | null;
};

function criarEstadoInicial(
  configuracao:
    | Configuracao
    | null
) {
  return {
    ambiente:
      configuracao?.ambiente ??
      ("HOMOLOGACAO" as AmbienteFiscal),

    regimeTributario:
      configuracao
        ?.regimeTributario ??
      ("SIMPLES_NACIONAL" as RegimeTributario),

    serieNfe:
      String(
        configuracao?.serieNfe ??
          1
      ),

    serieNfce:
      String(
        configuracao?.serieNfce ??
          1
      ),

    idCsc:
      configuracao?.idCsc ??
      "",

    csc: "",

    tokenNuvemFiscal: "",
  };
}

type FormConfiguracao =
  ReturnType<
    typeof criarEstadoInicial
  >;

export function ConfiguracaoFiscalForm({
  empresaId,
  configuracao,
}: Props) {
  const router = useRouter();

  const [form, setForm] =
    useState<FormConfiguracao>(
      criarEstadoInicial(
        configuracao
      )
    );

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    mostrarCsc,
    setMostrarCsc,
  ] = useState(false);

  const [
    mostrarToken,
    setMostrarToken,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  useEffect(() => {
    setForm(
      criarEstadoInicial(
        configuracao
      )
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    const numeroSerieNfe =
      Number(form.serieNfe);

    const numeroSerieNfce =
      Number(form.serieNfce);

    const idCsc =
      form.idCsc.trim();

    const csc =
      form.csc.trim();

    const tokenNuvemFiscal =
      form.tokenNuvemFiscal.trim();

    if (
      !Number.isInteger(
        numeroSerieNfe
      ) ||
      numeroSerieNfe <= 0
    ) {
      setErro(
        "Informe uma série válida para a NF-e."
      );

      return;
    }

    if (
      !Number.isInteger(
        numeroSerieNfce
      ) ||
      numeroSerieNfce <= 0
    ) {
      setErro(
        "Informe uma série válida para a NFC-e."
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

          ambiente:
            form.ambiente,

          regimeTributario:
            form.regimeTributario,

          serieNfe:
            numeroSerieNfe,

          serieNfce:
            numeroSerieNfce,

          idCsc,

          csc,

          tokenNuvemFiscal,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

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
    form.ambiente ===
    "PRODUCAO";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Emissão fiscal */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={Landmark}
          titulo="Emissão fiscal"
          descricao="Configure o ambiente, o regime tributário e a numeração dos documentos."
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
              Use homologação enquanto
              estiver realizando testes.
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
              value={
                form.regimeTributario
              }
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
                Simples Nacional — excesso
                de sublimite
              </option>

              <option value="REGIME_NORMAL">
                Regime Normal
              </option>
            </select>

            <p className="text-xs text-muted-foreground">
              O regime define o uso de CST
              ou CSOSN nos itens da nota.
            </p>
          </div>

          <CampoSerie
            id="serieNfe"
            label="Série da NF-e"
            descricao="Série utilizada para o modelo 55."
            value={form.serieNfe}
            onChange={(valor) =>
              atualizarCampo(
                "serieNfe",
                valor
              )
            }
            disabled={carregando}
          />

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
                ambiente terão validade
                fiscal. Revise o cadastro da
                empresa antes da transmissão.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* NFC-e */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <CabecalhoSecao
          icone={ReceiptText}
          titulo="NFC-e e CSC"
          descricao="Configure o Código de Segurança do Contribuinte utilizado na NFC-e."
          status={
            configuracao?.possuiCsc
              ? "configurado"
              : "pendente"
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
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
              atualizarCampo(
                "csc",
                valor
              )
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

      {/* Nuvem Fiscal */}

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
          value={
            form.tokenNuvemFiscal
          }
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
          Campo opcional. Deixe vazio para
          manter o token já armazenado.
        </p>
      </section>

      {/* Mensagens */}

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

      {/* Ações */}

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

  status?:
    | "configurado"
    | "pendente";
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
            <CircleDashed
              size={14}
            />
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

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoSerie({
  id,
  label,
  descricao,
  value,
  onChange,
  disabled = false,
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
        min={1}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
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

  onChange: (
    valor: string
  ) => void;

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
          type={
            mostrar
              ? "text"
              : "password"
          }
          className="h-11 pr-11"
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
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