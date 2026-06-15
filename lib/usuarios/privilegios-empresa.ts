import {
  PrivilegioEmpresa,
} from "@prisma/client";

export type ItemPrivilegioEmpresa = {
  valor: PrivilegioEmpresa;
  titulo: string;
  descricao: string;
};

export type GrupoPrivilegioEmpresa = {
  id: string;
  titulo: string;
  descricao: string;

  privilegios:
    ItemPrivilegioEmpresa[];
};

/*
 * Árvore exibida nos formulários de
 * criação e edição de usuários.
 */

export const arvorePrivilegiosEmpresa: GrupoPrivilegioEmpresa[] =
  [
    {
      id: "dashboard",

      titulo: "Dashboard",

      descricao:
        "Acesso à visão geral da empresa.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.DASHBOARD_VISUALIZAR,

          titulo:
            "Visualizar dashboard",

          descricao:
            "Permite consultar os indicadores e informações gerais da empresa.",
        },
      ],
    },

    {
      id: "clientes",

      titulo: "Clientes",

      descricao:
        "Controle do cadastro de clientes.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.CLIENTES_VISUALIZAR,

          titulo:
            "Visualizar clientes",

          descricao:
            "Permite consultar a lista e os dados dos clientes.",
        },

        {
          valor:
            PrivilegioEmpresa.CLIENTES_CRIAR,

          titulo:
            "Cadastrar clientes",

          descricao:
            "Permite adicionar novos clientes.",
        },

        {
          valor:
            PrivilegioEmpresa.CLIENTES_EDITAR,

          titulo:
            "Editar clientes",

          descricao:
            "Permite alterar os dados dos clientes.",
        },

        {
          valor:
            PrivilegioEmpresa.CLIENTES_EXCLUIR,

          titulo:
            "Excluir clientes",

          descricao:
            "Permite excluir clientes quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "produtos",

      titulo: "Produtos",

      descricao:
        "Controle do cadastro de produtos.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.PRODUTOS_VISUALIZAR,

          titulo:
            "Visualizar produtos",

          descricao:
            "Permite consultar os produtos cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.PRODUTOS_CRIAR,

          titulo:
            "Cadastrar produtos",

          descricao:
            "Permite cadastrar novos produtos.",
        },

        {
          valor:
            PrivilegioEmpresa.PRODUTOS_EDITAR,

          titulo:
            "Editar produtos",

          descricao:
            "Permite alterar produtos cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.PRODUTOS_EXCLUIR,

          titulo:
            "Excluir produtos",

          descricao:
            "Permite excluir produtos quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "naturezas-operacao",

      titulo:
        "Naturezas de operação",

      descricao:
        "Controle das operações fiscais utilizadas nas notas.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.NATUREZAS_VISUALIZAR,

          titulo:
            "Visualizar naturezas",

          descricao:
            "Permite consultar as naturezas de operação.",
        },

        {
          valor:
            PrivilegioEmpresa.NATUREZAS_CRIAR,

          titulo:
            "Cadastrar naturezas",

          descricao:
            "Permite cadastrar novas naturezas de operação.",
        },

        {
          valor:
            PrivilegioEmpresa.NATUREZAS_EDITAR,

          titulo:
            "Editar naturezas",

          descricao:
            "Permite alterar naturezas de operação.",
        },

        {
          valor:
            PrivilegioEmpresa.NATUREZAS_EXCLUIR,

          titulo:
            "Excluir naturezas",

          descricao:
            "Permite excluir naturezas quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "transportadores",

      titulo: "Transportadores",

      descricao:
        "Controle dos transportadores da empresa.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,

          titulo:
            "Visualizar transportadores",

          descricao:
            "Permite consultar transportadores cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.TRANSPORTADORES_CRIAR,

          titulo:
            "Cadastrar transportadores",

          descricao:
            "Permite cadastrar novos transportadores.",
        },

        {
          valor:
            PrivilegioEmpresa.TRANSPORTADORES_EDITAR,

          titulo:
            "Editar transportadores",

          descricao:
            "Permite alterar os dados dos transportadores.",
        },

        {
          valor:
            PrivilegioEmpresa.TRANSPORTADORES_EXCLUIR,

          titulo:
            "Excluir transportadores",

          descricao:
            "Permite excluir transportadores quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "veiculos",

      titulo: "Veículos",

      descricao:
        "Controle de placas e veículos utilizados no transporte.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.VEICULOS_VISUALIZAR,

          titulo:
            "Visualizar veículos",

          descricao:
            "Permite consultar veículos cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.VEICULOS_CRIAR,

          titulo:
            "Cadastrar veículos",

          descricao:
            "Permite cadastrar novos veículos.",
        },

        {
          valor:
            PrivilegioEmpresa.VEICULOS_EDITAR,

          titulo:
            "Editar veículos",

          descricao:
            "Permite alterar veículos cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.VEICULOS_EXCLUIR,

          titulo:
            "Excluir veículos",

          descricao:
            "Permite excluir veículos quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "motoristas",

      titulo: "Motoristas",

      descricao:
        "Controle dos motoristas vinculados à empresa.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,

          titulo:
            "Visualizar motoristas",

          descricao:
            "Permite consultar motoristas cadastrados.",
        },

        {
          valor:
            PrivilegioEmpresa.MOTORISTAS_CRIAR,

          titulo:
            "Cadastrar motoristas",

          descricao:
            "Permite cadastrar novos motoristas.",
        },

        {
          valor:
            PrivilegioEmpresa.MOTORISTAS_EDITAR,

          titulo:
            "Editar motoristas",

          descricao:
            "Permite alterar os dados dos motoristas.",
        },

        {
          valor:
            PrivilegioEmpresa.MOTORISTAS_EXCLUIR,

          titulo:
            "Excluir motoristas",

          descricao:
            "Permite excluir motoristas quando não houver impedimentos.",
        },
      ],
    },

    {
      id: "nfe",

      titulo: "NF-e",

      descricao:
        "Controle da criação, validação e emissão das notas fiscais.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.NFE_VISUALIZAR,

          titulo:
            "Visualizar NF-e",

          descricao:
            "Permite consultar notas fiscais e seus detalhes.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_CRIAR,

          titulo:
            "Criar NF-e",

          descricao:
            "Permite criar novos rascunhos de NF-e.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_EDITAR,

          titulo:
            "Editar NF-e",

          descricao:
            "Permite alterar notas fiscais em situação editável.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_EXCLUIR_RASCUNHO,

          titulo:
            "Excluir rascunhos",

          descricao:
            "Permite excluir NF-e que ainda estejam como rascunho.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_VALIDAR,

          titulo:
            "Validar NF-e",

          descricao:
            "Permite executar a validação fiscal da nota.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_EMITIR,

          titulo:
            "Emitir NF-e",

          descricao:
            "Permite transmitir a NF-e para autorização.",
        },

        {
          valor:
            PrivilegioEmpresa.NFE_CANCELAR,

          titulo:
            "Cancelar NF-e",

          descricao:
            "Permite solicitar o cancelamento de uma NF-e autorizada.",
        },
      ],
    },

    {
      id: "configuracoes",

      titulo:
        "Configurações fiscais",

      descricao:
        "Acesso ao ambiente, regime tributário, séries e integrações.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,

          titulo:
            "Visualizar configurações",

          descricao:
            "Permite consultar as configurações fiscais da empresa.",
        },

        {
          valor:
            PrivilegioEmpresa.CONFIGURACOES_EDITAR,

          titulo:
            "Editar configurações",

          descricao:
            "Permite alterar as configurações fiscais da empresa.",
        },
      ],
    },

    {
      id: "certificado",

      titulo:
        "Certificado digital",

      descricao:
        "Controle do certificado A1 utilizado na emissão fiscal.",

      privilegios: [
        {
          valor:
            PrivilegioEmpresa.CERTIFICADO_VISUALIZAR,

          titulo:
            "Visualizar certificado",

          descricao:
            "Permite consultar os dados e a validade do certificado.",
        },

        {
          valor:
            PrivilegioEmpresa.CERTIFICADO_SUBSTITUIR,

          titulo:
            "Substituir certificado",

          descricao:
            "Permite enviar ou substituir o certificado digital da empresa.",
        },
      ],
    },
  ];

