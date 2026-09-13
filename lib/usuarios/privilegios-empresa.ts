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
  privilegios: ItemPrivilegioEmpresa[];
};

function item(
  valor: PrivilegioEmpresa,
  titulo: string,
  descricao: string
): ItemPrivilegioEmpresa {
  return {
    valor,
    titulo,
    descricao,
  };
}

const P = PrivilegioEmpresa;

/*
 * Árvore exibida nos formulários de criação e edição de usuários.
 */
export const arvorePrivilegiosEmpresa: GrupoPrivilegioEmpresa[] = [
  {
    id: "dashboard",
    titulo: "Dashboard",
    descricao:
      "Acesso à visão geral da empresa.",
    privilegios: [
      item(
        P.DASHBOARD_VISUALIZAR,
        "Visualizar dashboard",
        "Permite consultar os indicadores e informações gerais da empresa."
      ),
    ],
  },
  {
    id: "clientes",
    titulo: "Clientes",
    descricao:
      "Controle do cadastro de clientes.",
    privilegios: [
      item(
        P.CLIENTES_VISUALIZAR,
        "Visualizar clientes",
        "Permite consultar a lista e os dados dos clientes."
      ),
      item(
        P.CLIENTES_CRIAR,
        "Cadastrar clientes",
        "Permite adicionar novos clientes."
      ),
      item(
        P.CLIENTES_EDITAR,
        "Editar clientes",
        "Permite alterar os dados dos clientes."
      ),
      item(
        P.CLIENTES_ALTERAR_STATUS,
        "Ativar e inativar clientes",
        "Permite ativar ou inativar clientes cadastrados."
      ),
      item(
        P.CLIENTES_EXCLUIR,
        "Excluir clientes",
        "Permite excluir clientes quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "produtos",
    titulo: "Produtos",
    descricao:
      "Controle do cadastro de produtos.",
    privilegios: [
      item(
        P.PRODUTOS_VISUALIZAR,
        "Visualizar produtos",
        "Permite consultar os produtos cadastrados."
      ),
      item(
        P.PRODUTOS_CRIAR,
        "Cadastrar produtos",
        "Permite cadastrar novos produtos."
      ),
      item(
        P.PRODUTOS_EDITAR,
        "Editar produtos",
        "Permite alterar produtos cadastrados."
      ),
      item(
        P.PRODUTOS_ALTERAR_STATUS,
        "Ativar e inativar produtos",
        "Permite ativar ou inativar produtos cadastrados."
      ),
      item(
        P.PRODUTOS_EXCLUIR,
        "Excluir produtos",
        "Permite excluir produtos quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "naturezas-operacao",
    titulo: "Naturezas de operação",
    descricao:
      "Controle das operações fiscais utilizadas nas notas.",
    privilegios: [
      item(
        P.NATUREZAS_VISUALIZAR,
        "Visualizar naturezas",
        "Permite consultar as naturezas de operação."
      ),
      item(
        P.NATUREZAS_CRIAR,
        "Cadastrar naturezas",
        "Permite cadastrar novas naturezas de operação."
      ),
      item(
        P.NATUREZAS_EDITAR,
        "Editar naturezas",
        "Permite alterar naturezas de operação."
      ),
      item(
        P.NATUREZAS_ALTERAR_STATUS,
        "Ativar e inativar naturezas",
        "Permite ativar ou inativar naturezas de operação."
      ),
      item(
        P.NATUREZAS_EXCLUIR,
        "Excluir naturezas",
        "Permite excluir naturezas quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "transportadores",
    titulo: "Transportadores",
    descricao:
      "Controle dos transportadores da empresa.",
    privilegios: [
      item(
        P.TRANSPORTADORES_VISUALIZAR,
        "Visualizar transportadores",
        "Permite consultar transportadores cadastrados."
      ),
      item(
        P.TRANSPORTADORES_CRIAR,
        "Cadastrar transportadores",
        "Permite cadastrar novos transportadores."
      ),
      item(
        P.TRANSPORTADORES_EDITAR,
        "Editar transportadores",
        "Permite alterar os dados dos transportadores."
      ),
      item(
        P.TRANSPORTADORES_ALTERAR_STATUS,
        "Ativar e inativar transportadores",
        "Permite ativar ou inativar transportadores cadastrados."
      ),
      item(
        P.TRANSPORTADORES_EXCLUIR,
        "Excluir transportadores",
        "Permite excluir transportadores quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "veiculos",
    titulo: "Veículos",
    descricao:
      "Controle de placas e veículos utilizados no transporte.",
    privilegios: [
      item(
        P.VEICULOS_VISUALIZAR,
        "Visualizar veículos",
        "Permite consultar veículos cadastrados."
      ),
      item(
        P.VEICULOS_CRIAR,
        "Cadastrar veículos",
        "Permite cadastrar novos veículos."
      ),
      item(
        P.VEICULOS_EDITAR,
        "Editar veículos",
        "Permite alterar veículos cadastrados."
      ),
      item(
        P.VEICULOS_ALTERAR_STATUS,
        "Ativar e inativar veículos",
        "Permite ativar ou inativar veículos cadastrados."
      ),
      item(
        P.VEICULOS_EXCLUIR,
        "Excluir veículos",
        "Permite excluir veículos quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "motoristas",
    titulo: "Motoristas",
    descricao:
      "Controle dos motoristas vinculados à empresa.",
    privilegios: [
      item(
        P.MOTORISTAS_VISUALIZAR,
        "Visualizar motoristas",
        "Permite consultar motoristas cadastrados."
      ),
      item(
        P.MOTORISTAS_CRIAR,
        "Cadastrar motoristas",
        "Permite cadastrar novos motoristas."
      ),
      item(
        P.MOTORISTAS_EDITAR,
        "Editar motoristas",
        "Permite alterar os dados dos motoristas."
      ),
      item(
        P.MOTORISTAS_ALTERAR_STATUS,
        "Ativar e inativar motoristas",
        "Permite ativar ou inativar motoristas cadastrados."
      ),
      item(
        P.MOTORISTAS_EXCLUIR,
        "Excluir motoristas",
        "Permite excluir motoristas quando não houver impedimentos."
      ),
    ],
  },
  {
    id: "nfe",
    titulo: "NF-e",
    descricao:
      "Controle da criação, validação e emissão das notas fiscais.",
    privilegios: [
      item(
        P.NFE_VISUALIZAR,
        "Visualizar NF-e",
        "Permite consultar notas fiscais e seus detalhes."
      ),
      item(
        P.NFE_CRIAR,
        "Criar NF-e",
        "Permite criar novos rascunhos de NF-e."
      ),
      item(
        P.NFE_EDITAR,
        "Editar NF-e",
        "Permite alterar notas fiscais em situação editável."
      ),
      item(
        P.NFE_EXCLUIR_RASCUNHO,
        "Excluir rascunhos",
        "Permite excluir NF-e que ainda estejam como rascunho."
      ),
      item(
        P.NFE_VALIDAR,
        "Validar NF-e",
        "Permite executar a validação fiscal da nota."
      ),
      item(
        P.NFE_EMITIR,
        "Emitir NF-e",
        "Permite transmitir a NF-e para autorização."
      ),
      item(
        P.NFE_CANCELAR,
        "Cancelar NF-e",
        "Permite solicitar o cancelamento de uma NF-e autorizada."
      ),
    ],
  },
  {
    id: "cte",
    titulo: "CT-e",
    descricao:
      "Controle da criação, validação, emissão e eventos do Conhecimento de Transporte Eletrônico.",
    privilegios: [
      item(
        P.CTE_VISUALIZAR,
        "Visualizar CT-e",
        "Permite consultar CT-e, detalhes, XML e DACTE."
      ),
      item(
        P.CTE_CRIAR,
        "Criar CT-e",
        "Permite criar novos rascunhos de CT-e."
      ),
      item(
        P.CTE_EDITAR,
        "Editar CT-e",
        "Permite alterar CT-e em situação editável."
      ),
      item(
        P.CTE_EXCLUIR_RASCUNHO,
        "Excluir rascunhos",
        "Permite excluir CT-e que ainda estejam como rascunho."
      ),
      item(
        P.CTE_VALIDAR,
        "Validar CT-e",
        "Permite validar os dados fiscais e gerar o XML 4.00."
      ),
      item(
        P.CTE_EMITIR,
        "Emitir CT-e",
        "Permite assinar e transmitir o CT-e para autorização da SEFAZ."
      ),
      item(
        P.CTE_CANCELAR,
        "Cancelar CT-e",
        "Permite solicitar o cancelamento de CT-e autorizado."
      ),
    ],
  },
  {
    id: "configuracoes",
    titulo: "Configurações fiscais",
    descricao:
      "Acesso ao ambiente, regime tributário, séries e integrações.",
    privilegios: [
      item(
        P.CONFIGURACOES_VISUALIZAR,
        "Visualizar configurações",
        "Permite consultar as configurações fiscais da empresa."
      ),
      item(
        P.CONFIGURACOES_EDITAR,
        "Editar configurações",
        "Permite alterar as configurações fiscais da empresa."
      ),
    ],
  },
  {
    id: "certificado",
    titulo: "Certificado digital",
    descricao:
      "Controle do certificado A1 utilizado na emissão fiscal.",
    privilegios: [
      item(
        P.CERTIFICADO_VISUALIZAR,
        "Visualizar certificado",
        "Permite consultar os dados e a validade do certificado."
      ),
      item(
        P.CERTIFICADO_SUBSTITUIR,
        "Substituir certificado",
        "Permite enviar ou substituir o certificado digital da empresa."
      ),
    ],
  },
];

/*
 * O perfil VISUALIZADOR recebe somente privilégios de consulta.
 */
export const privilegiosVisualizador =
  new Set<PrivilegioEmpresa>([
    P.DASHBOARD_VISUALIZAR,
    P.CLIENTES_VISUALIZAR,
    P.PRODUTOS_VISUALIZAR,
    P.NATUREZAS_VISUALIZAR,
    P.TRANSPORTADORES_VISUALIZAR,
    P.VEICULOS_VISUALIZAR,
    P.MOTORISTAS_VISUALIZAR,
    P.NFE_VISUALIZAR,
    P.CTE_VISUALIZAR,
    P.CONFIGURACOES_VISUALIZAR,
    P.CERTIFICADO_VISUALIZAR,
  ]);

export const todosPrivilegiosEmpresa =
  arvorePrivilegiosEmpresa.flatMap(
    (grupo) =>
      grupo.privilegios.map(
        (privilegio) =>
          privilegio.valor
      )
  );

export const dependenciasPrivilegios: Partial<
  Record<
    PrivilegioEmpresa,
    PrivilegioEmpresa[]
  >
> = {
  [P.CLIENTES_CRIAR]: [P.CLIENTES_VISUALIZAR],
  [P.CLIENTES_EDITAR]: [P.CLIENTES_VISUALIZAR],
  [P.CLIENTES_ALTERAR_STATUS]: [P.CLIENTES_VISUALIZAR],
  [P.CLIENTES_EXCLUIR]: [P.CLIENTES_VISUALIZAR],

  [P.PRODUTOS_CRIAR]: [P.PRODUTOS_VISUALIZAR],
  [P.PRODUTOS_EDITAR]: [P.PRODUTOS_VISUALIZAR],
  [P.PRODUTOS_ALTERAR_STATUS]: [P.PRODUTOS_VISUALIZAR],
  [P.PRODUTOS_EXCLUIR]: [P.PRODUTOS_VISUALIZAR],

  [P.NATUREZAS_CRIAR]: [P.NATUREZAS_VISUALIZAR],
  [P.NATUREZAS_EDITAR]: [P.NATUREZAS_VISUALIZAR],
  [P.NATUREZAS_ALTERAR_STATUS]: [P.NATUREZAS_VISUALIZAR],
  [P.NATUREZAS_EXCLUIR]: [P.NATUREZAS_VISUALIZAR],

  [P.TRANSPORTADORES_CRIAR]: [P.TRANSPORTADORES_VISUALIZAR],
  [P.TRANSPORTADORES_EDITAR]: [P.TRANSPORTADORES_VISUALIZAR],
  [P.TRANSPORTADORES_ALTERAR_STATUS]: [P.TRANSPORTADORES_VISUALIZAR],
  [P.TRANSPORTADORES_EXCLUIR]: [P.TRANSPORTADORES_VISUALIZAR],

  [P.VEICULOS_CRIAR]: [P.VEICULOS_VISUALIZAR],
  [P.VEICULOS_EDITAR]: [P.VEICULOS_VISUALIZAR],
  [P.VEICULOS_ALTERAR_STATUS]: [P.VEICULOS_VISUALIZAR],
  [P.VEICULOS_EXCLUIR]: [P.VEICULOS_VISUALIZAR],

  [P.MOTORISTAS_CRIAR]: [P.MOTORISTAS_VISUALIZAR],
  [P.MOTORISTAS_EDITAR]: [P.MOTORISTAS_VISUALIZAR],
  [P.MOTORISTAS_ALTERAR_STATUS]: [P.MOTORISTAS_VISUALIZAR],
  [P.MOTORISTAS_EXCLUIR]: [P.MOTORISTAS_VISUALIZAR],

  [P.NFE_CRIAR]: [P.NFE_VISUALIZAR],
  [P.NFE_EDITAR]: [P.NFE_VISUALIZAR],
  [P.NFE_EXCLUIR_RASCUNHO]: [P.NFE_VISUALIZAR],
  [P.NFE_VALIDAR]: [P.NFE_VISUALIZAR],
  [P.NFE_EMITIR]: [
    P.NFE_VISUALIZAR,
    P.NFE_VALIDAR,
  ],
  [P.NFE_CANCELAR]: [P.NFE_VISUALIZAR],

  [P.CTE_CRIAR]: [P.CTE_VISUALIZAR],
  [P.CTE_EDITAR]: [P.CTE_VISUALIZAR],
  [P.CTE_EXCLUIR_RASCUNHO]: [P.CTE_VISUALIZAR],
  [P.CTE_VALIDAR]: [P.CTE_VISUALIZAR],
  [P.CTE_EMITIR]: [
    P.CTE_VISUALIZAR,
    P.CTE_VALIDAR,
  ],
  [P.CTE_CANCELAR]: [P.CTE_VISUALIZAR],

  [P.CONFIGURACOES_EDITAR]: [
    P.CONFIGURACOES_VISUALIZAR,
  ],
  [P.CERTIFICADO_SUBSTITUIR]: [
    P.CERTIFICADO_VISUALIZAR,
  ],
};

export function resolverPrivilegiosEmpresa(
  privilegios: PrivilegioEmpresa[]
) {
  const resultado =
    new Set<PrivilegioEmpresa>();

  function adicionar(
    privilegio: PrivilegioEmpresa
  ) {
    if (resultado.has(privilegio)) {
      return;
    }

    resultado.add(privilegio);

    const dependencias =
      dependenciasPrivilegios[
        privilegio
      ] ?? [];

    dependencias.forEach(adicionar);
  }

  privilegios.forEach(adicionar);

  return Array.from(resultado);
}

export function validarDependenciasPrivilegiosEmpresa(
  privilegios: PrivilegioEmpresa[]
) {
  const selecionados =
    new Set(privilegios);

  return privilegios.every(
    (privilegio) => {
      const dependencias =
        dependenciasPrivilegios[
          privilegio
        ] ?? [];

      return dependencias.every(
        (dependencia) =>
          selecionados.has(
            dependencia
          )
      );
    }
  );
}

export function privilegioEmpresaValido(
  valor: string
): valor is PrivilegioEmpresa {
  return (
    todosPrivilegiosEmpresa as string[]
  ).includes(valor);
}
