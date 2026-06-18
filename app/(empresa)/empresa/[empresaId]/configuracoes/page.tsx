import {
  CircleCheck,
  CircleDashed,
  FileKey2,
  Landmark,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { getConfiguracaoFiscal } from "@/actions/configuracao-fiscal/get-configuracao-fiscal";

import { getCertificadoAtivo } from "@/actions/certificado/get-certificado-ativo";

import { ConfiguracaoFiscalForm } from "@/components/configuracao-fiscal/configuracao-fiscal-form";

import { CertificadoDigitalForm } from "@/components/certificado/certificado-digital-form";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

export default async function ConfiguracoesPage({
  params,
}: Props) {
  const { empresaId } =
    await params;

  const [
    configuracao,
    certificado,
  ] = await Promise.all([
    getConfiguracaoFiscal(
      empresaId
    ),

    getCertificadoAtivo(
      empresaId
    ),
  ]);

  const configuracaoCadastrada =
    Boolean(configuracao);

  const certificadoCadastrado =
    Boolean(certificado);

  return (
    <div className="w-full space-y-8">
      {/* Cabeçalho */}

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure o ambiente fiscal,
            a numeração dos documentos e
            o certificado digital desta
            empresa.
          </p>
        </div>
      </div>

      {/* Indicadores */}

      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard
          titulo="Configuração fiscal"
          descricao={
            configuracaoCadastrada
              ? "Os parâmetros fiscais da empresa estão cadastrados."
              : "Os parâmetros fiscais ainda precisam ser configurados."
          }
          configurado={
            configuracaoCadastrada
          }
          icone={Landmark}
        />

        <StatusCard
          titulo="Certificado digital"
          descricao={
            certificadoCadastrado
              ? "Existe um certificado digital ativo para esta empresa."
              : "Nenhum certificado digital ativo foi cadastrado."
          }
          configurado={
            certificadoCadastrado
          }
          icone={FileKey2}
        />
      </section>

      {/* Configuração fiscal */}

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Configuração fiscal
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Defina o regime tributário,
              ambiente, série e parâmetros
              utilizados na emissão da NF-e.
            </p>
          </div>
        </div>

        <ConfiguracaoFiscalForm
          empresaId={empresaId}
          configuracao={
            configuracao
          }
        />
      </section>

      {/* Certificado digital */}

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Certificado digital
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre o certificado A1
              que será utilizado para
              assinar e transmitir os
              documentos fiscais.
            </p>
          </div>
        </div>

        {!certificadoCadastrado && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Certificado não cadastrado
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Você pode continuar
              cadastrando clientes,
              produtos, naturezas de
              operação e rascunhos de
              NF-e. O certificado será
              necessário apenas para
              assinar e transmitir os
              documentos à SEFAZ.
            </p>
          </div>
        )}

        <CertificadoDigitalForm
          empresaId={empresaId}
          certificado={
            certificado
          }
        />
      </section>
    </div>
  );
}

type StatusCardProps = {
  titulo: string;
  descricao: string;

  configurado: boolean;

  icone: typeof Settings;
};

function StatusCard({
  titulo,
  descricao,
  configurado,
  icone: Icone,
}: StatusCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icone size={21} />
          </div>

          <div>
            <p className="font-semibold">
              {titulo}
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {descricao}
            </p>
          </div>
        </div>

        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            configurado
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          ].join(" ")}
        >
          {configurado ? (
            <CircleCheck size={14} />
          ) : (
            <CircleDashed size={14} />
          )}

          {configurado
            ? "Configurado"
            : "Pendente"}
        </span>
      </div>
    </div>
  );
}