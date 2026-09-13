-- CreateTable
CREATE TABLE "PagamentoNotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaFiscalId" TEXT NOT NULL,
    "indicador" TEXT NOT NULL DEFAULT 'A_VISTA',
    "meioPagamento" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL DEFAULT 0,
    "descricaoMeioPagamento" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PagamentoNotaFiscal_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PagamentoNotaFiscal_notaFiscalId_idx" ON "PagamentoNotaFiscal"("notaFiscalId");
