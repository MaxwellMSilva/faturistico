import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { notFound } from "next/navigation";

import {
  CircleCheck,
  CircleDashed,
  ClipboardList,
  FileKey2,
  FileText,
  Settings,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { getConfiguracaoFiscal } from "@/actions/configuracao-fiscal/get-configuracao-fiscal";
import { getCertificadoAtivo } from "@/actions/certificado/get-certificado-ativo";
import { ConfiguracaoFiscalForm } from "@/components/configuracao-fiscal/configuracao-fiscal-form";
import { CertificadoDigitalForm } from "@/components/certificado/certificado-digital-form";
import { obterPrivilegiosEmpresa } from "@/lib/empresa/obter-privilegios-empresa";

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

  const permissoes =
    await obterPrivilegiosEmpresa(
      empresaId
    );

  const podeVerConfiguracaoFiscal =
    permissoes.privilegios.includes(
      PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR
    );

  const podeEditarConfiguracaoFiscal =
    permissoes.privilegios.includes(
      PrivilegioEmpresa.CONFIGURACOES_EDITAR
    ) &&
    !permissoes.somenteLeitura;

  const podeVerCertificado =
    permissoes.privilegios.includes(
      PrivilegioEmpresa.CERTIFICADO_VISUALIZAR
    );

  if (
    !podeVerConfiguracaoFiscal &&
    !podeVerCertificado
  ) {
    notFound();
  }

  const [
    configuracao,
    certificado,
  ] = await Promise.all([
    podeVerConfiguracaoFiscal
      ? getConfiguracaoFiscal(
          empresaId
        )
      : null,

    podeVerCertificado
      ? getCertificadoAtivo(
          empresaId
        )
      : null,
  ]);

  const nfConfigurada =
    Boolean(
      configuracao &&
        configuracao.serieNfe > 0 &&
        configuracao.serieNfce > 0
    );

  const cteConfigurado =
    Boolean(
      configuracao &&
        configuracao.serieCte > 0 &&
        configuracao.rntrc
    );

  const mdfeConfigurado =
    Boolean(
      configuracao &&
        configuracao.serieMdfe > 0 &&
        configuracao.rntrc
    );

  const certificadoCadastrado =
    Boolean(certificado);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            Centralize os parâmetros de emissão da NF-e, NFC-e, CT-e e MDF-e, além do certificado digital e das integrações fiscais da empresa.
          </p>
        </div>
      </div>

      {podeVerConfiguracaoFiscal && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            titulo="NF-e / NFC-e"
            descricao={
              nfConfigurada
                ? `Séries ${configuracao?.serieNfe} e ${configuracao?.serieNfce} configuradas.`
                : "Defina séries, numeração e parâmetros de emissão."
            }
            configurado={nfConfigurada}
            icone={FileText}
          />

          <StatusCard
            titulo="CT-e"
            descricao={
              cteConfigurado
                ? `Série ${configuracao?.serieCte} e RNTRC configurados.`
                : "Defina série, numeração e RNTRC do CT-e."
            }
            configurado={cteConfigurado}
            icone={Truck}
          />

          <StatusCard
            titulo="MDF-e"
            descricao={
              mdfeConfigurado
                ? `Série ${configuracao?.serieMdfe} e RNTRC configurados.`
                : "Defina série, numeração e parâmetros do manifesto."
            }
            configurado={mdfeConfigurado}
            icone={ClipboardList}
          />

          {podeVerCertificado && (
            <StatusCard
              titulo="Certificado A1"
              descricao={
                certificadoCadastrado
                  ? "Existe um certificado digital ativo para assinatura fiscal."
                  : "Cadastre o certificado que assinará os documentos."
              }
              configurado={
                certificadoCadastrado
              }
              icone={FileKey2}
            />
          )}
        </section>
      )}

      {podeVerConfiguracaoFiscal && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Parâmetros de emissão
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Altere aqui todos os parâmetros gerais e específicos utilizados na emissão dos documentos fiscais. As telas de NF-e, CT-e e MDF-e ficam focadas somente na operação dos documentos.
            </p>
          </div>

          <ConfiguracaoFiscalForm
            empresaId={empresaId}
            configuracao={configuracao}
            podeEditar={
              podeEditarConfiguracaoFiscal
            }
          />
        </section>
      )}

      {podeVerCertificado && (
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
                Cadastre o certificado A1 utilizado para assinar e transmitir NF-e, CT-e e MDF-e.
              </p>
            </div>
          </div>

          {!certificadoCadastrado && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Certificado não cadastrado
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                O certificado A1 será necessário para assinar e transmitir os documentos fiscais à SEFAZ. Rascunhos podem ser preparados antes do cadastro do certificado.
              </p>
            </div>
          )}

          <CertificadoDigitalForm
            empresaId={empresaId}
            certificado={certificado}
          />
        </section>
      )}
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