/*
 * O perfil VISUALIZADOR não precisa
 * possuir registros na tabela de
 * privilégios.
 *
 * Ele recebe automaticamente somente
 * os privilégios de consulta abaixo.
 */

export const privilegiosVisualizador =
  new Set<PrivilegioEmpresa>([
    PrivilegioEmpresa.DASHBOARD_VISUALIZAR,

    PrivilegioEmpresa.CLIENTES_VISUALIZAR,

    PrivilegioEmpresa.PRODUTOS_VISUALIZAR,

    PrivilegioEmpresa.NATUREZAS_VISUALIZAR,

    PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,

    PrivilegioEmpresa.VEICULOS_VISUALIZAR,

    PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,

    PrivilegioEmpresa.NFE_VISUALIZAR,

    PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,

    PrivilegioEmpresa.CERTIFICADO_VISUALIZAR,
  ]);

/*
 * Todos os privilégios disponíveis.
 *
 * Será utilizado para validação dos
 * dados recebidos dos formulários.
 */

export const todosPrivilegiosEmpresa =
  arvorePrivilegiosEmpresa.flatMap(
    (grupo) =>
      grupo.privilegios.map(
        (item) => item.valor
      )
  );

/*
 * Dependências automáticas.
 *
 * Exemplo:
 * para editar um cliente, o usuário
 * também precisa conseguir visualizar
 * o módulo de clientes.
 */

