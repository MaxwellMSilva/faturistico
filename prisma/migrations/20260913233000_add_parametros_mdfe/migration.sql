-- Parâmetros iniciais do MDF-e (modelo 58).
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "modeloMdfe" INTEGER NOT NULL DEFAULT 58;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "ambienteMdfe" TEXT NOT NULL DEFAULT 'HOMOLOGACAO';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "tipoEmissaoMdfe" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "modalMdfe" TEXT NOT NULL DEFAULT 'RODOVIARIO';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "tipoEmitenteMdfe" TEXT NOT NULL DEFAULT 'PRESTADOR_SERVICO_TRANSPORTE';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "serieMdfe" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "ultimoNumeroMdfe" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "numeracaoManualMdfe" BOOLEAN NOT NULL DEFAULT false;

-- Mantém o mesmo ambiente fiscal já escolhido pelas empresas existentes.
UPDATE "ConfiguracaoFiscal"
SET "ambienteMdfe" = "ambiente";

CREATE INDEX "ConfiguracaoFiscal_ambienteMdfe_idx" ON "ConfiguracaoFiscal"("ambienteMdfe");
