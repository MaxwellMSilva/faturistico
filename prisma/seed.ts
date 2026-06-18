import "dotenv/config";

import { hash } from "bcryptjs";
import { FinalidadeNfe, Prisma, RoleUsuario, TipoItem, TipoPessoa, TipoVeiculo, } from "@prisma/client";

import { prisma } from "../lib/prisma";

const db =
  prisma as typeof prisma &
    Record<string, any>;

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

async function opcional(
  nome: string,
  executar: () => Promise<void>
) {
  try {
    await executar();
    console.log(`✔ ${nome}`);
  } catch (error) {
    console.warn(`⚠ ${nome} não foi inserido.`);
    console.warn(error);
  }
}

async function seedBase() {
  const nomeOwner =
    process.env.SEED_OWNER_NAME?.trim() ||
    "Administrador Faturístico";

  const emailOwner =
    process.env.SEED_OWNER_EMAIL
      ?.trim()
      .toLowerCase() ||
    "admin@faturistico.local";

  const senhaOwner =
    process.env.SEED_OWNER_PASSWORD ||
    "123456";

  const razaoSocial =
    process.env.SEED_EMPRESA_RAZAO_SOCIAL
      ?.trim() ||
    "EMPRESA DEMONSTRAÇÃO LTDA";

  const nomeFantasia =
    process.env.SEED_EMPRESA_NOME_FANTASIA
      ?.trim() ||
    "Empresa Demonstração";

  const cnpj =
    somenteNumeros(
      process.env.SEED_EMPRESA_CNPJ ||
        "12345678000195"
    );

  if (cnpj.length !== 14) {
    throw new Error(
      "SEED_EMPRESA_CNPJ deve possuir 14 números."
    );
  }

  if (senhaOwner.length < 6) {
    throw new Error(
      "SEED_OWNER_PASSWORD deve possuir ao menos 6 caracteres."
    );
  }

  const senhaHash =
    await hash(senhaOwner, 10);

  const owner =
    await prisma.usuario.upsert({
      where: {
        email: emailOwner,
      },

      update: {
        nome: nomeOwner,
        senhaHash,
        role: RoleUsuario.OWNER,
        ativo: true,
      },

      create: {
        nome: nomeOwner,
        email: emailOwner,
        senhaHash,
        role: RoleUsuario.OWNER,
        ativo: true,
      },
    });

  const empresa =
    await prisma.empresa.upsert({
      where: {
        cnpj,
      },

      update: {
        razaoSocial,
        nomeFantasia,
        ativo: true,
      },

      create: {
        razaoSocial,
        nomeFantasia,
        cnpj,
        inscricaoEstadual: "ISENTO",
        email: "empresa@faturistico.local",
        telefone: "69999999999",
        cep: "76800000",
        logradouro: "Avenida Sete de Setembro",
        numero: "1000",
        bairro: "Centro",
        municipio: "Porto Velho",
        codigoMunicipio: "1100205",
        uf: "RO",
        codigoPais: "1058",
        pais: "BRASIL",
        ativo: true,
      },
    });

  await prisma.usuarioEmpresa.upsert({
    where: {
      usuarioId_empresaId: {
        usuarioId: owner.id,
        empresaId: empresa.id,
      },
    },

    update: {
      permissao: "OWNER",
      ativo: true,
    },

    create: {
      usuarioId: owner.id,
      empresaId: empresa.id,
      permissao: "OWNER",
      ativo: true,
    },
  });

  return {
    owner,
    empresa,
  };
}

  const QUANTIDADE_DEMO = 20;

  function calcularDigito(
    valor: string,
    pesos: number[]
  ) {
    const soma = valor
      .split("")
      .reduce(
        (total, numero, indice) =>
          total +
          Number(numero) *
            pesos[indice],
        0
      );

    const resto = soma % 11;

    return resto < 2
      ? 0
      : 11 - resto;
  }

