"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

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

type UpdateParametrosMdfeData = {
  empresaId: string;
  modeloMdfe: number;
  ambienteMdfe: AmbienteFiscal;
  tipoEmissaoMdfe: TipoEmissaoMdfe;
  modalMdfe: ModalMdfe;
  tipoEmitenteMdfe: TipoEmitenteMdfe;
  serieMdfe: number;
  numeracaoManualMdfe: boolean;
  atualizarUltimoNumeroMdfe?: boolean;
  ultimoNumeroMdfe?: number;
};

type UpdateParametrosMdfeResult =
  | { success: true }
  | { success: false; message: string };

const TIPOS_EMISSAO_MDFE = new Set<TipoEmissaoMdfe>([
  "NORMAL",
  "CONTINGENCIA",
]);

const MODAIS_MDFE = new Set<ModalMdfe>([
  "RODOVIARIO",
  "AEREO",
  "AQUAVIARIO",
  "FERROVIARIO",
]);

const TIPOS_EMITENTE_MDFE = new Set<TipoEmitenteMdfe>([
  "PRESTADOR_SERVICO_TRANSPORTE",
  "TRANSPORTADOR_CARGA_PROPRIA",
  "PRESTADOR_SERVICO_CTE_GLOBALIZADO",
]);

export async function updateParametrosMdfe(
  data: UpdateParametrosMdfeData
): Promise<UpdateParametrosMdfeResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.CONFIGURACOES_EDITAR
  );

  if (data.modeloMdfe !== 58) {
    return {
      success: false,
      message:
        "Os parâmetros de MDF-e aceitam somente o modelo 58.",
    };
  }

  if (
    !Number.isInteger(data.serieMdfe) ||
    data.serieMdfe < 0 ||
    data.serieMdfe > 999
  ) {
    return {
      success: false,
      message:
        "A série do MDF-e deve estar entre 0 e 999.",
    };
  }

  if (!TIPOS_EMISSAO_MDFE.has(data.tipoEmissaoMdfe)) {
    return {
      success: false,
      message:
        "O tipo de emissão do MDF-e é inválido.",
    };
  }

  if (!MODAIS_MDFE.has(data.modalMdfe)) {
    return {
      success: false,
      message:
        "O modal padrão do MDF-e é inválido.",
    };
  }

  if (!TIPOS_EMITENTE_MDFE.has(data.tipoEmitenteMdfe)) {
    return {
      success: false,
      message:
        "O tipo de emitente do MDF-e é inválido.",
    };
  }

  if (
    data.atualizarUltimoNumeroMdfe &&
    (
      data.ultimoNumeroMdfe === undefined ||
      !Number.isInteger(data.ultimoNumeroMdfe) ||
      data.ultimoNumeroMdfe < 0 ||
      data.ultimoNumeroMdfe > 999_999_999
    )
  ) {
    return {
      success: false,
      message:
        "O último número do MDF-e deve estar entre 0 e 999999999.",
    };
  }

  const configuracaoAtual =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId: data.empresaId,
      },
      select: {
        serieMdfe: true,
        ultimoNumeroMdfe: true,
      },
    });

  if (!configuracaoAtual) {
    return {
      success: false,
      message:
        "Salve primeiro a configuração fiscal geral da empresa.",
    };
  }

  const ultimoNumeroMdfe =
    data.atualizarUltimoNumeroMdfe
      ? data.ultimoNumeroMdfe!
      : configuracaoAtual.serieMdfe === data.serieMdfe
        ? configuracaoAtual.ultimoNumeroMdfe
        : 0;

  await prisma.configuracaoFiscal.update({
    where: {
      empresaId: data.empresaId,
    },
    data: {
      modeloMdfe: data.modeloMdfe,
      ambienteMdfe: data.ambienteMdfe,
      tipoEmissaoMdfe: data.tipoEmissaoMdfe,
      modalMdfe: data.modalMdfe,
      tipoEmitenteMdfe: data.tipoEmitenteMdfe,
      serieMdfe: data.serieMdfe,
      ultimoNumeroMdfe,
      numeracaoManualMdfe:
        data.numeracaoManualMdfe,
    },
  });

  revalidatePath(
    `/empresa/${data.empresaId}/configuracoes`
  );

  return { success: true };
}
