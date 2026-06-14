-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "suframa" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "municipio" TEXT,
    "codigoMunicipio" TEXT,
    "uf" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "codigoPais" TEXT DEFAULT '1058',
    "pais" TEXT DEFAULT 'BRASIL',
    CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "municipio" TEXT,
    "codigoMunicipio" TEXT,
    "uf" TEXT,
    "codigoPais" TEXT DEFAULT '1058',
    "pais" TEXT DEFAULT 'BRASIL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoCompleta" TEXT,
    "unidade" TEXT NOT NULL,
    "ean" TEXT,
    "valorUnitario" DECIMAL NOT NULL,
    "custoUnitario" DECIMAL,
    "estoqueAtual" DECIMAL DEFAULT 0,
    "ncm" TEXT,
    "cest" TEXT,
    "cfopPadrao" TEXT,
    "origemMercadoria" INTEGER NOT NULL DEFAULT 0,
    "cstIcms" TEXT,
    "csosnIcms" TEXT,
    "modalidadeBcIcms" INTEGER DEFAULT 3,
    "reducaoBcIcms" DECIMAL DEFAULT 0,
    "aliquotaIcms" DECIMAL DEFAULT 0,
    "cstPis" TEXT,
    "aliquotaPis" DECIMAL DEFAULT 0,
    "cstCofins" TEXT,
    "aliquotaCofins" DECIMAL DEFAULT 0,
    "cstIpi" TEXT,
    "codigoEnquadramentoIpi" TEXT DEFAULT '999',
    "aliquotaIpi" DECIMAL DEFAULT 0,
    "cstIbsCbs" TEXT,
    "classificacaoTributariaIbsCbs" TEXT,
    "aliquotaIbsUf" DECIMAL DEFAULT 0,
    "aliquotaIbsMun" DECIMAL DEFAULT 0,
    "aliquotaCbs" DECIMAL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsuarioEmpresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UsuarioEmpresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsuarioEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificadoDigital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "arquivoPath" TEXT NOT NULL,
    "senhaCriptografada" TEXT NOT NULL,
    "serialNumber" TEXT,
    "thumbprint" TEXT,
    "emitidoPor" TEXT,
    "titular" TEXT,
    "cnpjTitular" TEXT,
    "validadeInicio" DATETIME NOT NULL,
    "validadeFim" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CertificadoDigital_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracaoFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "ambiente" TEXT NOT NULL DEFAULT 'HOMOLOGACAO',
    "regimeTributario" TEXT NOT NULL,
    "serieNfe" INTEGER NOT NULL DEFAULT 1,
    "serieNfce" INTEGER NOT NULL DEFAULT 1,
    "cscCriptografado" TEXT,
    "idCsc" TEXT,
    "tokenNuvemFiscalCriptografado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConfiguracaoFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventoFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaFiscalId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "justificativa" TEXT,
    "protocolo" TEXT,
    "xmlEvento" TEXT,
    "dataEvento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventoFiscal_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemNotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaFiscalId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "codigoProduto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "ean" TEXT,
    "ncm" TEXT,
    "cest" TEXT,
    "cfop" TEXT,
    "quantidade" DECIMAL NOT NULL,
    "valorUnitario" DECIMAL NOT NULL,
    "valorBruto" DECIMAL NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL NOT NULL,
    "origemMercadoria" INTEGER NOT NULL DEFAULT 0,
    "cstIcms" TEXT,
    "csosnIcms" TEXT,
    "modalidadeBcIcms" INTEGER,
    "reducaoBcIcms" DECIMAL NOT NULL DEFAULT 0,
    "baseCalculoIcms" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaIcms" DECIMAL NOT NULL DEFAULT 0,
    "valorIcms" DECIMAL NOT NULL DEFAULT 0,
    "cstPis" TEXT,
    "baseCalculoPis" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaPis" DECIMAL NOT NULL DEFAULT 0,
    "valorPis" DECIMAL NOT NULL DEFAULT 0,
    "cstCofins" TEXT,
    "baseCalculoCofins" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaCofins" DECIMAL NOT NULL DEFAULT 0,
    "valorCofins" DECIMAL NOT NULL DEFAULT 0,
    "cstIpi" TEXT,
    "codigoEnquadramentoIpi" TEXT,
    "baseCalculoIpi" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaIpi" DECIMAL NOT NULL DEFAULT 0,
    "valorIpi" DECIMAL NOT NULL DEFAULT 0,
    "cstIbsCbs" TEXT,
    "classificacaoTributariaIbsCbs" TEXT,
    "baseCalculoIbsCbs" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaIbsUf" DECIMAL NOT NULL DEFAULT 0,
    "valorIbsUf" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaIbsMun" DECIMAL NOT NULL DEFAULT 0,
    "valorIbsMun" DECIMAL NOT NULL DEFAULT 0,
    "valorIbs" DECIMAL NOT NULL DEFAULT 0,
    "aliquotaCbs" DECIMAL NOT NULL DEFAULT 0,
    "valorCbs" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemNotaFiscal_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemNotaFiscal_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NaturezaOperacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "cfop" TEXT NOT NULL,
    "finalidadeNfe" TEXT NOT NULL DEFAULT 'NORMAL',
    "consumidorFinal" BOOLEAN NOT NULL DEFAULT false,
    "contribuinteIcms" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NaturezaOperacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "naturezaOperacaoId" TEXT,
    "tipoDocumento" TEXT NOT NULL DEFAULT 'NFE',
    "numero" INTEGER NOT NULL,
    "serie" INTEGER NOT NULL DEFAULT 1,
    "dataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "valorProdutos" DECIMAL NOT NULL DEFAULT 0,
    "valorFrete" DECIMAL NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL NOT NULL DEFAULT 0,
    "valorOutros" DECIMAL NOT NULL DEFAULT 0,
    "valorBaseIcms" DECIMAL NOT NULL DEFAULT 0,
    "valorIcms" DECIMAL NOT NULL DEFAULT 0,
    "valorPis" DECIMAL NOT NULL DEFAULT 0,
    "valorCofins" DECIMAL NOT NULL DEFAULT 0,
    "valorIpi" DECIMAL NOT NULL DEFAULT 0,
    "valorBaseIbsCbs" DECIMAL NOT NULL DEFAULT 0,
    "valorIbsUf" DECIMAL NOT NULL DEFAULT 0,
    "valorIbsMun" DECIMAL NOT NULL DEFAULT 0,
    "valorIbs" DECIMAL NOT NULL DEFAULT 0,
    "valorCbs" DECIMAL NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL NOT NULL DEFAULT 0,
    "informacoesComplementares" TEXT,
    "numeroAleatorio" TEXT,
    "chaveAcesso" TEXT,
    "protocoloAutorizacao" TEXT,
    "xmlGerado" TEXT,
    "xmlAssinado" TEXT,
    "dataAutorizacao" DATETIME,
    "motivoRejeicao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotaFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaFiscal_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaFiscal_naturezaOperacaoId_fkey" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "NaturezaOperacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SequenciaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "serie" INTEGER NOT NULL DEFAULT 1,
    "ultimoNumero" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SequenciaFiscal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valorMensal" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assinatura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssinaturaModulo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assinaturaId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    CONSTRAINT "AssinaturaModulo_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssinaturaModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Motorista" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "transportadorId" TEXT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "numeroCnh" TEXT,
    "categoriaCnh" TEXT,
    "validadeCnh" DATETIME,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Motorista_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Motorista_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transportador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cpfCnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "rntrc" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "municipio" TEXT,
    "codigoMunicipio" TEXT,
    "uf" TEXT,
    "codigoPais" TEXT DEFAULT '1058',
    "pais" TEXT DEFAULT 'BRASIL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transportador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "transportadorId" TEXT,
    "placa" TEXT NOT NULL,
    "renavam" TEXT,
    "ufLicenciamento" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'OUTRO',
    "marcaModelo" TEXT,
    "anoFabricacao" INTEGER,
    "anoModelo" INTEGER,
    "taraKg" DECIMAL,
    "capacidadeKg" DECIMAL,
    "capacidadeM3" DECIMAL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Veiculo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Veiculo_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_cpfCnpj_key" ON "Cliente"("empresaId", "cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE INDEX "Produto_empresaId_idx" ON "Produto"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_empresaId_codigo_key" ON "Produto"("empresaId", "codigo");

