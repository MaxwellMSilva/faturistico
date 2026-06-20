"use server";

import { revalidatePath } from "next/cache";
import { PrivilegioEmpresa } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { obterProximoNumero } from "@/lib/fiscal/obter-proximo-numero";

type CreateRascunhoNfeData = {
  empresaId: string;
  clienteId: string;
  naturezaOperacaoId: string;
  informacoesComplementares?: string;
};

type CreateRascunhoNfeResult =
  | { success: true; notaFiscalId: string }
  | { success: false; message: string };

function combinarInformacoesComplementares(
  padrao?: string | null,
  informada?: string | null
) {
  const partes = [padrao?.trim(), informada?.trim()].filter(
    (valor): valor is string => Boolean(valor)
  );

  return partes.length > 0 ? partes.join("\n") : null;
}

function normalizarUf(valor?: string | null) {
  return valor?.trim().toUpperCase() ?? "";
}

function paisExterior(codigoPais?: string | null) {
  const codigo = codigoPais?.replace(/\D/g, "") ?? "";
  return Boolean(codigo && codigo !== "1058");
}

export async function createRascunhoNfe(
  data: CreateRascunhoNfeData
): Promise<CreateRascunhoNfeResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.NFE_CRIAR
  );

  if (!data.clienteId) {
    return { success: false, message: "Selecione o cliente." };
  }

  if (!data.naturezaOperacaoId) {
    return { success: false, message: "Selecione a natureza de operação." };
  }

  const [empresa, cliente, natureza, configuracao] = await Promise.all([
    prisma.empresa.findFirst({
      where: { id: data.empresaId, ativo: true },
      select: { id: true, uf: true, codigoPais: true },
    }),
    prisma.cliente.findFirst({
      where: {
        id: data.clienteId,
        empresaId: data.empresaId,
        ativo: true,
      },
      select: {
        id: true,
        uf: true,
        codigoPais: true,
        inscricaoEstadual: true,
      },
    }),
    prisma.naturezaOperacao.findFirst({
      where: {
        id: data.naturezaOperacaoId,
        empresaId: data.empresaId,
        ativo: true,
      },
      select: {
        id: true,
        destinoOperacao: true,
        indicadorIeDestinatario: true,
        informacoesComplementaresPadrao: true,
      },
    }),
    prisma.configuracaoFiscal.findUnique({
      where: { empresaId: data.empresaId },
      select: { serieNfe: true },
    }),
  ]);

  if (!empresa) {
    return { success: false, message: "Empresa ativa não encontrada." };
  }

  if (!cliente) {
    return {
      success: false,
      message: "Cliente ativo não encontrado nesta empresa.",
    };
  }

  if (!natureza) {
    return {
      success: false,
      message: "Natureza de operação ativa não encontrada nesta empresa.",
    };
  }

  if (!configuracao) {
    return {
      success: false,
      message: "Configure os dados fiscais da empresa antes de criar a NF-e.",
    };
  }

  if (
    natureza.indicadorIeDestinatario === "CONTRIBUINTE" &&
    !cliente.inscricaoEstadual?.trim()
  ) {
    return {
      success: false,
      message:
        "A natureza exige destinatário contribuinte de ICMS, mas o cliente não possui inscrição estadual.",
    };
  }

  const ufEmpresa = normalizarUf(empresa.uf);
  const ufCliente = normalizarUf(cliente.uf);
  const clienteNoExterior = paisExterior(cliente.codigoPais);

  if (!ufEmpresa || (!ufCliente && !clienteNoExterior)) {
    return {
      success: false,
      message:
        "Complete a UF da empresa e do cliente antes de criar a NF-e.",
    };
  }

  if (
    natureza.destinoOperacao === "INTERNA" &&
    (clienteNoExterior || ufEmpresa !== ufCliente)
  ) {
    return {
      success: false,
      message:
        "O CFOP desta natureza é de operação interna, mas o cliente está em outra UF ou no exterior.",
    };
  }

  if (
    natureza.destinoOperacao === "INTERESTADUAL" &&
    (clienteNoExterior || ufEmpresa === ufCliente)
  ) {
    return {
      success: false,
      message:
        "O CFOP desta natureza é interestadual, mas o cliente está na mesma UF ou no exterior.",
    };
  }

  if (
    natureza.destinoOperacao === "EXTERIOR" &&
    !clienteNoExterior
  ) {
    return {
      success: false,
      message:
        "O CFOP desta natureza é de operação com exterior, mas o cliente está cadastrado no Brasil.",
    };
  }

  const informacoesComplementares = combinarInformacoesComplementares(
    natureza.informacoesComplementaresPadrao,
    data.informacoesComplementares
  );

  try {
    const nota = await prisma.$transaction(async (tx) => {
      const numero = await obterProximoNumero({
        tx,
        empresaId: data.empresaId,
        tipoDocumento: "NFE",
        serie: configuracao.serieNfe,
      });

      return tx.notaFiscal.create({
        data: {
          empresaId: data.empresaId,
          clienteId: data.clienteId,
          naturezaOperacaoId: data.naturezaOperacaoId,
          tipoDocumento: "NFE",
          numero,
          serie: configuracao.serieNfe,
          status: "RASCUNHO",
          valorProdutos: 0,
          valorFrete: 0,
          valorDesconto: 0,
          valorOutros: 0,
          valorTotal: 0,
          informacoesComplementares,
        },
        select: { id: true },
      });
    });

    revalidatePath(`/empresa/${data.empresaId}/nfe`);

    return { success: true, notaFiscalId: nota.id };
  } catch (error) {
    console.error("Erro ao criar rascunho da NF-e:", error);
    return {
      success: false,
      message: "Não foi possível criar o rascunho da NF-e.",
    };
  }
}
