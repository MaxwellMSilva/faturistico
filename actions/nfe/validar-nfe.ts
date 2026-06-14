"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type ValidarNfeResult = {
  success: boolean;
  erros: string[];
  avisos: string[];
};

function somenteNumeros(
  valor?: string | null
) {
  return valor?.replace(/\D/g, "") ?? "";
}

function possuiTexto(
  valor?: string | null
) {
  return Boolean(valor?.trim());
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

  if (nota.status !== "RASCUNHO") {
    erros.push(
      "Somente NF-e em rascunho pode ser validada."
    );
  }

  if (!configuracao) {
    erros.push(
      "A configuração fiscal da empresa não foi cadastrada."
    );
  }

  if (!certificado) {
    avisos.push(
      "Nenhum certificado digital A1 válido está cadastrado. Será possível validar o rascunho, mas não transmitir a NF-e."
    );
  }

  /*
   * Emitente
   */

  const empresa = nota.empresa;

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
      "O CNPJ da empresa emitente é inválido."
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
    empresa.uf?.trim().length !== 2
  ) {
    erros.push(
      "Informe a UF da empresa emitente."
    );
  }

  /*
   * Destinatário
   */

  const cliente = nota.cliente;

  if (!possuiTexto(cliente.nome)) {
    erros.push(
      "Informe o nome ou razão social do cliente."
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
      "O CPF ou CNPJ do cliente é inválido."
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
    cliente.uf?.trim().length !== 2
  ) {
    erros.push(
      "Informe a UF do cliente."
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
      somenteNumeros(
        natureza.cfop
      ).length !== 4
    ) {
      erros.push(
        "O CFOP da natureza de operação é inválido."
      );
    }

    if (
      natureza.contribuinteIcms &&
      !possuiTexto(
        cliente.inscricaoEstadual
      )
    ) {
      erros.push(
        "A natureza indica destinatário contribuinte de ICMS, mas o cliente não possui inscrição estadual."
      );
    }
  }

  /*
   * Itens
   */

  if (nota.itens.length === 0) {
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
        `Item ${numeroItem} — ${item.descricao}:`;

      if (
        somenteNumeros(
          item.ncm
        ).length !== 8
      ) {
        erros.push(
          `${prefixo} NCM inválido.`
        );
      }

      if (
        somenteNumeros(
          item.cfop
        ).length !== 4
      ) {
        erros.push(
          `${prefixo} CFOP inválido.`
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
          `${prefixo} valor unitário inválido.`
        );
      }

      if (
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
            item.csosnIcms ?? ""
          )
        ) {
          erros.push(
            `${prefixo} informe um CSOSN válido.`
          );
        }
      } else {
        if (
          !/^\d{2}$/.test(
            item.cstIcms ?? ""
          )
        ) {
          erros.push(
            `${prefixo} informe um CST de ICMS válido.`
          );
        }
      }

      if (
        !/^\d{2}$/.test(
          item.cstPis ?? ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST de PIS válido.`
        );
      }

      if (
        !/^\d{2}$/.test(
          item.cstCofins ?? ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST de COFINS válido.`
        );
      }

      if (
        item.aliquotaIpi.greaterThan(
          0
        ) &&
        !/^\d{2}$/.test(
          item.cstIpi ?? ""
        )
      ) {
        erros.push(
          `${prefixo} informe um CST de IPI válido.`
        );
      }
    }
  );

  if (
    nota.valorTotal.lessThanOrEqualTo(
      0
    )
  ) {
    erros.push(
      "O valor total da NF-e deve ser maior que zero."
    );
  }

  return {
    success: erros.length === 0,
    erros,
    avisos,
  };
}