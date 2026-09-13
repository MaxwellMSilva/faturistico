-- Completa a estrutura do CT-e 4.00, incluindo tributação,
-- retorno da SEFAZ, pagamentos vinculados e eventos.

ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorCargaAverbacao" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "informacoesFisco" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "chaveCteReferenciado" TEXT;

ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "grupoIcms" TEXT NOT NULL DEFAULT 'ICMSSN';
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "cstIcms" TEXT NOT NULL DEFAULT '90';
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "percentualReducaoBc" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "baseCalculoIcms" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "aliquotaIcms" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIcms" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorCreditoIcms" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "baseCalculoStRetido" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "aliquotaStRetido" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIcmsStRetido" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "codigoBeneficioFiscal" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorTotalTributos" DECIMAL;

ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "baseCalculoUfFim" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "percentualFcpUfFim" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "percentualIcmsUfFim" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "percentualIcmsInterestadual" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorFcpUfFim" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIcmsUfFim" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIcmsUfInicio" DECIMAL;

ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "cstIbsCbs" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "classificacaoTributariaIbsCbs" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "baseCalculoIbsCbs" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "aliquotaIbsUf" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIbsUf" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "aliquotaIbsMunicipio" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIbsMunicipio" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorIbs" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "aliquotaCbs" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorCbs" DECIMAL;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "valorTotalDfe" DECIMAL;

ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "qrCode" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "codigoStatusSefaz" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "motivoStatusSefaz" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "versaoAplicacaoSefaz" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "protocoloCancelamento" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "dataCancelamento" DATETIME;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "xmlRetornoSefaz" TEXT;
ALTER TABLE "ConhecimentoTransporte" ADD COLUMN "xmlEventoCancelamento" TEXT;

CREATE TABLE "PagamentoVinculadoCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "numeroPagamento" INTEGER NOT NULL,
    "idTransacao" TEXT NOT NULL,
    "tipoMeioPagamento" TEXT NOT NULL,
    "cnpjRecebedor" TEXT NOT NULL,
    "cnpjBasePsp" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PagamentoVinculadoCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PagamentoVinculadoCte_cteId_numeroPagamento_key"
ON "PagamentoVinculadoCte"("cteId", "numeroPagamento");
CREATE UNIQUE INDEX "PagamentoVinculadoCte_cteId_idTransacao_key"
ON "PagamentoVinculadoCte"("cteId", "idTransacao");
CREATE INDEX "PagamentoVinculadoCte_cteId_idx"
ON "PagamentoVinculadoCte"("cteId");

CREATE TABLE "EventoCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "codigoStatus" TEXT,
    "motivo" TEXT,
    "protocolo" TEXT,
    "xmlEnvio" TEXT,
    "xmlRetorno" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventoCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "EventoCte_cteId_tipo_sequencia_key"
ON "EventoCte"("cteId", "tipo", "sequencia");
CREATE INDEX "EventoCte_cteId_idx"
ON "EventoCte"("cteId");
CREATE INDEX "EventoCte_cteId_tipo_idx"
ON "EventoCte"("cteId", "tipo");
