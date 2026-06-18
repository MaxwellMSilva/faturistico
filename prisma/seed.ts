import "dotenv/config";

import { hash } from "bcryptjs";
import {
  Prisma,
  RoleUsuario,
  TipoItem,
} from "@prisma/client";

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

async function seedDemo(
  empresaId: string
) {
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

      for (const [nome, codigo] of modulos) {
        const existente =
          await db.modulo.findFirst({
            where: { codigo },
          });

        const data = {
          nome,
          codigo,
          valor:
            new Prisma.Decimal("50"),
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

  await opcional(
    "Configuração fiscal",
    async () => {
      if (!db.configuracaoFiscal) {
        return;
      }

      const existente =
        await db.configuracaoFiscal.findFirst({
          where: { empresaId },
        });

      const data = {
        ambiente: "HOMOLOGACAO",
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

  await opcional(
    "Natureza de operação",
    async () => {
      if (!db.naturezaOperacao) {
        return;
      }

      const existente =
        await db.naturezaOperacao.findFirst({
          where: {
            empresaId,
            cfop: "5102",
          },
        });

      if (!existente) {
        await db.naturezaOperacao.create({
          data: {
            empresaId,
            descricao:
              "Venda de mercadoria adquirida ou recebida de terceiros",
            cfop: "5102",
            finalidadeNfe: "NORMAL",
            consumidorFinal: false,
            contribuinteIcms: true,
            ativo: true,
          },
        });
      }
    }
  );

  await opcional(
    "Cliente de demonstração",
    async () => {
      const cpfCnpj =
        "11222333000181";

      await prisma.cliente.upsert({
        where: {
          empresaId_cpfCnpj: {
            empresaId,
            cpfCnpj,
          },
        },

        update: {
          nome:
            "CLIENTE DEMONSTRAÇÃO LTDA",
          ativo: true,
        },

        create: {
          empresaId,
          tipoPessoa: "JURIDICA",
          nome:
            "CLIENTE DEMONSTRAÇÃO LTDA",
          cpfCnpj,
          inscricaoEstadual: "ISENTO",
          email:
            "cliente@faturistico.local",
          telefone: "69988887777",
          cep: "76801000",
          logradouro: "Rua Dom Pedro II",
          numero: "500",
          bairro: "Centro",
          municipio: "Porto Velho",
          codigoMunicipio: "1100205",
          uf: "RO",
          ativo: true,
        },
      });
    }
  );

  await opcional(
    "Produto de demonstração",
    async () => {
      if (!db.produto) {
        return;
      }

      const existente =
        await db.produto.findFirst({
          where: {
            empresaId,
            codigo: "PROD-001",
          },
        });

      const data = {
        tipo: TipoItem.PRODUTO,
        codigo: "PROD-001",
        descricao: "Teclado USB ABNT2",
        unidade: "UN",
        valorUnitario:
          new Prisma.Decimal("89.90"),
        ncm: "84716052",
        cfopPadrao: "5102",
        origemMercadoria: 0,
        csosnIcms: "102",
        cstPis: "49",
        cstCofins: "49",
        ativo: true,
      };

      if (existente) {
        await db.produto.update({
          where: {
            id: existente.id,
          },
          data,
        });
      } else {
        await db.produto.create({
          data: {
            empresaId,
            ...data,
          },
        });
      }
    }
  );
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