function gerarCpf(
  grupo: number,
  indice: number
) {
  const base =
    `${grupo}${String(
      indice
    ).padStart(8, "0")}`;

  const primeiroDigito =
    calcularDigito(
      base,
      [
        10,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    );

  const segundoDigito =
    calcularDigito(
      `${base}${primeiroDigito}`,
      [
        11,
        10,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    );

  return `${base}${primeiroDigito}${segundoDigito}`;
}

function gerarCnpj(
  grupo: number,
  indice: number
) {
  const base =
    `${grupo}${String(
      indice
    ).padStart(11, "0")}`;

  const primeiroDigito =
    calcularDigito(
      base,
      [
        5,
        4,
        3,
        2,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    );

  const segundoDigito =
    calcularDigito(
      `${base}${primeiroDigito}`,
      [
        6,
        5,
        4,
        3,
        2,
        9,
        8,
        7,
        6,
        5,
        4,
        3,
        2,
      ]
    );

  return `${base}${primeiroDigito}${segundoDigito}`;
}

function gerarPlaca(
  indice: number
) {
  const letras =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const terceiraLetra =
    letras[
      (indice - 1) %
        letras.length
    ];

  const quintaLetra =
    letras[
      (indice + 7) %
        letras.length
    ];

  const numeroCentral =
    indice % 10;

  return `RO${terceiraLetra}${numeroCentral}${quintaLetra}${String(
    indice
  ).padStart(2, "0")}`;
}

async function seedDemo(
  empresaId: string
) {
  /*
   * Módulos
   */

  await opcional(
    "Módulos fiscais",
    async () => {
      if (!db.modulo) {
        return;
      }

      const modulos = [
        ["NF-e", "NFE"],
        ["MDF-e", "MDFE"],
        ["CT-e", "CTE"],
        ["NFS-e", "NFSE"],
      ];

      for (const [
        nome,
        codigo,
      ] of modulos) {
        const existente =
          await db.modulo.findFirst({
            where: {
              codigo,
            },
          });

        const data = {
          nome,
          codigo,

          valor:
            new Prisma.Decimal(
              "50"
            ),

          ativo: true,
        };

        if (existente) {
          await db.modulo.update({
            where: {
              id: existente.id,
            },

            data,
          });
        } else {
          await db.modulo.create({
            data,
          });
        }
      }
    }
  );

  /*
   * Configuração fiscal
   */

  await opcional(
    "Configuração fiscal",
    async () => {
      if (
        !db.configuracaoFiscal
      ) {
        return;
      }

      const existente =
        await db.configuracaoFiscal.findFirst({
          where: {
            empresaId,
          },
        });

      const data = {
        ambiente:
          "HOMOLOGACAO",

        regimeTributario:
          "SIMPLES_NACIONAL",

        serieNfe: 1,
        serieNfce: 1,
      };

      if (existente) {
        await db.configuracaoFiscal.update({
          where: {
            id: existente.id,
          },

          data,
        });
      } else {
        await db.configuracaoFiscal.create({
          data: {
            empresaId,
            ...data,
          },
        });
      }
    }
  );

  /*
   * Naturezas de operação
   */

  const naturezas: Array<{
    cfop: string;
    descricao: string;
    finalidadeNfe: FinalidadeNfe;
    consumidorFinal: boolean;
    contribuinteIcms: boolean;
  }> = [
    {
      cfop: "5101",
      descricao:
        "Venda de produção do estabelecimento",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5102",
      descricao:
        "Venda de mercadoria adquirida ou recebida de terceiros",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5103",
      descricao:
        "Venda de produção efetuada fora do estabelecimento",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: true,
      contribuinteIcms: false,
    },
    {
      cfop: "5104",
      descricao:
        "Venda de mercadoria adquirida efetuada fora do estabelecimento",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: true,
      contribuinteIcms: false,
    },
    {
      cfop: "5116",
      descricao:
        "Venda de produção originada de encomenda para entrega futura",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5117",
      descricao:
        "Venda de mercadoria adquirida originada de encomenda para entrega futura",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5151",
      descricao:
        "Transferência de produção do estabelecimento",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5152",
      descricao:
        "Transferência de mercadoria adquirida de terceiros",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5201",
      descricao:
        "Devolução de compra para industrialização",
      finalidadeNfe:
        FinalidadeNfe.DEVOLUCAO,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5202",
      descricao:
        "Devolução de compra para comercialização",
      finalidadeNfe:
        FinalidadeNfe.DEVOLUCAO,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5401",
      descricao:
        "Venda de produção sujeita à substituição tributária",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5403",
      descricao:
        "Venda de mercadoria adquirida sujeita à substituição tributária",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5405",
      descricao:
        "Venda de mercadoria sujeita à substituição tributária como substituído",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: true,
      contribuinteIcms: false,
    },
    {
      cfop: "5910",
      descricao:
        "Remessa em bonificação, doação ou brinde",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: true,
      contribuinteIcms: false,
    },
    {
      cfop: "5911",
      descricao:
        "Remessa de amostra grátis",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: true,
      contribuinteIcms: false,
    },
    {
      cfop: "5912",
      descricao:
        "Remessa de mercadoria para demonstração",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5915",
      descricao:
        "Remessa de mercadoria para conserto ou reparo",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5917",
      descricao:
        "Remessa de mercadoria em consignação mercantil",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5922",
      descricao:
        "Simples faturamento decorrente de venda para entrega futura",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
    {
      cfop: "5949",
      descricao:
        "Outra saída de mercadoria ou prestação de serviço não especificada",
      finalidadeNfe:
        FinalidadeNfe.NORMAL,
      consumidorFinal: false,
      contribuinteIcms: true,
    },
  ];

  for (
    const natureza of
    naturezas
  ) {
    const existente =
      await prisma.naturezaOperacao.findFirst({
        where: {
          empresaId,

          cfop:
            natureza.cfop,

          descricao:
            natureza.descricao,
        },

        select: {
          id: true,
        },
      });

    if (existente) {
      await prisma.naturezaOperacao.update({
        where: {
          id: existente.id,
        },

        data: {
          ...natureza,
          ativo: true,
        },
      });
    } else {
      await prisma.naturezaOperacao.create({
        data: {
          empresaId,
          ...natureza,
          ativo: true,
        },
      });
    }
  }

  console.log(
    `✔ ${naturezas.length} naturezas de operação`
  );

  /*
   * Clientes
   */

  for (
    let indice = 1;
    indice <=
    QUANTIDADE_DEMO;
    indice++
  ) {
    const pessoaFisica =
      indice <= 10;

    const tipoPessoa =
      pessoaFisica
        ? TipoPessoa.FISICA
        : TipoPessoa.JURIDICA;

    const cpfCnpj =
      pessoaFisica
        ? gerarCpf(
            1,
            indice
          )
        : gerarCnpj(
            2,
            indice
          );

    const nome =
      pessoaFisica
        ? `Cliente Pessoa Física ${String(
            indice
          ).padStart(2, "0")}`
        : `CLIENTE EMPRESA ${String(
            indice
          ).padStart(2, "0")} LTDA`;

    const data = {
      tipoPessoa,
      nome,
      cpfCnpj,

      inscricaoEstadual:
        pessoaFisica
          ? null
          : "ISENTO",

      inscricaoMunicipal:
        null,

      suframa: null,

      email:
        `cliente${String(
          indice
        ).padStart(
          2,
          "0"
        )}@faturistico.local`,

      telefone:
        `6998${String(
          indice
        ).padStart(7, "0")}`,

      cep:
        String(
          76801000 +
            indice
        ),

      logradouro:
        `Rua Demonstração ${indice}`,

      numero:
        String(
          100 + indice
        ),

      complemento:
        indice % 3 === 0
          ? `Sala ${indice}`
          : null,

      bairro:
        indice % 2 === 0
          ? "Centro"
          : "Nova Porto Velho",

      municipio:
        "Porto Velho",

      codigoMunicipio:
        "1100205",

      uf: "RO",

      codigoPais:
        "1058",

      pais: "BRASIL",

      ativo: true,
    };

    await prisma.cliente.upsert({
      where: {
        empresaId_cpfCnpj: {
          empresaId,
          cpfCnpj,
        },
      },

      update: data,

      create: {
        empresaId,
        ...data,
      },
    });
  }

  console.log(
    `✔ ${QUANTIDADE_DEMO} clientes`
  );

  /*
   * Produtos
   */

  const produtosDemo = [
    {
      descricao:
        "Teclado USB ABNT2",
      ncm: "84716052",
      valor: "89.90",
    },
    {
      descricao:
        "Mouse óptico USB",
      ncm: "84716053",
      valor: "49.90",
    },
    {
      descricao:
        "Roteador Wi-Fi",
      ncm: "85176241",
      valor: "249.90",
    },
    {
      descricao:
        "Switch de rede 8 portas",
      ncm: "85176259",
      valor: "189.90",
    },
    {
      descricao:
        "Notebook corporativo",
      ncm: "84713012",
      valor: "3899.90",
    },
    {
      descricao:
        "Computador desktop",
      ncm: "84715010",
      valor: "2999.90",
    },
    {
      descricao:
        "Monitor LED 24 polegadas",
      ncm: "85285220",
      valor: "899.90",
    },
    {
      descricao:
        "Fonte de alimentação 500W",
      ncm: "85044040",
      valor: "329.90",
    },
    {
      descricao:
        "SSD 480GB",
      ncm: "84717012",
      valor: "249.90",
    },
    {
      descricao:
        "Disco rígido 1TB",
      ncm: "84717011",
      valor: "349.90",
    },
    {
      descricao:
        "Memória RAM 8GB",
      ncm: "84733043",
      valor: "199.90",
    },
    {
      descricao:
        "Placa-mãe",
      ncm: "84733092",
      valor: "649.90",
    },
    {
      descricao:
        "Headset com microfone",
      ncm: "85183000",
      valor: "139.90",
    },
    {
      descricao:
        "Webcam Full HD",
      ncm: "85258929",
      valor: "219.90",
    },
    {
      descricao:
        "Cabo de rede 10 metros",
      ncm: "85444200",
      valor: "39.90",
    },
    {
      descricao:
        "Mousepad ergonômico",
      ncm: "39269090",
      valor: "29.90",
    },
    {
      descricao:
        "Mesa para escritório",
      ncm: "94032000",
      valor: "599.90",
    },
    {
      descricao:
        "Cadeira para escritório",
      ncm: "94013090",
      valor: "799.90",
    },
    {
      descricao:
        "Impressora multifuncional",
      ncm: "84433231",
      valor: "1299.90",
    },
    {
      descricao:
        "Pen drive 64GB",
      ncm: "85235110",
      valor: "69.90",
    },
  ];

  for (
    let indice = 0;
    indice <
    produtosDemo.length;
    indice++
  ) {
    const produto =
      produtosDemo[indice];

    const numero =
      indice + 1;

    const codigo =
      `PROD-${String(
        numero
      ).padStart(3, "0")}`;

    const valorUnitario =
      new Prisma.Decimal(
        produto.valor
      );

    const custoUnitario =
      valorUnitario.mul(
        new Prisma.Decimal(
          "0.65"
        )
      );

    const data = {
      tipo:
        TipoItem.PRODUTO,

      codigo,

      descricao:
        produto.descricao,

      descricaoCompleta:
        `${produto.descricao} - produto de demonstração`,

      unidade: "UN",

      ean: null,

      valorUnitario,

      custoUnitario,

      estoqueAtual:
        new Prisma.Decimal(
          String(
            10 +
              numero * 5
          )
        ),

      ncm: produto.ncm,

      cest: null,

      cfopPadrao:
        "5102",

      origemMercadoria: 0,

      cstIcms: null,

      csosnIcms:
        "102",

      modalidadeBcIcms:
        3,

      reducaoBcIcms:
        new Prisma.Decimal(
          "0"
        ),

      aliquotaIcms:
        new Prisma.Decimal(
          "0"
        ),

      cstPis: "49",

      aliquotaPis:
        new Prisma.Decimal(
          "0"
        ),

      cstCofins: "49",

      aliquotaCofins:
        new Prisma.Decimal(
          "0"
        ),

      cstIpi: null,

      codigoEnquadramentoIpi:
        "999",

      aliquotaIpi:
        new Prisma.Decimal(
          "0"
        ),

      ativo: true,
    };

    await prisma.produto.upsert({
      where: {
        empresaId_codigo: {
          empresaId,
          codigo,
        },
      },

      update: data,

      create: {
        empresaId,
        ...data,
      },
    });
  }

  console.log(
    `✔ ${produtosDemo.length} produtos`
  );

  /*
   * Transportadores
   */

  const transportadores: Array<{
    id: string;
  }> = [];

  for (
    let indice = 1;
    indice <=
    QUANTIDADE_DEMO;
    indice++
  ) {
    const pessoaFisica =
      indice <= 10;

    const tipoPessoa =
      pessoaFisica
        ? TipoPessoa.FISICA
        : TipoPessoa.JURIDICA;

    const cpfCnpj =
      pessoaFisica
        ? gerarCpf(
            3,
            indice
          )
        : gerarCnpj(
            4,
            indice
          );

    const nome =
      pessoaFisica
        ? `Transportador Autônomo ${String(
            indice
          ).padStart(2, "0")}`
        : `TRANSPORTADORA DEMONSTRAÇÃO ${String(
            indice
          ).padStart(2, "0")} LTDA`;

    const data = {
      tipoPessoa,

      nome,

      nomeFantasia:
        pessoaFisica
          ? null
          : `Transportadora Demo ${indice}`,

      cpfCnpj,

      inscricaoEstadual:
        pessoaFisica
          ? null
          : "ISENTO",

      inscricaoMunicipal:
        null,

      rntrc:
        String(
          10000000 +
            indice
        ),

      email:
        `transportador${String(
          indice
        ).padStart(
          2,
          "0"
        )}@faturistico.local`,

      telefone:
        `6997${String(
          indice
        ).padStart(7, "0")}`,

      cep:
        String(
          76802000 +
            indice
        ),

      logradouro:
        `Avenida dos Transportes ${indice}`,

      numero:
        String(
          200 + indice
        ),

      complemento: null,

      bairro:
        "Distrito Industrial",

      municipio:
        "Porto Velho",

      codigoMunicipio:
        "1100205",

      uf: "RO",

      codigoPais:
        "1058",

      pais: "BRASIL",

      ativo: true,
    };

    const transportador =
      await prisma.transportador.upsert({
        where: {
          empresaId_cpfCnpj: {
            empresaId,
            cpfCnpj,
          },
        },

        update: data,

        create: {
          empresaId,
          ...data,
        },

        select: {
          id: true,
        },
      });

    transportadores.push(
      transportador
    );
  }

  console.log(
    `✔ ${transportadores.length} transportadores`
  );

  /*
   * Veículos
   */

  const tiposVeiculo: TipoVeiculo[] =
    [
      TipoVeiculo.CAVALO_MECANICO,
      TipoVeiculo.TOCO,
      TipoVeiculo.TRUCK,
      TipoVeiculo.CARRETA,
      TipoVeiculo.REBOQUE,
      TipoVeiculo.SEMIRREBOQUE,
      TipoVeiculo.UTILITARIO,
      TipoVeiculo.OUTRO,
    ];

  const modelosVeiculo = [
    "Volvo FH 540",
    "Scania R 450",
    "Mercedes-Benz Atego",
    "Volkswagen Delivery",
    "Iveco Daily",
    "DAF XF 530",
    "Volvo VM 330",
    "Scania P 320",
  ];

  for (
    let indice = 1;
    indice <=
    QUANTIDADE_DEMO;
    indice++
  ) {
    const placa =
      gerarPlaca(indice);

    const renavam =
      String(
        90000000000 +
          indice
      );

    const tipo =
      tiposVeiculo[
        (indice - 1) %
          tiposVeiculo.length
      ];

    const data = {
      transportadorId:
        transportadores[
          (indice - 1) %
            transportadores.length
        ].id,

      placa,

      renavam,

      ufLicenciamento:
        "RO",

      tipo,

      marcaModelo:
        modelosVeiculo[
          (indice - 1) %
            modelosVeiculo.length
        ],

      anoFabricacao:
        2018 +
        (indice % 7),

      anoModelo:
        2019 +
        (indice % 7),

      taraKg:
        new Prisma.Decimal(
          String(
            6000 +
              indice * 100
          )
        ),

      capacidadeKg:
        new Prisma.Decimal(
          String(
            12000 +
              indice * 500
          )
        ),

      capacidadeM3:
        new Prisma.Decimal(
          String(
            30 +
              indice
          )
        ),

      ativo: true,
    };

    await prisma.veiculo.upsert({
      where: {
        empresaId_placa: {
          empresaId,
          placa,
        },
      },

      update: data,

      create: {
        empresaId,
        ...data,
      },
    });
  }

  console.log(
    `✔ ${QUANTIDADE_DEMO} veículos`
  );

  /*
   * Motoristas
   */

  const categoriasCnh = [
    "B",
    "C",
    "D",
    "E",
  ];

  for (
    let indice = 1;
    indice <=
    QUANTIDADE_DEMO;
    indice++
  ) {
    const cpf =
      gerarCpf(
        5,
        indice
      );

    const numeroCnh =
      String(
        80000000000 +
          indice
      );

    const data = {
      transportadorId:
        transportadores[
          (indice - 1) %
            transportadores.length
        ].id,

      nome:
        `Motorista Demonstração ${String(
          indice
        ).padStart(2, "0")}`,

      cpf,

      numeroCnh,

      categoriaCnh:
        categoriasCnh[
          (indice - 1) %
            categoriasCnh.length
        ],

      validadeCnh:
        new Date(
          Date.UTC(
            2027 +
              (indice % 4),

            indice % 12,

            15
          )
        ),

      telefone:
        `6996${String(
          indice
        ).padStart(7, "0")}`,

      ativo: true,
    };

    await prisma.motorista.upsert({
      where: {
        empresaId_cpf: {
          empresaId,
          cpf,
        },
      },

      update: data,

      create: {
        empresaId,
        ...data,
      },
    });
  }

  console.log(
    `✔ ${QUANTIDADE_DEMO} motoristas`
  );

  /*
   * Validação das quantidades
   */

  const [
    totalClientes,
    totalProdutos,
    totalNaturezas,
    totalTransportadores,
    totalVeiculos,
    totalMotoristas,
  ] = await Promise.all([
    prisma.cliente.count({
      where: {
        empresaId,
      },
    }),

    prisma.produto.count({
      where: {
        empresaId,
      },
    }),

    prisma.naturezaOperacao.count({
      where: {
        empresaId,
      },
    }),

    prisma.transportador.count({
      where: {
        empresaId,
      },
    }),

    prisma.veiculo.count({
      where: {
        empresaId,
      },
    }),

    prisma.motorista.count({
      where: {
        empresaId,
      },
    }),
  ]);

  const contagens = {
    Clientes:
      totalClientes,

    Produtos:
      totalProdutos,

    Naturezas:
      totalNaturezas,

    Transportadores:
      totalTransportadores,

    Veículos:
      totalVeiculos,

    Motoristas:
      totalMotoristas,
  };

  console.log("");
  console.log(
    "Resumo dos cadastros:"
  );

  for (
    const [
      nome,
      quantidade,
    ] of Object.entries(
      contagens
    )
  ) {
    console.log(
      `- ${nome}: ${quantidade}`
    );

    if (
      quantidade <
      QUANTIDADE_DEMO
    ) {
      throw new Error(
        `${nome} possui somente ${quantidade} registros.`
      );
    }
  }
}


async function main() {
  console.log(
    "Iniciando seed do Faturístico..."
  );

  const {
    owner,
    empresa,
  } = await seedBase();

  if (
    process.env.SEED_DEMO !== "false"
  ) {
    await seedDemo(empresa.id);
  }

  console.log("");
  console.log("Seed concluído.");
  console.log(`Login: ${owner.email}`);
  console.log(
    `Senha: ${
      process.env.SEED_OWNER_PASSWORD ||
      "123456"
    }`
  );
  console.log(
    `Empresa: ${empresa.razaoSocial}`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(
      "Erro durante o seed:",
      error
    );

    await prisma.$disconnect();
    process.exit(1);
  });
