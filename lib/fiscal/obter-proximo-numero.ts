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
};

export async function obterProximoNumero({
  tx,
  empresaId,
  tipoDocumento,
  serie,
}: Params) {
  const sequencia =
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

  return sequencia.ultimoNumero;
}