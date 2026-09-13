"use server";

import { PrivilegioEmpresa } from "@prisma/client";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { prisma } from "@/lib/prisma";

export async function getPagamentosNfe(
  empresaId: string,
  notaFiscalId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.NFE_VISUALIZAR
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
      },
      select: {
        status: true,
        valorTotal: true,
        pagamentos: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            indicador: true,
            meioPagamento: true,
            valor: true,
            descricaoMeioPagamento: true,
          },
        },
      },
    });

  if (!nota) {
    return null;
  }

  return {
    podeEditar:
      nota.status === "RASCUNHO",
    valorTotal:
      Number(nota.valorTotal),
    pagamentos:
      nota.pagamentos.map(
        (item) => ({
          id: item.id,
          indicador: item.indicador,
          meioPagamento:
            item.meioPagamento,
          valor: Number(item.valor),
          descricaoMeioPagamento:
            item.descricaoMeioPagamento,
        })
      ),
  };
}
