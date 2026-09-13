-- Cache local das tabelas oficiais da Reforma Tributária do Consumo.
CREATE TABLE "TabelaRtcCache" (
    "chave" TEXT NOT NULL PRIMARY KEY,
    "fonte" TEXT NOT NULL,
    "versaoFonte" TEXT,
    "conteudoJson" TEXT NOT NULL,
    "atualizadoEm" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "TabelaRtcCache_atualizadoEm_idx" ON "TabelaRtcCache"("atualizadoEm");