-- CreateIndex
CREATE INDEX "UsuarioEmpresa_usuarioId_idx" ON "UsuarioEmpresa"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioEmpresa_empresaId_idx" ON "UsuarioEmpresa"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_usuarioId_empresaId_key" ON "UsuarioEmpresa"("usuarioId", "empresaId");

-- CreateIndex
CREATE INDEX "CertificadoDigital_empresaId_idx" ON "CertificadoDigital"("empresaId");

-- CreateIndex
CREATE INDEX "CertificadoDigital_empresaId_ativo_idx" ON "CertificadoDigital"("empresaId", "ativo");

-- CreateIndex
CREATE INDEX "CertificadoDigital_validadeFim_idx" ON "CertificadoDigital"("validadeFim");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoFiscal_empresaId_key" ON "ConfiguracaoFiscal"("empresaId");

-- CreateIndex
CREATE INDEX "ConfiguracaoFiscal_ambiente_idx" ON "ConfiguracaoFiscal"("ambiente");

-- CreateIndex
CREATE INDEX "EventoFiscal_notaFiscalId_idx" ON "EventoFiscal"("notaFiscalId");

-- CreateIndex
CREATE INDEX "EventoFiscal_notaFiscalId_tipo_idx" ON "EventoFiscal"("notaFiscalId", "tipo");

