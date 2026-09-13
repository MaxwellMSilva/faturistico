"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getCte(
  empresaId: string,
  cteId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    { exigirEmpresaAtiva: false }
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
        pagamentosVinculados: true,
        eventos: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!cte) {
    return null;
  }

  return {
    ...cte,
    valorPrestacao:
      Number(cte.valorPrestacao),
    valorReceber:
      Number(cte.valorReceber),
    valorCarga: Number(cte.valorCarga),
    valorCargaAverbacao:
      cte.valorCargaAverbacao === null
        ? null
        : Number(cte.valorCargaAverbacao),
    percentualReducaoBc:
      cte.percentualReducaoBc === null
        ? null
        : Number(cte.percentualReducaoBc),
    baseCalculoIcms:
      cte.baseCalculoIcms === null
        ? null
        : Number(cte.baseCalculoIcms),
    aliquotaIcms:
      cte.aliquotaIcms === null
        ? null
        : Number(cte.aliquotaIcms),
    valorIcms:
      cte.valorIcms === null
        ? null
        : Number(cte.valorIcms),
    valorCreditoIcms:
      cte.valorCreditoIcms === null
        ? null
        : Number(cte.valorCreditoIcms),
    baseCalculoStRetido:
      cte.baseCalculoStRetido === null
        ? null
        : Number(cte.baseCalculoStRetido),
    aliquotaStRetido:
      cte.aliquotaStRetido === null
        ? null
        : Number(cte.aliquotaStRetido),
    valorIcmsStRetido:
      cte.valorIcmsStRetido === null
        ? null
        : Number(cte.valorIcmsStRetido),
    valorTotalTributos:
      cte.valorTotalTributos === null
        ? null
        : Number(cte.valorTotalTributos),
    baseCalculoUfFim:
      cte.baseCalculoUfFim === null
        ? null
        : Number(cte.baseCalculoUfFim),
    percentualFcpUfFim:
      cte.percentualFcpUfFim === null
        ? null
        : Number(cte.percentualFcpUfFim),
    percentualIcmsUfFim:
      cte.percentualIcmsUfFim === null
        ? null
        : Number(cte.percentualIcmsUfFim),
    percentualIcmsInterestadual:
      cte.percentualIcmsInterestadual === null
        ? null
        : Number(
            cte.percentualIcmsInterestadual
          ),
    valorFcpUfFim:
      cte.valorFcpUfFim === null
        ? null
        : Number(cte.valorFcpUfFim),
    valorIcmsUfFim:
      cte.valorIcmsUfFim === null
        ? null
        : Number(cte.valorIcmsUfFim),
    valorIcmsUfInicio:
      cte.valorIcmsUfInicio === null
        ? null
        : Number(cte.valorIcmsUfInicio),
    baseCalculoIbsCbs:
      cte.baseCalculoIbsCbs === null
        ? null
        : Number(cte.baseCalculoIbsCbs),
    aliquotaIbsUf:
      cte.aliquotaIbsUf === null
        ? null
        : Number(cte.aliquotaIbsUf),
    valorIbsUf:
      cte.valorIbsUf === null
        ? null
        : Number(cte.valorIbsUf),
    aliquotaIbsMunicipio:
      cte.aliquotaIbsMunicipio === null
        ? null
        : Number(cte.aliquotaIbsMunicipio),
    valorIbsMunicipio:
      cte.valorIbsMunicipio === null
        ? null
        : Number(cte.valorIbsMunicipio),
    valorIbs:
      cte.valorIbs === null
        ? null
        : Number(cte.valorIbs),
    aliquotaCbs:
      cte.aliquotaCbs === null
        ? null
        : Number(cte.aliquotaCbs),
    valorCbs:
      cte.valorCbs === null
        ? null
        : Number(cte.valorCbs),
    valorTotalDfe:
      cte.valorTotalDfe === null
        ? null
        : Number(cte.valorTotalDfe),
    quantidadesCarga:
      cte.quantidadesCarga.map(
        (item) => ({
          ...item,
          quantidade:
            Number(item.quantidade),
        })
      ),
    componentesValor:
      cte.componentesValor.map(
        (item) => ({
          ...item,
          valor: Number(item.valor),
        })
      ),
  };
}
