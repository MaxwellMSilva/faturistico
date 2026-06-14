"use client";

import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  Eye,
  EyeOff,
  FileKey2,
  Fingerprint,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { uploadCertificado } from "@/actions/certificado/upload-certificado";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Certificado = {
  id: string;
  nomeArquivo: string;

  titular: string | null;
  cnpjTitular: string | null;
  emitidoPor: string | null;
  serialNumber: string | null;

  validadeInicio: string;
  validadeFim: string;

  diasParaExpirar: number;
};

type Props = {
  empresaId: string;

  certificado:
    | Certificado
    | null;
};

function formatarData(
  valor: string
) {
  const data = new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "Não identificada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
    }
  ).format(data);
}

function formatarCnpj(
  valor?: string | null
) {
  if (!valor) {
    return "Não identificado";
  }

  const numeros =
    valor.replace(/\D/g, "");

  if (numeros.length !== 14) {
    return valor;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function obterStatusCertificado(
  diasParaExpirar: number
) {
  if (diasParaExpirar <= 0) {
    return {
      texto: "Expirado",

      descricao:
        "Este certificado não pode mais ser utilizado.",

      classe:
        "bg-destructive/10 text-destructive",

      icone: AlertTriangle,
    };
  }

  if (diasParaExpirar <= 30) {
    return {
      texto:
        `${diasParaExpirar} ${
          diasParaExpirar === 1
            ? "dia restante"
            : "dias restantes"
        }`,

      descricao:
        "O certificado está próximo do vencimento.",

      classe:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400",

      icone: AlertTriangle,
    };
  }

  return {
    texto:
      `${diasParaExpirar} dias restantes`,

    descricao:
      "O certificado está dentro do período de validade.",

    classe:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

    icone: BadgeCheck,
  };
}

export function CertificadoDigitalForm({
  empresaId,
  certificado,
}: Props) {
  const router = useRouter();

  const arquivoRef =
    useRef<HTMLInputElement>(
      null
    );

  const [senha, setSenha] =
    useState("");

  const [
    arquivoSelecionado,
    setArquivoSelecionado,
  ] = useState<File | null>(
    null
  );

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

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

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setSenha("");
    setArquivoSelecionado(
      null
    );

    setMostrarSenha(false);

    if (arquivoRef.current) {
      arquivoRef.current.value =
        "";
    }
  }

  function selecionarArquivo(
    arquivo?: File
  ) {
    limparMensagens();

    if (!arquivo) {
      setArquivoSelecionado(
        null
      );

      return;
    }

    const extensao =
      arquivo.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extensao !== "pfx" &&
      extensao !== "p12"
    ) {
      setErro(
        "Selecione um certificado no formato .pfx ou .p12."
      );

      setArquivoSelecionado(
        null
      );

      if (arquivoRef.current) {
        arquivoRef.current.value =
          "";
      }

      return;
    }

    const tamanhoMaximo =
      10 * 1024 * 1024;

    if (
      arquivo.size >
      tamanhoMaximo
    ) {
      setErro(
        "O certificado deve possuir no máximo 10 MB."
      );

      setArquivoSelecionado(
        null
      );

      if (arquivoRef.current) {
        arquivoRef.current.value =
          "";
      }

      return;
    }

    setArquivoSelecionado(
      arquivo
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    const arquivo =
      arquivoSelecionado ??
      arquivoRef.current
        ?.files?.[0];

    if (!arquivo) {
      setErro(
        "Selecione o arquivo do certificado digital."
      );

      return;
    }

    if (!senha.trim()) {
      setErro(
        "Informe a senha do certificado digital."
      );

      return;
    }

    try {
      setCarregando(true);

      const formData =
        new FormData();

      formData.append(
        "arquivo",
        arquivo
      );

      formData.append(
        "senha",
        senha
      );

      const resultado =
        await uploadCertificado(
          empresaId,
          formData
        );

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      limparFormulario();

      setMensagem(
        certificado
          ? "Certificado digital substituído com sucesso."
          : "Certificado digital cadastrado com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao enviar certificado:",
        error
      );

      setErro(
        "Não foi possível enviar o certificado digital. Verifique o arquivo e a senha."
      );
    } finally {
      setCarregando(false);
    }
  }

  const status =
    certificado
      ? obterStatusCertificado(
          certificado
            .diasParaExpirar
        )
      : null;

  const StatusIcone =
    status?.icone;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      {/* Cabeçalho */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileKey2 size={22} />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Certificado digital A1
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Envie o arquivo utilizado
              para assinar os documentos
              fiscais da empresa.
            </p>
          </div>
        </div>

        {status &&
          StatusIcone && (
            <span
              className={[
                "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                status.classe,
              ].join(" ")}
            >
              <StatusIcone
                size={14}
              />

              {status.texto}
            </span>
          )}
      </div>

      {/* Certificado cadastrado */}

      {certificado ? (
        <div className="mb-6 space-y-4">
          <div className="grid gap-4 rounded-xl border bg-muted/10 p-4 sm:grid-cols-2 xl:grid-cols-3">
            <InformacaoCertificado
              icone={FileKey2}
              titulo="Arquivo"
              valor={
                certificado.nomeArquivo
              }
            />

            <InformacaoCertificado
              icone={Building2}
              titulo="Titular"
              valor={
                certificado.titular ??
                "Não identificado"
              }
            />

            <InformacaoCertificado
              icone={Building2}
              titulo="CNPJ do titular"
              valor={formatarCnpj(
                certificado.cnpjTitular
              )}
            />

            <InformacaoCertificado
              icone={ShieldCheck}
              titulo="Emitido por"
              valor={
                certificado.emitidoPor ??
                "Não identificado"
              }
            />

            <InformacaoCertificado
              icone={Fingerprint}
              titulo="Número de série"
              valor={
                certificado.serialNumber ??
                "Não identificado"
              }
              quebrarTexto
            />

            <InformacaoCertificado
              icone={CalendarDays}
              titulo="Período de validade"
              valor={`${formatarData(
                certificado.validadeInicio
              )} até ${formatarData(
                certificado.validadeFim
              )}`}
            />
          </div>

          {status && (
            <div
              className={[
                "flex items-start gap-3 rounded-xl border px-4 py-3",
                certificado
                  .diasParaExpirar <=
                0
                  ? "border-destructive/30 bg-destructive/10"
                  : certificado
                        .diasParaExpirar <=
                      30
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10",
              ].join(" ")}
            >
              {StatusIcone && (
                <StatusIcone
                  size={19}
                  className={[
                    "mt-0.5 shrink-0",
                    status.classe,
                  ].join(" ")}
                />
              )}

              <div>
                <p
                  className={[
                    "text-sm font-medium",
                    status.classe,
                  ].join(" ")}
                >
                  {status.texto}
                </p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {status.descricao}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-dashed bg-muted/10 px-4 py-5">
          <FileKey2
            size={20}
            className="mt-0.5 shrink-0 text-muted-foreground"
          />

          <div>
            <p className="text-sm font-medium">
              Nenhum certificado ativo
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Você poderá preparar e
              validar os rascunhos de
              NF-e, mas precisará de um
              certificado A1 válido para
              assinar e transmitir os
              documentos.
            </p>
          </div>
        </div>
      )}

      {/* Formulário */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="arquivoCertificado"
              className="text-sm font-medium"
            >
              Arquivo do certificado
            </label>

            <Input
              id="arquivoCertificado"
              ref={arquivoRef}
              className="h-11 cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              type="file"
              accept=".pfx,.p12,application/x-pkcs12"
              onChange={(event) =>
                selecionarArquivo(
                  event.target
                    .files?.[0]
                )
              }
              disabled={carregando}
              required
            />

            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PFX e
              P12. Tamanho máximo: 10 MB.
            </p>

            {arquivoSelecionado && (
              <div className="rounded-lg border bg-muted/20 px-3 py-2">
                <p className="truncate text-sm font-medium">
                  {
                    arquivoSelecionado.name
                  }
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(
                    arquivoSelecionado.size /
                    1024
                  ).toFixed(1)}{" "}
                  KB
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="senhaCertificado"
              className="text-sm font-medium"
            >
              Senha do certificado
            </label>

            <div className="relative">
              <Input
                id="senhaCertificado"
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                className="h-11 pr-11"
                placeholder="Informe a senha do arquivo"
                value={senha}
                onChange={(event) => {
                  setSenha(
                    event.target.value
                  );

                  limparMensagens();
                }}
                disabled={carregando}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarSenha(
                    (valor) => !valor
                  )
                }
                disabled={carregando}
                aria-label={
                  mostrarSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                {mostrarSenha ? (
                  <EyeOff
                    size={17}
                  />
                ) : (
                  <Eye
                    size={17}
                  />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              A senha será utilizada
              para abrir e validar o
              certificado enviado.
            </p>
          </div>
        </div>

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

        <div className="flex justify-end border-t pt-5">
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

                Enviando...
              </>
            ) : (
              <>
                <Upload size={17} />

                {certificado
                  ? "Substituir certificado"
                  : "Enviar certificado"}
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

type InformacaoCertificadoProps = {
  icone: typeof FileKey2;

  titulo: string;
  valor: string;

  quebrarTexto?: boolean;
};

function InformacaoCertificado({
  icone: Icone,
  titulo,
  valor,
  quebrarTexto = false,
}: InformacaoCertificadoProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icone size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {titulo}
        </p>

        <p
          className={[
            "mt-1 text-sm font-medium",
            quebrarTexto
              ? "break-all"
              : "break-words",
          ].join(" ")}
        >
          {valor}
        </p>
      </div>
    </div>
  );
}