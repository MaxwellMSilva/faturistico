"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function updateConfiguracaoCte(
  empresaId: string,
  data: {
    serieCte: number;
    rntrc: string;
  }
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CONFIGURACOES_EDITAR
  );

  if (
    !Number.isInteger(data.serieCte) ||
    data.serieCte < 1 ||
    data.serieCte > 999
  ) {
    return {
      success: false as const,
      message:
        "A série do CT-e deve ser um número inteiro entre 1 e 999.",
    };
  }

  const rntrcTexto =
    data.rntrc.trim().toUpperCase();

  const rntrc =
    rntrcTexto === "ISENTO"
      ? "ISENTO"
      : rntrcTexto.replace(/\D/g, "");

  if (
    !rntrc ||
    (rntrc !== "ISENTO" &&
      rntrc.length !== 8)
  ) {
    return {
      success: false as const,
      message:
        "Informe um RNTRC com 8 dígitos ou ISENTO.",
    };
  }

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
      select: { id: true },
    });

  if (!configuracao) {
    return {
      success: false as const,
      message:
        "Salve primeiro a configuração fiscal geral da empresa.",
    };
  }

  await prisma.configuracaoFiscal.update({
    where: { empresaId },
    data: {
      serieCte: data.serieCte,
      rntrc,
    },
  });

  revalidatePath(
    `/empresa/${empresaId}/cte`
  );
  revalidatePath(
    `/empresa/${empresaId}/configuracoes`
  );

  return {
    success: true as const,
  };
}
