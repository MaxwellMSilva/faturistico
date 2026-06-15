"use server";

import {
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export type ValidarNfeResult = {
  success: boolean;
  erros: string[];
  avisos: string[];
};

function somenteNumeros(
  valor?: string | null
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function possuiTexto(
  valor?: string | null
) {
  return Boolean(
    valor?.trim()
  );
}

function valoresDivergentes(
  valorAtual: Prisma.Decimal,
  valorEsperado: Prisma.Decimal
) {
  return valorAtual
    .minus(valorEsperado)
    .abs()
    .greaterThan(
      new Prisma.Decimal("0.01")
    );
}

function validarIgualdade({
  nome,
  valorAtual,
  valorEsperado,
  erros,
}: {
  nome: string;
  valorAtual: Prisma.Decimal;
  valorEsperado: Prisma.Decimal;
  erros: string[];
}) {
  if (
    valoresDivergentes(
      valorAtual,
      valorEsperado
    )
  ) {
    erros.push(
      `${nome} divergente. ` +
        `Calculado: R$ ${valorEsperado.toFixed(
          2
        )}; ` +
        `salvo: R$ ${valorAtual.toFixed(
          2
        )}.`
    );
  }
}

function validarPercentual({
  nome,
  valor,
  erros,
}: {
  nome: string;
  valor: Prisma.Decimal;
  erros: string[];
}) {
  if (
    valor.lessThan(0) ||
    valor.greaterThan(100)
  ) {
    erros.push(
      `${nome} deve estar entre 0 e 100.`
    );
  }
}

export async function validarNfe(
  empresaId: string,
  notaFiscalId: string
): Promise<ValidarNfeResult> {
  await validarAcessoEmpresa(
    empresaId
  );

  const [
    nota,
    configuracao,
    certificado,
  ] = await Promise.all([
    prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
      },

      include: {
        empresa: true,
        cliente: true,
        naturezaOperacao: true,
        transporte: true,

        itens: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),

    prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId,
      },
    }),

    prisma.certificadoDigital.findFirst({
      where: {
        empresaId,
        ativo: true,

        validadeFim: {
          gt: new Date(),
        },
      },

      select: {
        id: true,
      },
    }),
  ]);

  const erros: string[] = [];
  const avisos: string[] = [];

  if (!nota) {
    return {
      success: false,

      erros: [
        "NF-e não encontrada nesta empresa.",
      ],

      avisos: [],
    };
  }

  /*
   * Situação da NF-e
   */

  if (
    nota.status !== "RASCUNHO"
  ) {
    erros.push(
      "Somente NF-e em rascunho pode ser validada."
    );
  }

  /*
   * Configuração fiscal
   */

  if (!configuracao) {
    erros.push(
      "A configuração fiscal da empresa não foi cadastrada."
    );
  }

  /*
   * Certificado
   */

  if (!certificado) {
    avisos.push(
      "Nenhum certificado digital A1 válido está cadastrado. " +
        "O rascunho poderá ser validado, mas não poderá ser assinado ou transmitido."
    );
  }

  /*
   * Emitente
   */

  const empresa =
    nota.empresa;

  if (
    !possuiTexto(
      empresa.razaoSocial
    )
  ) {
    erros.push(
      "Informe a razão social da empresa emitente."
    );
  }

  if (
    somenteNumeros(
      empresa.cnpj
    ).length !== 14
  ) {
    erros.push(
      "O CNPJ da empresa emitente deve possuir 14 números."
    );
  }

  if (
    !possuiTexto(
      empresa.inscricaoEstadual
    )
  ) {
    erros.push(
      "Informe a inscrição estadual da empresa emitente."
    );
  }

  if (
    somenteNumeros(
      empresa.cep
    ).length !== 8
  ) {
    erros.push(
      "Informe um CEP válido para a empresa emitente."
    );
  }

  if (
    !possuiTexto(
      empresa.logradouro
    )
  ) {
    erros.push(
      "Informe o logradouro da empresa emitente."
    );
  }

  if (
    !possuiTexto(
      empresa.numero
    )
  ) {
    erros.push(
      "Informe o número do endereço da empresa emitente."
    );
  }

  if (
    !possuiTexto(
      empresa.bairro
    )
  ) {
    erros.push(
      "Informe o bairro da empresa emitente."
    );
  }

  if (
    !possuiTexto(
      empresa.municipio
    )
  ) {
    erros.push(
      "Informe o município da empresa emitente."
    );
  }

  if (
    somenteNumeros(
      empresa.codigoMunicipio
    ).length !== 7
  ) {
    erros.push(
      "Informe o código IBGE do município da empresa emitente."
    );
  }

  if (
    empresa.uf
      ?.trim()
      .toUpperCase()
      .length !== 2
  ) {
    erros.push(
      "Informe uma UF válida para a empresa emitente."
    );
  }

  /*
   * Destinatário
   */

  const cliente =
    nota.cliente;

  if (
    !possuiTexto(
      cliente.nome
    )
  ) {
    erros.push(
      "Informe o nome ou a razão social do cliente."
    );
  }

  const documentoCliente =
    somenteNumeros(
      cliente.cpfCnpj
    );

  if (
    documentoCliente.length !== 11 &&
    documentoCliente.length !== 14
  ) {
    erros.push(
      "O CPF ou CNPJ do cliente deve possuir 11 ou 14 números."
    );
  }

  if (
    somenteNumeros(
      cliente.cep
    ).length !== 8
  ) {
    erros.push(
      "Informe um CEP válido para o cliente."
    );
  }

  if (
    !possuiTexto(
      cliente.logradouro
    )
  ) {
    erros.push(
      "Informe o logradouro do cliente."
    );
  }

  if (
    !possuiTexto(
      cliente.numero
    )
  ) {
    erros.push(
      "Informe o número do endereço do cliente."
    );
  }

  if (
    !possuiTexto(
      cliente.bairro
    )
  ) {
    erros.push(
      "Informe o bairro do cliente."
    );
  }

  if (
    !possuiTexto(
      cliente.municipio
    )
  ) {
    erros.push(
      "Informe o município do cliente."
    );
  }

  if (
    somenteNumeros(
      cliente.codigoMunicipio
    ).length !== 7
  ) {
    erros.push(
      "Informe o código IBGE do município do cliente."
    );
  }

  if (
    cliente.uf
      ?.trim()
      .toUpperCase()
      .length !== 2
  ) {
    erros.push(
      "Informe uma UF válida para o cliente."
    );
  }

  /*
   * Natureza de operação
   */

  const natureza =
    nota.naturezaOperacao;

  if (!natureza) {
    erros.push(
      "Selecione uma natureza de operação."
    );
  } else {
    if (
      !possuiTexto(
        natureza.descricao
      )
    ) {
      erros.push(
        "Informe a descrição da natureza de operação."
      );
    }

    if (
      somenteNumeros(
        natureza.cfop
      ).length !== 4
    ) {
      erros.push(
        "O CFOP da natureza de operação deve possuir 4 números."
      );
    }

    if (
      natureza.contribuinteIcms &&
      !possuiTexto(
        cliente.inscricaoEstadual
      )
    ) {
      erros.push(
        "A natureza de operação indica destinatário contribuinte de ICMS, " +
          "mas o cliente não possui inscrição estadual."
      );
    }
  }

  /*
   * Transporte
   */

  const transporte =
    nota.transporte;

  if (!transporte) {
    erros.push(
      "Informe a modalidade do frete da NF-e."
    );
  } else {
    const semTransporte =
      transporte.modalidadeFrete ===
      "SEM_TRANSPORTE";

    const modalidadesValidas =
      new Set([
        "POR_CONTA_EMITENTE",
        "POR_CONTA_DESTINATARIO",
        "POR_CONTA_TERCEIROS",
        "TRANSPORTE_PROPRIO_EMITENTE",
        "TRANSPORTE_PROPRIO_DESTINATARIO",
        "SEM_TRANSPORTE",
      ]);

    if (
      !modalidadesValidas.has(
        transporte.modalidadeFrete
      )
    ) {
      erros.push(
        "A modalidade do frete é inválida."
      );
    }

    if (!semTransporte) {
      /*
       * Transportador
       */

      const possuiTransportador =
        Boolean(
          transporte.transportadorId ||
            transporte.transportadorNome ||
            transporte.transportadorCpfCnpj
        );

      if (possuiTransportador) {
        if (
          !possuiTexto(
            transporte.transportadorNome
          )
        ) {
          erros.push(
            "Informe o nome ou razão social do transportador."
          );
        }

        const documentoTransportador =
          somenteNumeros(
            transporte.transportadorCpfCnpj
          );

        if (
          documentoTransportador &&
          documentoTransportador.length !==
            11 &&
          documentoTransportador.length !==
            14
        ) {
          erros.push(
            "O CPF ou CNPJ do transportador é inválido."
          );
        }

        if (
          transporte.transportadorUf &&
          transporte.transportadorUf
            .trim().length !== 2
        ) {
          erros.push(
            "A UF do transportador é inválida."
          );
        }
      }

      if (
        [
          "POR_CONTA_EMITENTE",
          "POR_CONTA_DESTINATARIO",
          "POR_CONTA_TERCEIROS",
        ].includes(
          transporte.modalidadeFrete
        ) &&
        !possuiTransportador
      ) {
        avisos.push(
          "A modalidade de frete selecionada não possui transportador informado."
        );
      }

      /*
       * Veículo
       */

      const possuiVeiculo =
        Boolean(
          transporte.veiculoId ||
            transporte.veiculoPlaca ||
            transporte.veiculoRenavam ||
            transporte.veiculoUf
        );

      if (possuiVeiculo) {
        const placa =
          transporte.veiculoPlaca
            ?.replace(
              /[^a-zA-Z0-9]/g,
              ""
            )
            .toUpperCase() ?? "";

        const placaAntiga =
          /^[A-Z]{3}\d{4}$/.test(
            placa
          );

        const placaMercosul =
          /^[A-Z]{3}\d[A-Z]\d{2}$/.test(
            placa
          );

        if (
          !placaAntiga &&
          !placaMercosul
        ) {
          erros.push(
            "A placa do veículo de transporte é inválida."
          );
        }

        if (
          transporte.veiculoUf?.trim()
            .length !== 2
        ) {
          erros.push(
            "Informe uma UF válida para o veículo de transporte."
          );
        }

        const renavam =
          somenteNumeros(
            transporte.veiculoRenavam
          );

        if (
          renavam &&
          renavam.length !== 11
        ) {
          erros.push(
            "O RENAVAM do veículo de transporte é inválido."
          );
        }
      }

      if (
        [
          "TRANSPORTE_PROPRIO_EMITENTE",
          "TRANSPORTE_PROPRIO_DESTINATARIO",
        ].includes(
          transporte.modalidadeFrete
        ) &&
        !possuiVeiculo
      ) {
        avisos.push(
          "A modalidade de transporte próprio foi selecionada, mas nenhum veículo foi informado."
        );
      }

      /*
       * Motorista
       */

      const possuiMotorista =
        Boolean(
          transporte.motoristaId ||
            transporte.motoristaNome ||
            transporte.motoristaCpf ||
            transporte.motoristaCnh
        );

      if (possuiMotorista) {
        if (
          !possuiTexto(
            transporte.motoristaNome
          )
        ) {
          erros.push(
            "Informe o nome do motorista."
          );
        }

        const cpfMotorista =
          somenteNumeros(
            transporte.motoristaCpf
          );

        if (
          cpfMotorista &&
          cpfMotorista.length !== 11
        ) {
          erros.push(
            "O CPF do motorista é inválido."
          );
        }

        const cnhMotorista =
          somenteNumeros(
            transporte.motoristaCnh
          );

        if (
          cnhMotorista &&
          cnhMotorista.length !== 11
        ) {
          erros.push(
            "O número da CNH do motorista é inválido."
          );
        }
      }

      /*
       * Volumes
       */

      if (
        transporte.quantidadeVolumes !==
          null &&
        transporte.quantidadeVolumes <= 0
      ) {
        erros.push(
          "A quantidade de volumes deve ser maior que zero."
        );
      }

      const possuiDadosVolumes =
        Boolean(
          transporte.quantidadeVolumes ||
            possuiTexto(
              transporte.especieVolumes
            ) ||
            possuiTexto(
              transporte.marcaVolumes
            ) ||
            possuiTexto(
              transporte.numeracaoVolumes
            ) ||
            transporte.pesoLiquido !==
              null ||
            transporte.pesoBruto !== null
        );

      if (
        possuiDadosVolumes &&
        !transporte.quantidadeVolumes
      ) {
        avisos.push(
          "Existem dados de volumes informados, mas a quantidade de volumes não foi preenchida."
        );
      }

      if (
        transporte.quantidadeVolumes &&
        !possuiTexto(
          transporte.especieVolumes
        )
      ) {
        avisos.push(
          "A quantidade de volumes foi informada, mas a espécie dos volumes está vazia."
        );
      }

      /*
       * Pesos
       */

      if (
        transporte.pesoLiquido !== null &&
        transporte.pesoLiquido.lessThan(
          0
        )
      ) {
        erros.push(
          "O peso líquido não pode ser negativo."
        );
      }

      if (
        transporte.pesoBruto !== null &&
        transporte.pesoBruto.lessThan(
          0
        )
      ) {
        erros.push(
          "O peso bruto não pode ser negativo."
        );
      }

      if (
        transporte.pesoLiquido !== null &&
        transporte.pesoBruto !== null &&
        transporte.pesoLiquido.greaterThan(
          transporte.pesoBruto
        )
      ) {
        erros.push(
          "O peso líquido não pode ser maior que o peso bruto."
        );
      }

      if (
        transporte.pesoLiquido !== null &&
        transporte.pesoBruto === null
      ) {
        avisos.push(
          "O peso líquido foi informado, mas o peso bruto não foi preenchido."
        );
      }
    }
  }

  /*
   * Itens
   */

  if (
    nota.itens.length === 0
  ) {
    erros.push(
      "Adicione pelo menos um item à NF-e."
    );
  }

  const usaCsosn =
    configuracao?.regimeTributario ===
      "SIMPLES_NACIONAL" ||
    configuracao?.regimeTributario ===
      "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE";

  nota.itens.forEach(
    (item, indice) => {
      const numeroItem =
        indice + 1;

      const prefixo =
        `Item ${numeroItem} — ` +
        `${item.descricao}:`;

      /*
       * Dados comerciais
       */

      if (
        !possuiTexto(
          item.codigoProduto
        )
      ) {
        erros.push(
          `${prefixo} código do produto não informado.`
        );
      }

      if (
        !possuiTexto(
          item.descricao
        )
      ) {
        erros.push(
          `${prefixo} descrição não informada.`
        );
      }

      if (
        !possuiTexto(
          item.unidade
        )
      ) {
        erros.push(
          `${prefixo} unidade não informada.`
        );
      }

      if (
        somenteNumeros(
          item.ncm
        ).length !== 8
      ) {
        erros.push(
          `${prefixo} NCM deve possuir 8 números.`
        );
      }

      if (
        somenteNumeros(
          item.cfop
        ).length !== 4
      ) {
        erros.push(
          `${prefixo} CFOP deve possuir 4 números.`
        );
      }

      if (
        item.quantidade.lessThanOrEqualTo(
          0
        )
      ) {
        erros.push(
          `${prefixo} quantidade deve ser maior que zero.`
        );
      }

      if (
        item.valorUnitario.lessThan(
          0
        )
      ) {
        erros.push(
          `${prefixo} valor unitário não pode ser negativo.`
        );
      }

      if (
        item.valorDesconto.lessThan(
          0
        )
      ) {
        erros.push(
          `${prefixo} desconto não pode ser negativo.`
        );
      }

      const valorBrutoEsperado =
        item.quantidade
          .times(
            item.valorUnitario
          )
          .toDecimalPlaces(2);

      validarIgualdade({
        nome:
          `${prefixo} valor bruto`,

        valorAtual:
          item.valorBruto,

        valorEsperado:
          valorBrutoEsperado,

        erros,
      });

      if (
        item.valorDesconto.greaterThan(
          item.valorBruto
        )
      ) {
        erros.push(
          `${prefixo} desconto não pode ser maior que o valor bruto.`
        );
      }

      const valorLiquidoEsperado =
        item.valorBruto
          .minus(
            item.valorDesconto
          )
          .toDecimalPlaces(2);

      validarIgualdade({
        nome:
          `${prefixo} valor total`,

        valorAtual:
          item.valorTotal,

        valorEsperado:
          valorLiquidoEsperado,

        erros,
      });

      /*
       * ICMS
       */

      if (
        !Number.isInteger(
          item.origemMercadoria
        ) ||
        item.origemMercadoria < 0 ||
        item.origemMercadoria > 8
      ) {
        erros.push(
          `${prefixo} origem da mercadoria inválida.`
        );
      }

      if (usaCsosn) {
        if (
          !/^\d{3}$/.test(
            item.csosnIcms ??
              ""
          )
        ) {
          erros.push(
            `${prefixo} informe um CSOSN válido com 3 números.`
          );
        }
      } else {
        if (
          !/^\d{2}$/.test(
            item.cstIcms ??
              ""
          )
        ) {
          erros.push(
            `${prefixo} informe um CST de ICMS válido com 2 números.`
          );
        }
      }

      validarPercentual({
        nome:
          `${prefixo} redução da base do ICMS`,

        valor:
          item.reducaoBcIcms,

        erros,
      });

      validarPercentual({
        nome:
          `${prefixo} alíquota do ICMS`,

        valor:
          item.aliquotaIcms,

        erros,
      });

      /*
       * PIS
       */

      if (
        !/^\d{2}$/.test(
          item.cstPis ?? ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST de PIS válido com 2 números.`
        );
      }

      validarPercentual({
        nome:
          `${prefixo} alíquota do PIS`,

        valor:
          item.aliquotaPis,

        erros,
      });

      /*
       * COFINS
       */

      if (
        !/^\d{2}$/.test(
          item.cstCofins ?? ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST de COFINS válido com 2 números.`
        );
      }

      validarPercentual({
        nome:
          `${prefixo} alíquota da COFINS`,

        valor:
          item.aliquotaCofins,

        erros,
      });

      /*
       * IPI
       */

      validarPercentual({
        nome:
          `${prefixo} alíquota do IPI`,

        valor:
          item.aliquotaIpi,

        erros,
      });

      if (
        item.aliquotaIpi.greaterThan(
          0
        )
      ) {
        if (
          !/^\d{2}$/.test(
            item.cstIpi ?? ""
          )
        ) {
          erros.push(
            `${prefixo} informe um CST de IPI válido com 2 números.`
          );
        }

        if (
          !/^\d{3}$/.test(
            item
              .codigoEnquadramentoIpi ??
              ""
          )
        ) {
          erros.push(
            `${prefixo} informe um código de enquadramento do IPI com 3 números.`
          );
        }
      }

      /*
       * IBS e CBS
       */

      if (
        !/^\d{3}$/.test(
          item.cstIbsCbs ??
            ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST IBS/CBS válido com 3 números.`
        );
      }

      if (
        !/^\d{6}$/.test(
          item
            .classificacaoTributariaIbsCbs ??
            ""
        )
      ) {
        erros.push(
          `${prefixo} informe um cClassTrib válido com 6 números.`
        );
      }

      validarPercentual({
        nome:
          `${prefixo} alíquota do IBS estadual`,

        valor:
          item.aliquotaIbsUf,

        erros,
      });

      validarPercentual({
        nome:
          `${prefixo} alíquota do IBS municipal`,

        valor:
          item.aliquotaIbsMun,

        erros,
      });

      validarPercentual({
        nome:
          `${prefixo} alíquota da CBS`,

        valor:
          item.aliquotaCbs,

        erros,
      });

      const valorIbsEsperado =
        item.valorIbsUf
          .plus(
            item.valorIbsMun
          )
          .toDecimalPlaces(2);

      validarIgualdade({
        nome:
          `${prefixo} total do IBS`,

        valorAtual:
          item.valorIbs,

        valorEsperado:
          valorIbsEsperado,

        erros,
      });
    }
  );

  /*
   * Totais da NF-e
   */

  const zero =
    new Prisma.Decimal(0);

  const totaisItens =
    nota.itens.reduce(
      (total, item) => ({
        valorProdutos:
          total.valorProdutos.plus(
            item.valorBruto
          ),

        valorDesconto:
          total.valorDesconto.plus(
            item.valorDesconto
          ),

        valorLiquido:
          total.valorLiquido.plus(
            item.valorTotal
          ),

        valorBaseIcms:
          total.valorBaseIcms.plus(
            item.baseCalculoIcms
          ),

        valorIcms:
          total.valorIcms.plus(
            item.valorIcms
          ),

        valorPis:
          total.valorPis.plus(
            item.valorPis
          ),

        valorCofins:
          total.valorCofins.plus(
            item.valorCofins
          ),

        valorIpi:
          total.valorIpi.plus(
            item.valorIpi
          ),

        valorBaseIbsCbs:
          total.valorBaseIbsCbs.plus(
            item.baseCalculoIbsCbs
          ),

        valorIbsUf:
          total.valorIbsUf.plus(
            item.valorIbsUf
          ),

        valorIbsMun:
          total.valorIbsMun.plus(
            item.valorIbsMun
          ),

        valorIbs:
          total.valorIbs.plus(
            item.valorIbs
          ),

        valorCbs:
          total.valorCbs.plus(
            item.valorCbs
          ),
      }),

      {
        valorProdutos: zero,
        valorDesconto: zero,
        valorLiquido: zero,

        valorBaseIcms: zero,
        valorIcms: zero,

        valorPis: zero,
        valorCofins: zero,
        valorIpi: zero,

        valorBaseIbsCbs: zero,

        valorIbsUf: zero,
        valorIbsMun: zero,
        valorIbs: zero,

        valorCbs: zero,
      }
    );

  validarIgualdade({
    nome:
      "Total dos produtos",

    valorAtual:
      nota.valorProdutos,

    valorEsperado:
      totaisItens.valorProdutos,

    erros,
  });

  validarIgualdade({
    nome:
      "Total dos descontos",

    valorAtual:
      nota.valorDesconto,

    valorEsperado:
      totaisItens.valorDesconto,

    erros,
  });

  validarIgualdade({
    nome:
      "Base total do ICMS",

    valorAtual:
      nota.valorBaseIcms,

    valorEsperado:
      totaisItens.valorBaseIcms,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do ICMS",

    valorAtual:
      nota.valorIcms,

    valorEsperado:
      totaisItens.valorIcms,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do PIS",

    valorAtual:
      nota.valorPis,

    valorEsperado:
      totaisItens.valorPis,

    erros,
  });

  validarIgualdade({
    nome:
      "Total da COFINS",

    valorAtual:
      nota.valorCofins,

    valorEsperado:
      totaisItens.valorCofins,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do IPI",

    valorAtual:
      nota.valorIpi,

    valorEsperado:
      totaisItens.valorIpi,

    erros,
  });

  validarIgualdade({
    nome:
      "Base total do IBS/CBS",

    valorAtual:
      nota.valorBaseIbsCbs,

    valorEsperado:
      totaisItens.valorBaseIbsCbs,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do IBS estadual",

    valorAtual:
      nota.valorIbsUf,

    valorEsperado:
      totaisItens.valorIbsUf,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do IBS municipal",

    valorAtual:
      nota.valorIbsMun,

    valorEsperado:
      totaisItens.valorIbsMun,

    erros,
  });

  validarIgualdade({
    nome:
      "Total do IBS",

    valorAtual:
      nota.valorIbs,

    valorEsperado:
      totaisItens.valorIbs,

    erros,
  });

  validarIgualdade({
    nome:
      "Total da CBS",

    valorAtual:
      nota.valorCbs,

    valorEsperado:
      totaisItens.valorCbs,

    erros,
  });

  const valorTotalEsperado =
    totaisItens.valorLiquido
      .plus(
        nota.valorFrete
      )
      .plus(
        nota.valorOutros
      )
      .plus(
        totaisItens.valorIpi
      )
      .toDecimalPlaces(2);

  validarIgualdade({
    nome:
      "Valor total da NF-e",

    valorAtual:
      nota.valorTotal,

    valorEsperado:
      valorTotalEsperado,

    erros,
  });

  if (
    nota.valorTotal.lessThanOrEqualTo(
      0
    )
  ) {
    erros.push(
      "O valor total da NF-e deve ser maior que zero."
    );
  }

  /*
   * Aviso sobre tabela IBS/CBS
   */

  if (
    nota.itens.length > 0
  ) {
    avisos.push(
      "O formato dos campos CST IBS/CBS e cClassTrib foi validado. " +
        "A compatibilidade do par ainda será conferida pela tabela oficial."
    );
  }

  return {
    success:
      erros.length === 0,

    erros,
    avisos,
  };
}