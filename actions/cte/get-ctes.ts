"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getCtes(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    { exigirEmpresaAtiva: false }
  );

  const ctes =
    await prisma.conhecimentoTransporte.findMany({
      where: { empresaId },
      orderBy: [
        { dataEmissao: "desc" },
        { numero: "desc" },
      ],
      include: {
        participantes: {
          where: {
            papel: {
              in: [
                "REMETENTE",
                "DESTINATARIO",
              ],
            },
          },
          select: {
            papel: true,
            nome: true,
            cpfCnpj: true,
          },
        },
      },
    });

  return ctes.map((cte) => ({
    id: cte.id,
    numero: cte.numero,
    serie: cte.serie,
    status: cte.status,
    tipoCte: cte.tipoCte,
    dataEmissao: cte.dataEmissao,
    chaveAcesso: cte.chaveAcesso,
    valorPrestacao:
      Number(cte.valorPrestacao),
    valorReceber:
      Number(cte.valorReceber),
    municipioInicio:
      cte.municipioInicio,
    ufInicio: cte.ufInicio,
    municipioFim: cte.municipioFim,
    ufFim: cte.ufFim,
    remetente:
      cte.participantes.find(
        (item) =>
          item.papel === "REMETENTE"
      ) ?? null,
    destinatario:
      cte.participantes.find(
        (item) =>
          item.papel === "DESTINATARIO"
      ) ?? null,
  }));
}
