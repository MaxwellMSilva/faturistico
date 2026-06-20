-- Novos dados operacionais da natureza de operação.
ALTER TABLE "NaturezaOperacao" ADD COLUMN "codigoInterno" TEXT;
ALTER TABLE "NaturezaOperacao" ADD COLUMN "tipoOperacao" TEXT NOT NULL DEFAULT 'SAIDA';
ALTER TABLE "NaturezaOperacao" ADD COLUMN "destinoOperacao" TEXT NOT NULL DEFAULT 'INTERNA';
ALTER TABLE "NaturezaOperacao" ADD COLUMN "indicadorPresenca" TEXT NOT NULL DEFAULT 'NAO_SE_APLICA';
ALTER TABLE "NaturezaOperacao" ADD COLUMN "indicadorIeDestinatario" TEXT NOT NULL DEFAULT 'CONTRIBUINTE';
ALTER TABLE "NaturezaOperacao" ADD COLUMN "possuiIntermediador" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NaturezaOperacao" ADD COLUMN "informacoesComplementaresPadrao" TEXT;

-- Converte o formato temporariamente aceito 5102-01 para:
-- CFOP fiscal 5102 e código interno 01.
UPDATE "NaturezaOperacao"
SET "codigoInterno" = CASE
  WHEN length(replace("cfop", '-', '')) = 6
    THEN substr(replace("cfop", '-', ''), 5, 2)
  ELSE "codigoInterno"
END;

UPDATE "NaturezaOperacao"
SET "cfop" = substr(replace("cfop", '-', ''), 1, 4);

-- O primeiro dígito do CFOP determina entrada/saída e o destino.
UPDATE "NaturezaOperacao"
SET "tipoOperacao" = CASE
  WHEN substr("cfop", 1, 1) IN ('1', '2', '3') THEN 'ENTRADA'
  ELSE 'SAIDA'
END;

UPDATE "NaturezaOperacao"
SET "destinoOperacao" = CASE
  WHEN substr("cfop", 1, 1) IN ('1', '5') THEN 'INTERNA'
  WHEN substr("cfop", 1, 1) IN ('2', '6') THEN 'INTERESTADUAL'
  WHEN substr("cfop", 1, 1) IN ('3', '7') THEN 'EXTERIOR'
  ELSE 'INTERNA'
END;

-- Preserva o comportamento anterior do campo contribuinteIcms.
UPDATE "NaturezaOperacao"
SET "indicadorIeDestinatario" = CASE
  WHEN "contribuinteIcms" = true THEN 'CONTRIBUINTE'
  ELSE 'NAO_CONTRIBUINTE'
END;

CREATE INDEX "NaturezaOperacao_empresaId_idx"
ON "NaturezaOperacao"("empresaId");

CREATE INDEX "NaturezaOperacao_empresaId_ativo_idx"
ON "NaturezaOperacao"("empresaId", "ativo");

CREATE INDEX "NaturezaOperacao_empresaId_cfop_idx"
ON "NaturezaOperacao"("empresaId", "cfop");