export const dependenciasPrivilegios: Partial<
  Record<
    PrivilegioEmpresa,
    PrivilegioEmpresa[]
  >
> = {
  [PrivilegioEmpresa.CLIENTES_CRIAR]: [
    PrivilegioEmpresa.CLIENTES_VISUALIZAR,
  ],

  [PrivilegioEmpresa.CLIENTES_EDITAR]: [
    PrivilegioEmpresa.CLIENTES_VISUALIZAR,
  ],

  [PrivilegioEmpresa.CLIENTES_EXCLUIR]: [
    PrivilegioEmpresa.CLIENTES_VISUALIZAR,
  ],

  [PrivilegioEmpresa.PRODUTOS_CRIAR]: [
    PrivilegioEmpresa.PRODUTOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.PRODUTOS_EDITAR]: [
    PrivilegioEmpresa.PRODUTOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.PRODUTOS_EXCLUIR]: [
    PrivilegioEmpresa.PRODUTOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NATUREZAS_CRIAR]: [
    PrivilegioEmpresa.NATUREZAS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NATUREZAS_EDITAR]: [
    PrivilegioEmpresa.NATUREZAS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NATUREZAS_EXCLUIR]: [
    PrivilegioEmpresa.NATUREZAS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.TRANSPORTADORES_CRIAR]:
    [
      PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,
    ],

  [PrivilegioEmpresa.TRANSPORTADORES_EDITAR]:
    [
      PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,
    ],

  [PrivilegioEmpresa.TRANSPORTADORES_EXCLUIR]:
    [
      PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,
    ],

  [PrivilegioEmpresa.VEICULOS_CRIAR]: [
    PrivilegioEmpresa.VEICULOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.VEICULOS_EDITAR]: [
    PrivilegioEmpresa.VEICULOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.VEICULOS_EXCLUIR]: [
    PrivilegioEmpresa.VEICULOS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.MOTORISTAS_CRIAR]: [
    PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.MOTORISTAS_EDITAR]: [
    PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,
  ],

  [PrivilegioEmpresa.MOTORISTAS_EXCLUIR]:
    [
      PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,
    ],

  [PrivilegioEmpresa.NFE_CRIAR]: [
    PrivilegioEmpresa.NFE_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NFE_EDITAR]: [
    PrivilegioEmpresa.NFE_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NFE_EXCLUIR_RASCUNHO]:
    [
      PrivilegioEmpresa.NFE_VISUALIZAR,
    ],

  [PrivilegioEmpresa.NFE_VALIDAR]: [
    PrivilegioEmpresa.NFE_VISUALIZAR,
  ],

  [PrivilegioEmpresa.NFE_EMITIR]: [
    PrivilegioEmpresa.NFE_VISUALIZAR,
    PrivilegioEmpresa.NFE_VALIDAR,
  ],

  [PrivilegioEmpresa.NFE_CANCELAR]: [
    PrivilegioEmpresa.NFE_VISUALIZAR,
  ],

  [PrivilegioEmpresa.CONFIGURACOES_EDITAR]:
    [
      PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,
    ],

  [PrivilegioEmpresa.CERTIFICADO_SUBSTITUIR]:
    [
      PrivilegioEmpresa.CERTIFICADO_VISUALIZAR,
    ],
};

/*
 * Acrescenta automaticamente as
 * dependências de cada privilégio.
 */

export function resolverPrivilegiosEmpresa(
  privilegios:
    PrivilegioEmpresa[]
) {
  const resultado =
    new Set<PrivilegioEmpresa>();

  function adicionar(
    privilegio:
      PrivilegioEmpresa
  ) {
    if (
      resultado.has(
        privilegio
      )
    ) {
      return;
    }

    resultado.add(
      privilegio
    );

    const dependencias =
      dependenciasPrivilegios[
        privilegio
      ] ?? [];

    dependencias.forEach(
      adicionar
    );
  }

  privilegios.forEach(
    adicionar
  );

  return Array.from(
    resultado
  );
}

/*
 * Verifica se o valor recebido pertence
 * ao enum oficial do Prisma.
 */

export function privilegioEmpresaValido(
  valor: string
): valor is PrivilegioEmpresa {
  return (
    todosPrivilegiosEmpresa as string[]
  ).includes(valor);
}