-- CreateIndex
CREATE INDEX "ItemNotaFiscal_notaFiscalId_idx" ON "ItemNotaFiscal"("notaFiscalId");

-- CreateIndex
CREATE INDEX "ItemNotaFiscal_produtoId_idx" ON "ItemNotaFiscal"("produtoId");

-- CreateIndex
CREATE INDEX "NotaFiscal_empresaId_idx" ON "NotaFiscal"("empresaId");

-- CreateIndex
CREATE INDEX "NotaFiscal_clienteId_idx" ON "NotaFiscal"("clienteId");

-- CreateIndex
CREATE INDEX "NotaFiscal_naturezaOperacaoId_idx" ON "NotaFiscal"("naturezaOperacaoId");

-- CreateIndex
CREATE INDEX "NotaFiscal_empresaId_status_idx" ON "NotaFiscal"("empresaId", "status");

-- CreateIndex
CREATE INDEX "NotaFiscal_empresaId_dataEmissao_idx" ON "NotaFiscal"("empresaId", "dataEmissao");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscal_empresaId_tipoDocumento_numero_serie_key" ON "NotaFiscal"("empresaId", "tipoDocumento", "numero", "serie");

-- CreateIndex
CREATE INDEX "SequenciaFiscal_empresaId_idx" ON "SequenciaFiscal"("empresaId");

-- CreateIndex
CREATE INDEX "SequenciaFiscal_empresaId_tipoDocumento_idx" ON "SequenciaFiscal"("empresaId", "tipoDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "SequenciaFiscal_empresaId_tipoDocumento_serie_key" ON "SequenciaFiscal"("empresaId", "tipoDocumento", "serie");

-- CreateIndex
CREATE UNIQUE INDEX "AssinaturaModulo_assinaturaId_moduloId_key" ON "AssinaturaModulo"("assinaturaId", "moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_codigo_key" ON "Modulo"("codigo");

-- CreateIndex
CREATE INDEX "Motorista_empresaId_idx" ON "Motorista"("empresaId");

-- CreateIndex
CREATE INDEX "Motorista_empresaId_nome_idx" ON "Motorista"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "Motorista_empresaId_ativo_idx" ON "Motorista"("empresaId", "ativo");

-- CreateIndex
CREATE INDEX "Motorista_transportadorId_idx" ON "Motorista"("transportadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_empresaId_cpf_key" ON "Motorista"("empresaId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_empresaId_numeroCnh_key" ON "Motorista"("empresaId", "numeroCnh");

-- CreateIndex
CREATE INDEX "Transportador_empresaId_idx" ON "Transportador"("empresaId");

-- CreateIndex
CREATE INDEX "Transportador_empresaId_nome_idx" ON "Transportador"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "Transportador_empresaId_ativo_idx" ON "Transportador"("empresaId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Transportador_empresaId_cpfCnpj_key" ON "Transportador"("empresaId", "cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Transportador_empresaId_rntrc_key" ON "Transportador"("empresaId", "rntrc");

-- CreateIndex
CREATE INDEX "Veiculo_empresaId_idx" ON "Veiculo"("empresaId");

-- CreateIndex
CREATE INDEX "Veiculo_empresaId_ativo_idx" ON "Veiculo"("empresaId", "ativo");

-- CreateIndex
CREATE INDEX "Veiculo_transportadorId_idx" ON "Veiculo"("transportadorId");

-- CreateIndex
CREATE INDEX "Veiculo_empresaId_tipo_idx" ON "Veiculo"("empresaId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_empresaId_placa_key" ON "Veiculo"("empresaId", "placa");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_empresaId_renavam_key" ON "Veiculo"("empresaId", "renavam");
