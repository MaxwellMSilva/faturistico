"use server";

import { Prisma, PrivilegioEmpresa } from "@prisma/client";

import {
  validarNfe,
  type ValidarNfeResult,
} from "@/actions/nfe/validar-nfe";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { obterTabelaClassTribRtc } from "@/lib/fiscal/classificacao-tributaria-rtc";
import { prisma } from "@/lib/prisma";

function iguais(
  atual: Prisma.Decimal,
  esperado: string
) {
  return atual
    .minus(new Prisma.Decimal(esperado))
    .abs()
    .lessThanOrEqualTo(
      new Prisma.Decimal("0.0001")
    );
}

export async function validarNfeCompleta(
  empresaId: string,
  notaFiscalId: string
): Promise<ValidarNfeResult> {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.NFE_VALIDAR
  );

  const resultadoBase =
    await validarNfe(
      empresaId,
      notaFiscalId
    );

  const erros = [
    ...resultadoBase.erros,
  ];

  const avisos = [
    ...resultadoBase.avisos,
  ];

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
      },
      select: {
        dataEmissao: true,
        itens: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            descricao: true,
            cstIbsCbs: true,
            classificacaoTributariaIbsCbs:
              true,
            aliquotaIbsUf: true,
            aliquotaIbsMun: true,
            aliquotaCbs: true,
          },
        },
      },
    });

  if (!nota) {
    return {
      success: false,
      erros,
      avisos,
    };
  }

  const tabela =
    await obterTabelaClassTribRtc();

  if (!tabela) {
    avisos.push(
      "A tabela oficial CST/cClassTrib da Reforma Tributária ainda não foi sincronizada. Atualize-a no cadastro de produtos antes da emissão."
    );
  } else {
    const porCodigo = new Map(
      tabela.classificacoes.map(
        (item) => [item.codigo, item]
      )
    );

    const idadeMs =
      Date.now() -
      tabela.atualizadoEm.getTime();

    if (
      idadeMs >
      24 * 60 * 60 * 1000
    ) {
      avisos.push(
        "A tabela oficial CST/cClassTrib está há mais de 24 horas sem atualização. Sincronize-a antes da emissão."
      );
    }

    nota.itens.forEach(
      (item, indice) => {
        const prefixo =
          `Item ${indice + 1} (${item.descricao}):`;

        const codigo =
          item.classificacaoTributariaIbsCbs ??
          "";

        if (!/^\d{6}$/.test(codigo)) {
          return;
        }

        const oficial =
          porCodigo.get(codigo);

        if (!oficial) {
          erros.push(
            `${prefixo} o cClassTrib ${codigo} não consta na tabela oficial sincronizada.`
          );
          return;
        }

        if (
          oficial.permiteNfe === false
        ) {
          erros.push(
            `${prefixo} o cClassTrib ${codigo} não é aplicável à NF-e segundo a tabela oficial.`
          );
        }

        if (
          item.cstIbsCbs !== oficial.cst
        ) {
          erros.push(
            `${prefixo} o CST IBS/CBS deve ser ${oficial.cst} para o cClassTrib ${codigo}.`
          );
        }
      }
    );
  }

  if (
    nota.dataEmissao.getFullYear() === 2026
  ) {
    nota.itens.forEach(
      (item, indice) => {
        if (
          item.cstIbsCbs !== "000" ||
          item.classificacaoTributariaIbsCbs !==
            "000001"
        ) {
          return;
        }

        const prefixo =
          `Item ${indice + 1} (${item.descricao}):`;

        if (
          !iguais(
            item.aliquotaIbsUf,
            "0.1"
          )
        ) {
          erros.push(
            `${prefixo} para tributação integral em 2026, a alíquota do IBS estadual deve ser 0,10%.`
          );
        }

        if (
          !iguais(
            item.aliquotaIbsMun,
            "0"
          )
        ) {
          erros.push(
            `${prefixo} para tributação integral em 2026, a alíquota do IBS municipal deve ser 0%.`
          );
        }

        if (
          !iguais(
            item.aliquotaCbs,
            "0.9"
          )
        ) {
          erros.push(
            `${prefixo} para tributação integral em 2026, a alíquota da CBS deve ser 0,90%.`
          );
        }
      }
    );
  }

  return {
    success:
      resultadoBase.success &&
      erros.length === 0,
    erros,
    avisos,
  };
}
