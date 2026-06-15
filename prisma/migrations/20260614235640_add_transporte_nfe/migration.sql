-- CreateTable
CREATE TABLE "TransporteNotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaFiscalId" TEXT NOT NULL,
    "modalidadeFrete" TEXT NOT NULL DEFAULT 'SEM_TRANSPORTE',
    "transportadorId" TEXT,
    "veiculoId" TEXT,
    "motoristaId" TEXT,
    "transportadorNome" TEXT,
    "transportadorCpfCnpj" TEXT,
    "transportadorInscricaoEstadual" TEXT,
    "transportadorRntrc" TEXT,
    "transportadorLogradouro" TEXT,
    "transportadorNumero" TEXT,
    "transportadorBairro" TEXT,
    "transportadorMunicipio" TEXT,
    "transportadorUf" TEXT,
    "veiculoPlaca" TEXT,
    "veiculoRenavam" TEXT,
    "veiculoUf" TEXT,
    "veiculoMarcaModelo" TEXT,
    "veiculoTipo" TEXT,
    "motoristaNome" TEXT,
    "motoristaCpf" TEXT,
    "motoristaCnh" TEXT,
    "quantidadeVolumes" INTEGER,
    "especieVolumes" TEXT,
    "marcaVolumes" TEXT,
    "numeracaoVolumes" TEXT,
    "pesoLiquido" DECIMAL,
    "pesoBruto" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransporteNotaFiscal_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransporteNotaFiscal_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransporteNotaFiscal_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransporteNotaFiscal_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TransporteNotaFiscal_notaFiscalId_key" ON "TransporteNotaFiscal"("notaFiscalId");

-- CreateIndex
CREATE INDEX "TransporteNotaFiscal_transportadorId_idx" ON "TransporteNotaFiscal"("transportadorId");

-- CreateIndex
CREATE INDEX "TransporteNotaFiscal_veiculoId_idx" ON "TransporteNotaFiscal"("veiculoId");

-- CreateIndex
CREATE INDEX "TransporteNotaFiscal_motoristaId_idx" ON "TransporteNotaFiscal"("motoristaId");

-- CreateIndex
CREATE INDEX "TransporteNotaFiscal_modalidadeFrete_idx" ON "TransporteNotaFiscal"("modalidadeFrete");
