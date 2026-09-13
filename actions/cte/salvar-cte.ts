"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";

import {
  PapelParticipanteCte,
  PrivilegioEmpresa,
  TipoDocumentoFiscal,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { obterProximoNumero } from "@/lib/fiscal/obter-proximo-numero";
import type { SalvarCteData } from "@/lib/cte/form-types";
import { somenteNumeros } from "@/lib/cte/util";

function textoOpcional(
  valor?: string | null
) {
  const texto = valor?.trim();
  return texto || null;
}

function decimalOpcional(
  valor?: number | null
) {
  if (
    valor === null ||
    valor === undefined ||
    !Number.isFinite(valor)
  ) {
    return null;
  }

  return valor;
}

function normalizarRntrc(
  valor?: string
) {
  const texto =
    valor?.trim().toUpperCase() ?? "";

  if (!texto) return null;
  if (texto === "ISENTO") return texto;
  return somenteNumeros(texto);
}

export async function salvarCte(
  data: SalvarCteData
) {
  const editando = Boolean(data.cteId);

  await validarPrivilegioEmpresa(
    data.empresaId,
    editando
      ? PrivilegioEmpresa.CTE_EDITAR
      : PrivilegioEmpresa.CTE_CRIAR
  );

  if (
    somenteNumeros(data.cfop).length !== 4
  ) {
    return {
      success: false as const,
      message:
        "Informe um CFOP com 4 dígitos.",
    };
  }

  if (!data.naturezaOperacao.trim()) {
    return {
      success: false as const,
      message:
        "Informe a natureza da prestação.",
    };
  }

  if (
    !Number.isFinite(data.valorPrestacao) ||
    data.valorPrestacao <= 0
  ) {
    return {
      success: false as const,
      message:
        "Informe o valor total da prestação.",
    };
  }

  if (
    !Number.isFinite(data.valorCarga) ||
    data.valorCarga <= 0
  ) {
    return {
      success: false as const,
      message:
        "Informe o valor da carga.",
    };
  }

  const chavesNfe = Array.from(
    new Set(
      data.chavesNfe
        .map(somenteNumeros)
        .filter(Boolean)
    )
  );

  if (
    chavesNfe.length === 0 ||
    chavesNfe.some(
      (chave) => chave.length !== 44
    )
  ) {
    return {
      success: false as const,
      message:
        "Informe ao menos uma chave de NF-e com 44 dígitos.",
    };
  }

  if (
    data.quantidadesCarga.length === 0 ||
    data.quantidadesCarga.some(
      (item) =>
        !item.tipoMedida.trim() ||
        !Number.isFinite(item.quantidade) ||
        item.quantidade <= 0
    )
  ) {
    return {
      success: false as const,
      message:
        "Informe ao menos uma quantidade válida da carga.",
    };
  }

  const idsClientes = Array.from(
    new Set(
      [
        data.remetenteClienteId,
        data.destinatarioClienteId,
        data.expedidorClienteId,
        data.recebedorClienteId,
        data.tomadorOutrosClienteId,
      ].filter(
        (valor): valor is string =>
          Boolean(valor)
      )
    )
  );

  const clientes =
    await prisma.cliente.findMany({
      where: {
        empresaId: data.empresaId,
        id: { in: idsClientes },
        ativo: true,
      },
    });

  const mapaClientes = new Map(
    clientes.map((cliente) => [
      cliente.id,
      cliente,
    ])
  );

  const participantesSolicitados: Array<[
    PapelParticipanteCte,
    string | undefined,
  ]> = [
    [
      PapelParticipanteCte.REMETENTE,
      data.remetenteClienteId,
    ],
    [
      PapelParticipanteCte.DESTINATARIO,
      data.destinatarioClienteId,
    ],
    [
      PapelParticipanteCte.EXPEDIDOR,
      data.expedidorClienteId,
    ],
    [
      PapelParticipanteCte.RECEBEDOR,
      data.recebedorClienteId,
    ],
    [
      PapelParticipanteCte.TOMADOR_OUTROS,
      data.tomadorOutrosClienteId,
    ],
  ];

  const participantes = [];

  for (const [papel, clienteId] of
    participantesSolicitados) {
    if (!clienteId) continue;

    const cliente =
      mapaClientes.get(clienteId);

    if (!cliente) {
      return {
        success: false as const,
        message:
          "Um dos participantes selecionados não foi encontrado ou está inativo.",
      };
    }

    if (
      !cliente.logradouro ||
      !cliente.numero ||
      !cliente.bairro ||
      !cliente.codigoMunicipio ||
      !cliente.municipio ||
      !cliente.uf
    ) {
      return {
        success: false as const,
        message:
          `Complete o endereço do cliente ${cliente.nome} antes de utilizá-lo no CT-e.`,
      };
    }

    participantes.push({
      papel,
      tipoPessoa: cliente.tipoPessoa,
      cpfCnpj: somenteNumeros(
        cliente.cpfCnpj
      ),
      inscricaoEstadual:
        textoOpcional(
          cliente.inscricaoEstadual
        ),
      nome: cliente.nome.trim(),
      nomeFantasia: null,
      telefone:
        textoOpcional(cliente.telefone),
      email: textoOpcional(cliente.email),
      logradouro: cliente.logradouro.trim(),
      numero: cliente.numero.trim(),
      complemento:
        textoOpcional(cliente.complemento),
      bairro: cliente.bairro.trim(),
      codigoMunicipio:
        somenteNumeros(
          cliente.codigoMunicipio
        ),
      municipio: cliente.municipio.trim(),
      cep: textoOpcional(
        somenteNumeros(cliente.cep)
      ),
      uf: cliente.uf.trim().toUpperCase(),
      codigoPais:
        somenteNumeros(
          cliente.codigoPais
        ) || "1058",
      pais:
        cliente.pais?.trim() || "BRASIL",
    });
  }

  const papeis = new Set(
    participantes.map((item) => item.papel)
  );

  if (
    !papeis.has(
      PapelParticipanteCte.REMETENTE
    ) ||
    !papeis.has(
      PapelParticipanteCte.DESTINATARIO
    )
  ) {
    return {
      success: false as const,
      message:
        "Remetente e destinatário são obrigatórios.",
    };
  }

  if (
    data.tomadorServico === "EXPEDIDOR" &&
    !papeis.has(
      PapelParticipanteCte.EXPEDIDOR
    )
  ) {
    return {
      success: false as const,
      message:
        "Selecione o expedidor definido como tomador.",
    };
  }

  if (
    data.tomadorServico === "RECEBEDOR" &&
    !papeis.has(
      PapelParticipanteCte.RECEBEDOR
    )
  ) {
    return {
      success: false as const,
      message:
        "Selecione o recebedor definido como tomador.",
    };
  }

  if (
    data.tomadorServico === "OUTROS" &&
    !papeis.has(
      PapelParticipanteCte.TOMADOR_OUTROS
    )
  ) {
    return {
      success: false as const,
      message:
        "Selecione o cliente que será o outro tomador.",
    };
  }

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId: data.empresaId,
      },
    });

  if (!configuracao) {
    return {
      success: false as const,
      message:
        "Configure os dados fiscais da empresa antes de criar um CT-e.",
    };
  }

  const rntrc =
    normalizarRntrc(data.rntrc) ||
    configuracao.rntrc;

  if (!rntrc) {
    return {
      success: false as const,
      message:
        "Configure o RNTRC da empresa.",
    };
  }

  try {
    const cteId =
      await prisma.$transaction(
        async (tx) => {
          let numero: number;
          let serie: number;
          let numeroAleatorio: string;

          if (data.cteId) {
            const existente =
              await tx.conhecimentoTransporte.findFirst({
                where: {
                  id: data.cteId,
                  empresaId: data.empresaId,
                },
              });

            if (!existente) {
              throw new Error(
                "CTE_NAO_ENCONTRADO"
              );
            }

            if (
              ![
                "RASCUNHO",
                "VALIDADO",
                "REJEITADO",
              ].includes(existente.status)
            ) {
              throw new Error(
                "CTE_NAO_EDITAVEL"
              );
            }

            numero = existente.numero;
            serie = existente.serie;
            numeroAleatorio =
              existente.numeroAleatorio ??
              String(
                randomInt(0, 100_000_000)
              ).padStart(8, "0");
          } else {
            serie = configuracao.serieCte;
            numero =
              await obterProximoNumero({
                tx,
                empresaId: data.empresaId,
                tipoDocumento:
                  TipoDocumentoFiscal.CTE,
                serie,
              });
            numeroAleatorio = String(
              randomInt(0, 100_000_000)
            ).padStart(8, "0");
          }

          const dadosCte = {
            empresaId: data.empresaId,
            numero,
            serie,
            status: "RASCUNHO" as const,
            tipoCte: "NORMAL" as const,
            tipoServico: data.tipoServico,
            modal: "RODOVIARIO" as const,
            cfop: somenteNumeros(data.cfop),
            naturezaOperacao:
              data.naturezaOperacao.trim(),
            codigoMunicipioEnvio:
              somenteNumeros(
                data.codigoMunicipioEnvio
              ),
            municipioEnvio:
              data.municipioEnvio.trim(),
            ufEnvio:
              data.ufEnvio.trim().toUpperCase(),
            codigoMunicipioInicio:
              somenteNumeros(
                data.codigoMunicipioInicio
              ),
            municipioInicio:
              data.municipioInicio.trim(),
            ufInicio:
              data.ufInicio.trim().toUpperCase(),
            codigoMunicipioFim:
              somenteNumeros(
                data.codigoMunicipioFim
              ),
            municipioFim:
              data.municipioFim.trim(),
            ufFim:
              data.ufFim.trim().toUpperCase(),
            tomadorServico:
              data.tomadorServico,
            valorPrestacao:
              data.valorPrestacao,
            valorReceber:
              data.valorReceber,
            valorCarga: data.valorCarga,
            valorCargaAverbacao:
              decimalOpcional(
                data.valorCargaAverbacao
              ),
            produtoPredominante:
              data.produtoPredominante.trim(),
            outrasCaracteristicasCarga:
              textoOpcional(
                data.outrasCaracteristicasCarga
              ),
            rntrc,
            informacoesAdicionais:
              textoOpcional(
                data.informacoesAdicionais
              ),
            informacoesFisco:
              textoOpcional(
                data.informacoesFisco
              ),
            grupoIcms: data.grupoIcms,
            cstIcms:
              somenteNumeros(data.cstIcms),
            percentualReducaoBc:
              decimalOpcional(
                data.percentualReducaoBc
              ),
            baseCalculoIcms:
              decimalOpcional(
                data.baseCalculoIcms
              ),
            aliquotaIcms:
              decimalOpcional(
                data.aliquotaIcms
              ),
            valorIcms:
              decimalOpcional(
                data.valorIcms
              ),
            valorCreditoIcms:
              decimalOpcional(
                data.valorCreditoIcms
              ),
            baseCalculoStRetido:
              decimalOpcional(
                data.baseCalculoStRetido
              ),
            aliquotaStRetido:
              decimalOpcional(
                data.aliquotaStRetido
              ),
            valorIcmsStRetido:
              decimalOpcional(
                data.valorIcmsStRetido
              ),
            codigoBeneficioFiscal:
              textoOpcional(
                data.codigoBeneficioFiscal
              ),
            valorTotalTributos:
              decimalOpcional(
                data.valorTotalTributos
              ),
            baseCalculoUfFim:
              decimalOpcional(
                data.baseCalculoUfFim
              ),
            percentualFcpUfFim:
              decimalOpcional(
                data.percentualFcpUfFim
              ),
            percentualIcmsUfFim:
              decimalOpcional(
                data.percentualIcmsUfFim
              ),
            percentualIcmsInterestadual:
              decimalOpcional(
                data.percentualIcmsInterestadual
              ),
            valorFcpUfFim:
              decimalOpcional(
                data.valorFcpUfFim
              ),
            valorIcmsUfFim:
              decimalOpcional(
                data.valorIcmsUfFim
              ),
            valorIcmsUfInicio:
              decimalOpcional(
                data.valorIcmsUfInicio
              ),
            cstIbsCbs:
              textoOpcional(data.cstIbsCbs),
            classificacaoTributariaIbsCbs:
              textoOpcional(
                data.classificacaoTributariaIbsCbs
              ),
            baseCalculoIbsCbs:
              decimalOpcional(
                data.baseCalculoIbsCbs
              ),
            aliquotaIbsUf:
              decimalOpcional(
                data.aliquotaIbsUf
              ),
            valorIbsUf:
              decimalOpcional(data.valorIbsUf),
            aliquotaIbsMunicipio:
              decimalOpcional(
                data.aliquotaIbsMunicipio
              ),
            valorIbsMunicipio:
              decimalOpcional(
                data.valorIbsMunicipio
              ),
            valorIbs:
              decimalOpcional(data.valorIbs),
            aliquotaCbs:
              decimalOpcional(data.aliquotaCbs),
            valorCbs:
              decimalOpcional(data.valorCbs),
            valorTotalDfe:
              decimalOpcional(
                data.valorTotalDfe
              ),
            numeroAleatorio,
            chaveAcesso: null,
            qrCode: null,
            protocoloAutorizacao: null,
            dataAutorizacao: null,
            codigoStatusSefaz: null,
            motivoStatusSefaz: null,
            versaoAplicacaoSefaz: null,
            motivoRejeicao: null,
            xmlGerado: null,
            xmlAssinado: null,
            xmlAutorizado: null,
            xmlRetornoSefaz: null,
          };

          let id: string;

          if (data.cteId) {
            await Promise.all([
              tx.participanteCte.deleteMany({
                where: { cteId: data.cteId },
              }),
              tx.documentoNfeCte.deleteMany({
                where: { cteId: data.cteId },
              }),
              tx.quantidadeCargaCte.deleteMany({
                where: { cteId: data.cteId },
              }),
              tx.componenteValorCte.deleteMany({
                where: { cteId: data.cteId },
              }),
              tx.pagamentoVinculadoCte.deleteMany({
                where: { cteId: data.cteId },
              }),
            ]);

            const atualizado =
              await tx.conhecimentoTransporte.update({
                where: { id: data.cteId },
                data: dadosCte,
                select: { id: true },
              });

            id = atualizado.id;
          } else {
            const criado =
              await tx.conhecimentoTransporte.create({
                data: dadosCte,
                select: { id: true },
              });

            id = criado.id;
          }

          await Promise.all([
            tx.participanteCte.createMany({
              data: participantes.map(
                (item) => ({
                  cteId: id,
                  ...item,
                })
              ),
            }),
            tx.documentoNfeCte.createMany({
              data: chavesNfe.map(
                (chaveAcesso) => ({
                  cteId: id,
                  chaveAcesso,
                })
              ),
            }),
            tx.quantidadeCargaCte.createMany({
              data:
                data.quantidadesCarga.map(
                  (item) => ({
                    cteId: id,
                    unidade: item.unidade,
                    tipoMedida:
                      item.tipoMedida.trim(),
                    quantidade:
                      item.quantidade,
                  })
                ),
            }),
            data.componentesValor.length
              ? tx.componenteValorCte.createMany({
                  data:
                    data.componentesValor.map(
                      (item) => ({
                        cteId: id,
                        nome: item.nome.trim(),
                        valor: item.valor,
                      })
                    ),
                })
              : Promise.resolve(),
            data.pagamentosVinculados?.length
              ? tx.pagamentoVinculadoCte.createMany({
                  data:
                    data.pagamentosVinculados.map(
                      (item) => ({
                        cteId: id,
                        numeroPagamento:
                          item.numeroPagamento,
                        idTransacao:
                          item.idTransacao.trim(),
                        tipoMeioPagamento:
                          item.tipoMeioPagamento.trim(),
                        cnpjRecebedor:
                          somenteNumeros(
                            item.cnpjRecebedor
                          ),
                        cnpjBasePsp:
                          somenteNumeros(
                            item.cnpjBasePsp
                          ),
                      })
                    ),
                })
              : Promise.resolve(),
          ]);

          return id;
        }
      );

    revalidatePath(
      `/empresa/${data.empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${data.empresaId}/cte/${cteId}`
    );

    return {
      success: true as const,
      cteId,
    };
  } catch (error) {
    console.error(
      "Erro ao salvar CT-e:",
      error
    );

    const mensagem =
      error instanceof Error &&
      error.message === "CTE_NAO_EDITAVEL"
        ? "Este CT-e já não pode ser editado."
        : "Não foi possível salvar o CT-e.";

    return {
      success: false as const,
      message: mensagem,
    };
  }
}
