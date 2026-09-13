"use server";

import { Prisma, PrivilegioEmpresa } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { prisma } from "@/lib/prisma";

type PagamentoEntrada = {
  indicador: "A_VISTA" | "A_PRAZO";
  meioPagamento: string;
  valor: number;
  descricaoMeioPagamento?: string;
};

type SalvarPagamentosNfeResult =
  | { success: true }
  | { success: false; message: string };

function normalizarCodigo(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

export async function salvarPagamentosNfe(
  empresaId: string,
  notaFiscalId: string,
  pagamentos: PagamentoEntrada[]
): Promise<SalvarPagamentosNfeResult> {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.NFE_EDITAR
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
        status: "RASCUNHO",
      },
      select: {
        id: true,
        valorTotal: true,
      },
    });

  if (!nota) {
    return {
      success: false,
      message:
        "A NF-e não foi encontrada ou não pode mais ser editada.",
    };
  }

  if (
    pagamentos.length < 1 ||
    pagamentos.length > 100
  ) {
    return {
      success: false,
      message:
        "Informe de 1 a 100 formas de pagamento.",
    };
  }

  const normalizados: Array<{
    indicador: "A_VISTA" | "A_PRAZO";
    meioPagamento: string;
    valor: Prisma.Decimal;
    descricaoMeioPagamento: string | null;
  }> = [];

  for (
    let indice = 0;
    indice < pagamentos.length;
    indice++
  ) {
    const pagamento = pagamentos[indice];
    const meioPagamento = normalizarCodigo(
      pagamento.meioPagamento
    );

    if (!/^\d{2}$/.test(meioPagamento)) {
      return {
        success: false,
        message:
          `Pagamento ${indice + 1}: informe um código tPag válido com 2 números.`,
      };
    }

    if (
      pagamento.indicador !== "A_VISTA" &&
      pagamento.indicador !== "A_PRAZO"
    ) {
      return {
        success: false,
        message:
          `Pagamento ${indice + 1}: o indicador de pagamento é inválido.`,
      };
    }

    if (
      !Number.isFinite(pagamento.valor) ||
      pagamento.valor < 0
    ) {
      return {
        success: false,
        message:
          `Pagamento ${indice + 1}: informe um valor válido.`,
      };
    }

    const descricao =
      pagamento.descricaoMeioPagamento
        ?.trim() || null;

    if (
      meioPagamento === "99" &&
      (!descricao ||
        descricao.length < 2 ||
        descricao.length > 60)
    ) {
      return {
        success: false,
        message:
          `Pagamento ${indice + 1}: descreva o meio de pagamento quando tPag for 99-Outros.`,
      };
    }

    if (
      meioPagamento === "90" &&
      pagamento.valor !== 0
    ) {
      return {
        success: false,
        message:
          "Sem pagamento (tPag 90) deve possuir valor R$ 0,00.",
      };
    }

    normalizados.push({
      indicador: pagamento.indicador,
      meioPagamento,
      valor: new Prisma.Decimal(
        String(pagamento.valor)
      ).toDecimalPlaces(2),
      descricaoMeioPagamento:
        meioPagamento === "99"
          ? descricao
          : null,
    });
  }

  const semPagamento =
    normalizados.filter(
      (item) =>
        item.meioPagamento === "90"
    );

  if (
    semPagamento.length > 0 &&
    normalizados.length > 1
  ) {
    return {
      success: false,
      message:
        "A opção Sem pagamento (tPag 90) não pode ser combinada com outros meios de pagamento.",
    };
  }

  if (semPagamento.length === 0) {
    const totalPagamentos =
      normalizados.reduce(
        (total, item) =>
          total.plus(item.valor),
        new Prisma.Decimal(0)
      );

    if (
      totalPagamentos
        .minus(nota.valorTotal)
        .abs()
        .greaterThan(
          new Prisma.Decimal("0.01")
        )
    ) {
      return {
        success: false,
        message:
          `A soma dos pagamentos deve ser igual ao total da NF-e (R$ ${nota.valorTotal.toFixed(
            2
          )}).`,
      };
    }
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.pagamentoNotaFiscal.deleteMany({
          where: {
            notaFiscalId: nota.id,
          },
        });

        await tx.pagamentoNotaFiscal.createMany({
          data: normalizados.map(
            (item) => ({
              notaFiscalId: nota.id,
              ...item,
            })
          ),
        });
      }
    );

    revalidatePath(
      `/empresa/${empresaId}/nfe/${notaFiscalId}`
    );

    return { success: true };
  } catch (error) {
    console.error(
      "Erro ao salvar pagamentos da NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível salvar as formas de pagamento.",
    };
  }
}
