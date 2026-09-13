"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { gerarXmlCte } from "@/lib/cte/gerar-xml";
import { validarCte } from "@/lib/cte/validar-cte";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function validarCteAction(
  empresaId: string,
  cteId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VALIDAR
  );

  const cte =
    await prisma.conhecimentoTransporte.findFirst({
      where: {
        id: cteId,
        empresaId,
      },
      include: {
        participantes: true,
        documentosNfe: true,
        quantidadesCarga: true,
        componentesValor: true,
        empresa: true,
      },
    });

  if (!cte) {
    return {
      success: false as const,
      message: "CT-e não encontrado.",
    };
  }

  if (
    ![
      "RASCUNHO",
      "VALIDADO",
      "REJEITADO",
    ].includes(cte.status)
  ) {
    return {
      success: false as const,
      message:
        "Este CT-e não está em uma situação que permita nova validação.",
    };
  }

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
    });

  const erros = validarCte({
    cte,
    empresa: cte.empresa,
    configuracao,
  });

  if (erros.length > 0) {
    await prisma.conhecimentoTransporte.update({
      where: { id: cteId },
      data: {
        status: "RASCUNHO",
        motivoRejeicao:
          erros.map((erro) => erro.mensagem).join(" | "),
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/cte/${cteId}`
    );

    return {
      success: false as const,
      message:
        "O CT-e possui pendências de validação.",
      erros,
    };
  }

  try {
    const gerado = await gerarXmlCte(cteId);

    await prisma.conhecimentoTransporte.update({
      where: { id: cteId },
      data: {
        status: "VALIDADO",
        chaveAcesso: gerado.chaveAcesso,
        numeroAleatorio:
          gerado.codigoNumerico,
        qrCode: gerado.qrCode,
        xmlGerado: gerado.xml,
        motivoRejeicao: null,
        codigoStatusSefaz: null,
        motivoStatusSefaz: null,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${empresaId}/cte/${cteId}`
    );

    return {
      success: true as const,
      message:
        "CT-e validado e XML 4.00 gerado com sucesso.",
      chaveAcesso: gerado.chaveAcesso,
    };
  } catch (error) {
    console.error(
      "Erro ao gerar XML do CT-e:",
      error
    );

    return {
      success: false as const,
      message:
        error instanceof Error &&
        error.message ===
          "EMISSAO_TIPO_CTE_NAO_IMPLEMENTADA"
          ? "A transmissão fiscal está habilitada para CT-e Normal."
          : "Não foi possível gerar o XML do CT-e.",
    };
  }
}
