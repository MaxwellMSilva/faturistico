import type {
  ConfiguracaoFiscal,
  ConhecimentoTransporte,
  Empresa,
  ParticipanteCte,
  DocumentoNfeCte,
  QuantidadeCargaCte,
  ComponenteValorCte,
} from "@prisma/client";

import {
  somenteNumeros,
  validarChaveAcesso,
} from "@/lib/cte/util";

type CteCompleto =
  ConhecimentoTransporte & {
    participantes: ParticipanteCte[];
    documentosNfe: DocumentoNfeCte[];
    quantidadesCarga: QuantidadeCargaCte[];
    componentesValor: ComponenteValorCte[];
  };

type Params = {
  cte: CteCompleto;
  empresa: Empresa;
  configuracao: ConfiguracaoFiscal | null;
};

export type ErroValidacaoCte = {
  campo: string;
  mensagem: string;
};

function texto(
  valor: string | null | undefined
) {
  return Boolean(valor?.trim());
}

export function validarCte({
  cte,
  empresa,
  configuracao,
}: Params) {
  const erros: ErroValidacaoCte[] = [];

  function adicionar(
    campo: string,
    mensagem: string
  ) {
    erros.push({ campo, mensagem });
  }

  if (!configuracao) {
    adicionar(
      "configuracaoFiscal",
      "Configure o ambiente fiscal, a série do CT-e e o RNTRC."
    );
  }

  if (
    !texto(empresa.cnpj) ||
    somenteNumeros(empresa.cnpj).length !== 14
  ) {
    adicionar(
      "empresa.cnpj",
      "O CNPJ da empresa emitente deve possuir 14 dígitos."
    );
  }

  if (!texto(empresa.razaoSocial)) {
    adicionar(
      "empresa.razaoSocial",
      "Informe a razão social da empresa emitente."
    );
  }

  if (!texto(empresa.inscricaoEstadual)) {
    adicionar(
      "empresa.inscricaoEstadual",
      "Informe a inscrição estadual da empresa emitente."
    );
  }

  const enderecoEmitente = [
    [empresa.logradouro, "logradouro"],
    [empresa.numero, "número"],
    [empresa.bairro, "bairro"],
    [empresa.codigoMunicipio, "código IBGE"],
    [empresa.municipio, "município"],
    [empresa.uf, "UF"],
    [empresa.cep, "CEP"],
  ] as const;

  for (const [valor, nome] of enderecoEmitente) {
    if (!texto(valor)) {
      adicionar(
        `empresa.${nome}`,
        `Informe ${nome} no endereço da empresa emitente.`
      );
    }
  }

  if (
    cte.cfop.replace(/\D/g, "").length !== 4
  ) {
    adicionar(
      "cfop",
      "O CFOP deve possuir 4 dígitos."
    );
  }

  if (!texto(cte.naturezaOperacao)) {
    adicionar(
      "naturezaOperacao",
      "Informe a natureza da prestação."
    );
  }

  if (
    !texto(cte.codigoMunicipioEnvio) ||
    !texto(cte.municipioEnvio) ||
    !texto(cte.ufEnvio)
  ) {
    adicionar(
      "municipioEnvio",
      "Informe o município de envio do CT-e."
    );
  }

  if (
    !texto(cte.codigoMunicipioInicio) ||
    !texto(cte.municipioInicio) ||
    !texto(cte.ufInicio)
  ) {
    adicionar(
      "municipioInicio",
      "Informe o município de início da prestação."
    );
  }

  if (
    !texto(cte.codigoMunicipioFim) ||
    !texto(cte.municipioFim) ||
    !texto(cte.ufFim)
  ) {
    adicionar(
      "municipioFim",
      "Informe o município de término da prestação."
    );
  }

  if (Number(cte.valorPrestacao) <= 0) {
    adicionar(
      "valorPrestacao",
      "O valor total da prestação deve ser maior que zero."
    );
  }

  if (Number(cte.valorReceber) < 0) {
    adicionar(
      "valorReceber",
      "O valor a receber não pode ser negativo."
    );
  }

  if (Number(cte.valorCarga) <= 0) {
    adicionar(
      "valorCarga",
      "Informe o valor da carga."
    );
  }

  if (!texto(cte.produtoPredominante)) {
    adicionar(
      "produtoPredominante",
      "Informe o produto predominante da carga."
    );
  }

  const rntrc =
    cte.rntrc?.trim().toUpperCase() ||
    configuracao?.rntrc?.trim().toUpperCase() ||
    "";

  if (!rntrc) {
    adicionar(
      "rntrc",
      "Informe o RNTRC do emitente para o modal rodoviário."
    );
  } else if (
    rntrc !== "ISENTO" &&
    somenteNumeros(rntrc).length !== 8
  ) {
    adicionar(
      "rntrc",
      "O RNTRC deve possuir 8 dígitos ou ser informado como ISENTO."
    );
  }

  const porPapel = new Map(
    cte.participantes.map((item) => [
      item.papel,
      item,
    ])
  );

  for (const papel of [
    "REMETENTE",
    "DESTINATARIO",
  ] as const) {
    if (!porPapel.has(papel)) {
      adicionar(
        `participante.${papel}`,
        `Informe o ${papel === "REMETENTE" ? "remetente" : "destinatário"}.`
      );
    }
  }

  if (
    cte.tomadorServico === "EXPEDIDOR" &&
    !porPapel.has("EXPEDIDOR")
  ) {
    adicionar(
      "participante.EXPEDIDOR",
      "O expedidor foi definido como tomador, mas não foi informado."
    );
  }

  if (
    cte.tomadorServico === "RECEBEDOR" &&
    !porPapel.has("RECEBEDOR")
  ) {
    adicionar(
      "participante.RECEBEDOR",
      "O recebedor foi definido como tomador, mas não foi informado."
    );
  }

  if (
    cte.tomadorServico === "OUTROS" &&
    !porPapel.has("TOMADOR_OUTROS")
  ) {
    adicionar(
      "participante.TOMADOR_OUTROS",
      "Informe os dados do tomador do serviço."
    );
  }

  for (const participante of cte.participantes) {
    const documento =
      somenteNumeros(participante.cpfCnpj);

    if (
      documento.length !== 11 &&
      documento.length !== 14
    ) {
      adicionar(
        `participante.${participante.papel}.cpfCnpj`,
        `Documento inválido para ${participante.nome || participante.papel}.`
      );
    }

    const endereco = [
      participante.logradouro,
      participante.numero,
      participante.bairro,
      participante.codigoMunicipio,
      participante.municipio,
      participante.uf,
    ];

    if (
      !texto(participante.nome) ||
      endereco.some((valor) => !texto(valor))
    ) {
      adicionar(
        `participante.${participante.papel}.endereco`,
        `Complete o cadastro e endereço de ${participante.nome || participante.papel}.`
      );
    }
  }

  if (
    cte.tipoCte === "NORMAL" &&
    cte.documentosNfe.length === 0
  ) {
    adicionar(
      "documentosNfe",
      "Informe ao menos uma NF-e transportada."
    );
  }

  for (const documento of cte.documentosNfe) {
    if (!validarChaveAcesso(documento.chaveAcesso)) {
      adicionar(
        "documentosNfe",
        `A chave ${documento.chaveAcesso} é inválida.`
      );
    }
  }

  if (cte.quantidadesCarga.length === 0) {
    adicionar(
      "quantidadesCarga",
      "Informe ao menos uma quantidade da carga."
    );
  }

  for (const item of cte.quantidadesCarga) {
    if (
      !texto(item.tipoMedida) ||
      Number(item.quantidade) <= 0
    ) {
      adicionar(
        "quantidadesCarga",
        "Existe uma quantidade de carga inválida."
      );
    }
  }

  const totalComponentes =
    cte.componentesValor.reduce(
      (total, item) =>
        total + Number(item.valor),
      0
    );

  if (
    cte.componentesValor.length > 0 &&
    Math.abs(
      totalComponentes -
        Number(cte.valorPrestacao)
    ) > 0.01
  ) {
    adicionar(
      "componentesValor",
      "A soma dos componentes do frete deve coincidir com o valor total da prestação."
    );
  }

  if (
    cte.tipoCte !== "NORMAL" &&
    !texto(cte.chaveCteReferenciado)
  ) {
    adicionar(
      "chaveCteReferenciado",
      "Informe a chave do CT-e referenciado para o tipo selecionado."
    );
  }

  if (
    texto(cte.chaveCteReferenciado) &&
    !validarChaveAcesso(
      cte.chaveCteReferenciado ?? ""
    )
  ) {
    adicionar(
      "chaveCteReferenciado",
      "A chave do CT-e referenciado é inválida."
    );
  }

  if (
    configuracao?.regimeTributario ===
      "REGIME_NORMAL"
  ) {
    if (!texto(cte.cstIbsCbs)) {
      adicionar(
        "cstIbsCbs",
        "Informe o CST do IBS/CBS."
      );
    }

    if (
      !texto(
        cte.classificacaoTributariaIbsCbs
      )
    ) {
      adicionar(
        "classificacaoTributariaIbsCbs",
        "Informe a classificação tributária do IBS/CBS."
      );
    }
  }

  return erros;
}
