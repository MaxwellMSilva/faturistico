-- Parâmetros iniciais do CT-e de transporte de carga (modelo 57).
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "modeloCte" INTEGER NOT NULL DEFAULT 57;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "ambienteCte" TEXT NOT NULL DEFAULT 'HOMOLOGACAO';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "finalidadeCte" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "tipoEmissaoCte" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "modalCte" TEXT NOT NULL DEFAULT 'RODOVIARIO';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "tipoServicoCte" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "serieCte" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "ultimoNumeroCte" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "numeracaoManualCte" BOOLEAN NOT NULL DEFAULT false;

-- Mantém o mesmo ambiente fiscal já escolhido pelas empresas existentes.
UPDATE "ConfiguracaoFiscal"
SET "ambienteCte" = "ambiente";

CREATE INDEX "ConfiguracaoFiscal_ambienteCte_idx" ON "ConfiguracaoFiscal"("ambienteCte");
