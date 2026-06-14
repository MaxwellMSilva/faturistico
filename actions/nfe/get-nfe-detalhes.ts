"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getNfeDetalhes(
  empresaId: string,
  notaFiscalId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
      },

      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
          },
        },

        naturezaOperacao: {
          select: {
            id: true,
            descricao: true,
            cfop: true,
          },
        },

        itens: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!nota) {
    return null;
  }

  const produtos =
    await prisma.produto.findMany({
      where: {
        empresaId,
        ativo: true,
        tipo: "PRODUTO",
      },

      select: {
        id: true,
        codigo: true,
        descricao: true,
        tipo: true,
        unidade: true,

        ncm: true,
        cfopPadrao: true,

        valorUnitario: true,
      },

      orderBy: {
        descricao: "asc",
      },
    });

  return {
    nota: {
      id: nota.id,

      numero: nota.numero,
      serie: nota.serie,

      status: nota.status,

      dataEmissao:
        nota.dataEmissao.toISOString(),

      informacoesComplementares:
        nota.informacoesComplementares,

      cliente: nota.cliente,

      naturezaOperacao:
        nota.naturezaOperacao,

      valorProdutos:
        Number(nota.valorProdutos),

      valorFrete:
        Number(nota.valorFrete),

      valorDesconto:
        Number(nota.valorDesconto),

      valorOutros:
        Number(nota.valorOutros),

      valorBaseIcms:
        Number(nota.valorBaseIcms),

      valorIcms:
        Number(nota.valorIcms),

      valorPis:
        Number(nota.valorPis),

      valorCofins:
        Number(nota.valorCofins),

      valorIpi:
        Number(nota.valorIpi),

      valorTotal:
        Number(nota.valorTotal),

      itens: nota.itens.map(
        (item) => ({
          id: item.id,

          produtoId:
            item.produtoId,

          codigoProduto:
            item.codigoProduto,

          descricao:
            item.descricao,

          unidade:
            item.unidade,

          ean:
            item.ean,

          ncm:
            item.ncm,

          cest:
            item.cest,

          cfop:
            item.cfop,

          quantidade:
            Number(
              item.quantidade
            ),

          valorUnitario:
            Number(
              item.valorUnitario
            ),

          valorBruto:
            Number(
              item.valorBruto
            ),

          valorDesconto:
            Number(
              item.valorDesconto
            ),

          valorTotal:
            Number(
              item.valorTotal
            ),

          origemMercadoria:
            item.origemMercadoria,

          cstIcms:
            item.cstIcms,

          csosnIcms:
            item.csosnIcms,

          baseCalculoIcms:
            Number(
              item.baseCalculoIcms
            ),

          aliquotaIcms:
            Number(
              item.aliquotaIcms
            ),

          valorIcms:
            Number(
              item.valorIcms
            ),

          cstPis:
            item.cstPis,

          baseCalculoPis:
            Number(
              item.baseCalculoPis
            ),

          aliquotaPis:
            Number(
              item.aliquotaPis
            ),

          valorPis:
            Number(
              item.valorPis
            ),

          cstCofins:
            item.cstCofins,

          baseCalculoCofins:
            Number(
              item.baseCalculoCofins
            ),

          aliquotaCofins:
            Number(
              item.aliquotaCofins
            ),

          valorCofins:
            Number(
              item.valorCofins
            ),

          cstIpi:
            item.cstIpi,

          codigoEnquadramentoIpi:
            item
              .codigoEnquadramentoIpi,

          baseCalculoIpi:
            Number(
              item.baseCalculoIpi
            ),

          aliquotaIpi:
            Number(
              item.aliquotaIpi
            ),

          valorIpi:
            Number(
              item.valorIpi
            ),
        })
      ),
    },

    produtos: produtos.map(
      (produto) => ({
        ...produto,

        valorUnitario:
          Number(
            produto.valorUnitario
          ),
      })
    ),
  };
}