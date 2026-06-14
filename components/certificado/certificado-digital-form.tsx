"use client";

import {
  FormEvent,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  FileKey2,
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
  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(valor));
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

  const [carregando, setCarregando] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const arquivo =
      arquivoRef.current
        ?.files?.[0];

    if (!arquivo) {
      alert(
        "Selecione o certificado."
      );

      return;
    }

    if (!senha) {
      alert(
        "Informe a senha do certificado."
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
        alert(resultado.message);

        return;
      }

      alert(
        "Certificado cadastrado com sucesso."
      );

      setSenha("");

      if (arquivoRef.current) {
        arquivoRef.current.value =
          "";
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível enviar o certificado."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileKey2 size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Certificado Digital A1
          </h2>

          <p className="text-sm text-muted-foreground">
            Envie o certificado utilizado
            para assinar os documentos fiscais.
          </p>
        </div>
      </div>

      {certificado ? (
        <div className="mb-6 grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Arquivo
            </p>

            <p className="text-sm font-medium">
              {certificado.nomeArquivo}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Titular
            </p>

            <p className="text-sm font-medium">
              {certificado.titular ??
                "Não identificado"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Validade
            </p>

            <p className="text-sm font-medium">
              {formatarData(
                certificado.validadeFim
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Emitido por
            </p>

            <p className="text-sm font-medium">
              {certificado.emitidoPor ??
                "Não identificado"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Número de série
            </p>

            <p className="break-all text-sm font-medium">
              {certificado.serialNumber ??
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Situação
            </p>

            <p
              className={
                certificado.diasParaExpirar <=
                30
                  ? "text-sm font-medium text-red-600"
                  : "text-sm font-medium text-green-700"
              }
            >
              {certificado.diasParaExpirar >
              0
                ? `${certificado.diasParaExpirar} dias restantes`
                : "Expirado"}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          Nenhum certificado ativo
          cadastrado.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <Input
          ref={arquivoRef}
          type="file"
          accept=".pfx,.p12,application/x-pkcs12"
          disabled={carregando}
          required
        />

        <Input
          type="password"
          placeholder="Senha do certificado"
          value={senha}
          onChange={(event) =>
            setSenha(
              event.target.value
            )
          }
          disabled={carregando}
          required
        />

        <Button
          type="submit"
          disabled={carregando}
        >
          <Upload size={17} />

          {carregando
            ? "Enviando..."
            : certificado
              ? "Substituir"
              : "Enviar"}
        </Button>
      </form>
    </section>
  );
}