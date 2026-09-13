-- Base para emissão de CT-e modelo 57, modal rodoviário.
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "serieCte" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ConfiguracaoFiscal" ADD COLUMN "rntrc" TEXT;

CREATE TABLE "ConhecimentoTransporte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "serie" INTEGER NOT NULL DEFAULT 1,
    "modelo" TEXT NOT NULL DEFAULT '57',
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "tipoCte" TEXT NOT NULL DEFAULT 'NORMAL',
    "tipoServico" TEXT NOT NULL DEFAULT 'NORMAL',
    "modal" TEXT NOT NULL DEFAULT 'RODOVIARIO',
    "dataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cfop" TEXT NOT NULL,
    "naturezaOperacao" TEXT NOT NULL,
    "codigoMunicipioEnvio" TEXT NOT NULL,
    "municipioEnvio" TEXT NOT NULL,
    "ufEnvio" TEXT NOT NULL,
    "codigoMunicipioInicio" TEXT NOT NULL,
    "municipioInicio" TEXT NOT NULL,
    "ufInicio" TEXT NOT NULL,
    "codigoMunicipioFim" TEXT NOT NULL,
    "municipioFim" TEXT NOT NULL,
    "ufFim" TEXT NOT NULL,
    "tomadorServico" TEXT NOT NULL,
    "valorPrestacao" DECIMAL NOT NULL DEFAULT 0,
    "valorReceber" DECIMAL NOT NULL DEFAULT 0,
    "valorCarga" DECIMAL NOT NULL DEFAULT 0,
    "produtoPredominante" TEXT NOT NULL,
    "outrasCaracteristicasCarga" TEXT,
    "rntrc" TEXT,
    "informacoesAdicionais" TEXT,
    "numeroAleatorio" TEXT,
    "chaveAcesso" TEXT,
    "protocoloAutorizacao" TEXT,
    "dataAutorizacao" DATETIME,
    "motivoRejeicao" TEXT,
    "xmlGerado" TEXT,
    "xmlAssinado" TEXT,
    "xmlAutorizado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConhecimentoTransporte_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ParticipanteCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "nome" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "codigoMunicipio" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "cep" TEXT,
    "uf" TEXT NOT NULL,
    "codigoPais" TEXT NOT NULL DEFAULT '1058',
    "pais" TEXT NOT NULL DEFAULT 'BRASIL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParticipanteCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "DocumentoNfeCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "chaveAcesso" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentoNfeCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuantidadeCargaCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "tipoMedida" TEXT NOT NULL,
    "quantidade" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuantidadeCargaCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ComponenteValorCte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComponenteValorCte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ConhecimentoTransporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ConhecimentoTransporte_empresaId_numero_serie_key"
ON "ConhecimentoTransporte"("empresaId", "numero", "serie");
CREATE INDEX "ConhecimentoTransporte_empresaId_idx"
ON "ConhecimentoTransporte"("empresaId");
CREATE INDEX "ConhecimentoTransporte_empresaId_status_idx"
ON "ConhecimentoTransporte"("empresaId", "status");
CREATE INDEX "ConhecimentoTransporte_empresaId_dataEmissao_idx"
ON "ConhecimentoTransporte"("empresaId", "dataEmissao");
CREATE INDEX "ConhecimentoTransporte_chaveAcesso_idx"
ON "ConhecimentoTransporte"("chaveAcesso");

CREATE UNIQUE INDEX "ParticipanteCte_cteId_papel_key"
ON "ParticipanteCte"("cteId", "papel");
CREATE INDEX "ParticipanteCte_cteId_idx"
ON "ParticipanteCte"("cteId");
CREATE INDEX "ParticipanteCte_cpfCnpj_idx"
ON "ParticipanteCte"("cpfCnpj");

CREATE UNIQUE INDEX "DocumentoNfeCte_cteId_chaveAcesso_key"
ON "DocumentoNfeCte"("cteId", "chaveAcesso");
CREATE INDEX "DocumentoNfeCte_cteId_idx"
ON "DocumentoNfeCte"("cteId");
CREATE INDEX "DocumentoNfeCte_chaveAcesso_idx"
ON "DocumentoNfeCte"("chaveAcesso");

CREATE INDEX "QuantidadeCargaCte_cteId_idx"
ON "QuantidadeCargaCte"("cteId");
CREATE INDEX "ComponenteValorCte_cteId_idx"
ON "ComponenteValorCte"("cteId");
