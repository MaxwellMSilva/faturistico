"use server";

import { randomInt } from "node:crypto";

import {
  PapelParticipanteCte,
  PrivilegioEmpresa,
  TipoDocumentoFiscal,
  TipoPessoa,
  TipoServicoCte,
  TomadorServicoCte,
  UnidadeMedidaCte,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { obterProximoNumero } from "@/lib/fiscal/obter-proximo-numero";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type ParticipanteInput = {
  papel: PapelParticipanteCte;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  inscricaoEstadual?: string;
  nome: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  municipio: string;
  cep?: string;
  uf: string;
  codigoPais?: string;
  pais?: string;
};

type QuantidadeInput = {
  unidade: UnidadeMedidaCte;
  tipoMedida: string;
  quantidade: number;
};

type ComponenteValorInput = {
  nome: string;
  valor: number;
};

type CriarRascunhoCteInput = {
  empresaId: string;
  cfop: string;
  naturezaOperacao: string;
  tipoServico?: TipoServicoCte;
  tomadorServico: TomadorServicoCte;

  codigoMunicipioEnvio: string;
  municipioEnvio: string;
  ufEnvio: string;

  codigoMunicipioInicio: string;
  municipioInicio: string;
  ufInicio: string;

  codigoMunicipioFim: string;
  municipioFim: string;
  ufFim: string;

  valorPrestacao: number;
  valorReceber: number;
  valorCarga: number;
  produtoPredominante: string;
  outrasCaracteristicasCarga?: string;
  rntrc?: string;
  informacoesAdicionais?: string;

  participantes: ParticipanteInput[];
  chavesNfe: string[];
  quantidadesCarga: QuantidadeInput[];
  componentesValor?: ComponenteValorInput[];
};

type Resultado =
  | { success: true; cteId: string; numero: number; serie: number }
  | { success: false; message: string };

function somenteNumeros(valor: string | undefined) {
  return valor?.replace(/\D/g, "") ?? "";
}

function textoObrigatorio(valor: string | undefined) {
  return Boolean(valor?.trim());
}

export async function criarRascunhoCte(
  data: CriarRascunhoCteInput
): Promise<Resultado> {
  try {
    await validarPrivilegioEmpresa(
      data.empresaId,
      PrivilegioEmpresa.CTE_CRIAR
    );
  } catch {
    return {
      success: false,
      message: "Você não possui permissão para criar CT-e.",
    };
  }

  const cfop = somenteNumeros(data.cfop);

  if (cfop.length !== 4) {
    return { success: false, message: "Informe um CFOP válido com 4 dígitos." };
  }

  if (!textoObrigatorio(data.naturezaOperacao)) {
    return { success: false, message: "Informe a natureza da prestação." };
  }

  const camposMunicipio = [
    data.codigoMunicipioEnvio,
    data.municipioEnvio,
    data.ufEnvio,
    data.codigoMunicipioInicio,
    data.municipioInicio,
    data.ufInicio,
    data.codigoMunicipioFim,
    data.municipioFim,
    data.ufFim,
  ];

  if (camposMunicipio.some((valor) => !textoObrigatorio(valor))) {
    return { success: false, message: "Informe os municípios e UFs de envio, início e fim da prestação." };
  }

  if (
    data.valorPrestacao < 0 ||
    data.valorReceber < 0 ||
    data.valorCarga < 0
  ) {
    return { success: false, message: "Os valores do CT-e não podem ser negativos." };
  }

  if (!textoObrigatorio(data.produtoPredominante)) {
    return { success: false, message: "Informe o produto predominante da carga." };
  }

  const participantes = data.participantes ?? [];
  const papeis = new Set(participantes.map((participante) => participante.papel));

  if (!papeis.has(PapelParticipanteCte.REMETENTE)) {
    return { success: false, message: "Informe o remetente do CT-e." };
  }

  if (!papeis.has(PapelParticipanteCte.DESTINATARIO)) {
    return { success: false, message: "Informe o destinatário do CT-e." };
  }

  if (
    data.tomadorServico === TomadorServicoCte.OUTROS &&
    !papeis.has(PapelParticipanteCte.TOMADOR_OUTROS)
  ) {
    return { success: false, message: "Informe os dados do tomador do serviço." };
  }

  if (papeis.size !== participantes.length) {
    return { success: false, message: "Existe participante duplicado no CT-e." };
  }

  for (const participante of participantes) {
    const documento = somenteNumeros(participante.cpfCnpj);

    if (documento.length !== 11 && documento.length !== 14) {
      return { success: false, message: `Documento inválido para ${participante.nome || "participante"}.` };
    }

    if (
      !textoObrigatorio(participante.nome) ||
      !textoObrigatorio(participante.logradouro) ||
      !textoObrigatorio(participante.numero) ||
      !textoObrigatorio(participante.bairro) ||
      !textoObrigatorio(participante.codigoMunicipio) ||
      !textoObrigatorio(participante.municipio) ||
      !textoObrigatorio(participante.uf)
    ) {
      return { success: false, message: `Complete o endereço de ${participante.nome || "um participante"}.` };
    }
  }

  const chavesNfe = Array.from(
    new Set((data.chavesNfe ?? []).map(somenteNumeros).filter(Boolean))
  );

  if (chavesNfe.length === 0) {
    return { success: false, message: "Informe ao menos uma NF-e transportada." };
  }

  if (chavesNfe.some((chave) => chave.length !== 44)) {
    return { success: false, message: "Toda chave de NF-e deve possuir 44 dígitos." };
  }

  if (
    !Array.isArray(data.quantidadesCarga) ||
    data.quantidadesCarga.length === 0 ||
    data.quantidadesCarga.some(
      (item) => !textoObrigatorio(item.tipoMedida) || item.quantidade <= 0
    )
  ) {
    return { success: false, message: "Informe ao menos uma quantidade válida da carga." };
  }

  const configuracao = await prisma.configuracaoFiscal.findUnique({
    where: { empresaId: data.empresaId },
    select: { serieCte: true, rntrc: true },
  });

  if (!configuracao) {
    return { success: false, message: "Configure os dados fiscais da empresa antes de criar o CT-e." };
  }

  const serie = configuracao.serieCte;
  const rntrc = somenteNumeros(data.rntrc) || somenteNumeros(configuracao.rntrc) || null;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const numero = await obterProximoNumero({
        tx,
        empresaId: data.empresaId,
        tipoDocumento: TipoDocumentoFiscal.CTE,
        serie,
      });

      const cte = await tx.conhecimentoTransporte.create({
        data: {
          empresaId: data.empresaId,
          numero,
          serie,
          cfop,
          naturezaOperacao: data.naturezaOperacao.trim(),
          tipoServico: data.tipoServico ?? TipoServicoCte.NORMAL,
          tomadorServico: data.tomadorServico,
          codigoMunicipioEnvio: somenteNumeros(data.codigoMunicipioEnvio),
          municipioEnvio: data.municipioEnvio.trim(),
          ufEnvio: data.ufEnvio.trim().toUpperCase(),
          codigoMunicipioInicio: somenteNumeros(data.codigoMunicipioInicio),
          municipioInicio: data.municipioInicio.trim(),
          ufInicio: data.ufInicio.trim().toUpperCase(),
          codigoMunicipioFim: somenteNumeros(data.codigoMunicipioFim),
          municipioFim: data.municipioFim.trim(),
          ufFim: data.ufFim.trim().toUpperCase(),
          valorPrestacao: data.valorPrestacao,
          valorReceber: data.valorReceber,
          valorCarga: data.valorCarga,
          produtoPredominante: data.produtoPredominante.trim(),
          outrasCaracteristicasCarga: data.outrasCaracteristicasCarga?.trim() || null,
          rntrc,
          informacoesAdicionais: data.informacoesAdicionais?.trim() || null,
          numeroAleatorio: String(randomInt(0, 100_000_000)).padStart(8, "0"),
          participantes: {
            create: participantes.map((participante) => ({
              papel: participante.papel,
              tipoPessoa: participante.tipoPessoa,
              cpfCnpj: somenteNumeros(participante.cpfCnpj),
              inscricaoEstadual: participante.inscricaoEstadual?.trim() || null,
              nome: participante.nome.trim(),
              nomeFantasia: participante.nomeFantasia?.trim() || null,
              telefone: somenteNumeros(participante.telefone) || null,
              email: participante.email?.trim().toLowerCase() || null,
              logradouro: participante.logradouro.trim(),
              numero: participante.numero.trim(),
              complemento: participante.complemento?.trim() || null,
              bairro: participante.bairro.trim(),
              codigoMunicipio: somenteNumeros(participante.codigoMunicipio),
              municipio: participante.municipio.trim(),
              cep: somenteNumeros(participante.cep) || null,
              uf: participante.uf.trim().toUpperCase(),
              codigoPais: somenteNumeros(participante.codigoPais) || "1058",
              pais: participante.pais?.trim().toUpperCase() || "BRASIL",
            })),
          },
          documentosNfe: {
            create: chavesNfe.map((chaveAcesso) => ({ chaveAcesso })),
          },
          quantidadesCarga: {
            create: data.quantidadesCarga.map((item) => ({
              unidade: item.unidade,
              tipoMedida: item.tipoMedida.trim().toUpperCase(),
              quantidade: item.quantidade,
            })),
          },
          componentesValor: {
            create: (data.componentesValor ?? [])
              .filter((item) => textoObrigatorio(item.nome) && item.valor >= 0)
              .map((item) => ({ nome: item.nome.trim(), valor: item.valor })),
          },
        },
        select: { id: true, numero: true, serie: true },
      });

      return cte;
    });

    return {
      success: true,
      cteId: resultado.id,
      numero: resultado.numero,
      serie: resultado.serie,
    };
  } catch (error) {
    console.error("Erro ao criar rascunho de CT-e:", error);

    return {
      success: false,
      message: "Não foi possível criar o rascunho do CT-e.",
    };
  }
}
