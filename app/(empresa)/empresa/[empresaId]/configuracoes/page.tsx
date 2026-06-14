import { Settings } from "lucide-react";

import { getConfiguracaoFiscal } from "@/actions/configuracao-fiscal/get-configuracao-fiscal";

import { ConfiguracaoFiscalForm } from "@/components/configuracao-fiscal/configuracao-fiscal-form";
import { getCertificadoAtivo } from "@/actions/certificado/get-certificado-ativo";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Configurações
          </h1>

          <p className="text-muted-foreground">
            Configure os dados fiscais da empresa.
          </p>
        </div>
      </div>

      <ConfiguracaoFiscalForm
        empresaId={empresaId}
        configuracao={
          configuracao
        }
      />

      <CertificadoDigitalForm
        empresaId={empresaId}
        certificado={certificado}
      />
    </div>
  );
}