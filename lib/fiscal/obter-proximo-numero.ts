import type {
  Prisma,
  TipoDocumentoFiscal,
} from "@prisma/client";

type Params = {
  tx: Prisma.TransactionClient;

  empresaId: string;

  tipoDocumento:
    TipoDocumentoFiscal;

  serie: number;

  pularNumerosJaUtilizados?: boolean;
};

export async function obterProximoNumero({
  tx,
  empresaId,
  tipoDocumento,
  serie,
  pularNumerosJaUtilizados = false,
}: Params) {
  let sequencia =
    await tx.sequenciaFiscal.upsert({
      where: {
        empresaId_tipoDocumento_serie: {
          empresaId,
          tipoDocumento,
          serie,
        },
      },

      create: {
        empresaId,
        tipoDocumento,
        serie,
        ultimoNumero: 1,
      },

      update: {
        ultimoNumero: {
          increment: 1,
        },
      },

      select: {
        ultimoNumero: true,
      },
    });

  if (!pularNumerosJaUtilizados) {
    return sequencia.ultimoNumero;
  }

  while (true) {
    if (sequencia.ultimoNumero > 999999999) {
      throw new Error(
        "A numeração fiscal atingiu o limite de 999999999."
      );
    }

    const numeroJaUtilizado =
      await tx.notaFiscal.findFirst({
        where: {
          empresaId,
          tipoDocumento,
          serie,
          numero: sequencia.ultimoNumero,
        },
        select: {
          id: true,
        },
      });

    if (!numeroJaUtilizado) {
      return sequencia.ultimoNumero;
    }

    sequencia =
      await tx.sequenciaFiscal.update({
        where: {
          empresaId_tipoDocumento_serie: {
            empresaId,
            tipoDocumento,
            serie,
          },
        },
        data: {
          ultimoNumero: {
            increment: 1,
          },
        },
        select: {
          ultimoNumero: true,
        },
      });
  }
}
