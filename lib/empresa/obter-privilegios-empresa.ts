import type {
  PrivilegioEmpresa,
} from "@prisma/client";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import {
  privilegiosVisualizador,
  todosPrivilegiosEmpresa,
} from "@/lib/usuarios/privilegios-empresa";

export type PermissoesEmpresaAtual = {
  empresaAtiva: boolean;

  somenteLeitura: boolean;

  permissao:
    | "OWNER"
    | "ADMIN"
    | "PERSONALIZADO"
    | "VISUALIZADOR";

  privilegios:
    PrivilegioEmpresa[];
};

export async function obterPrivilegiosEmpresa(
  empresaId: string
): Promise<PermissoesEmpresaAtual> {
  const contexto =
    await validarAcessoEmpresa(
      empresaId
    );

  const {
    usuario,
    empresa,
    acesso,
  } = contexto;

  /*
   * Empresa inativa:
   *
   * somente o OWNER chega até aqui,
   * mas recebe apenas privilégios de
   * consulta.
   */

  if (!empresa.ativo) {
    return {
      empresaAtiva: false,

      somenteLeitura: true,

      permissao: "OWNER",

      privilegios:
        Array.from(
          privilegiosVisualizador
        ),
    };
  }

  /*
   * OWNER possui acesso total em
   * empresas ativas.
   */

  if (
    usuario.role === "OWNER"
  ) {
    return {
      empresaAtiva: true,

      somenteLeitura: false,

      permissao: "OWNER",

      privilegios: [
        ...todosPrivilegiosEmpresa,
      ],
    };
  }

  if (
    !acesso ||
    !acesso.ativo
  ) {
    throw new Error(
      "ACESSO_EMPRESA_NAO_AUTORIZADO"
    );
  }

  /*
   * ADMIN possui acesso total somente
   * quando o vínculo da empresa também
   * for ADMIN.
   */

  if (
    usuario.role === "ADMIN" &&
    acesso.permissao === "ADMIN"
  ) {
    return {
      empresaAtiva: true,

      somenteLeitura: false,

      permissao: "ADMIN",

      privilegios: [
        ...todosPrivilegiosEmpresa,
      ],
    };
  }

  /*
   * Visualizador recebe apenas consulta.
   */

  if (
    acesso.permissao ===
    "VISUALIZADOR"
  ) {
    return {
      empresaAtiva: true,

      somenteLeitura: true,

      permissao:
        "VISUALIZADOR",

      privilegios:
        Array.from(
          privilegiosVisualizador
        ),
    };
  }

  /*
   * Personalizado recebe somente os
   * privilégios cadastrados no vínculo.
   */

  if (
    acesso.permissao ===
    "PERSONALIZADO"
  ) {
    return {
      empresaAtiva: true,

      somenteLeitura: false,

      permissao:
        "PERSONALIZADO",

      privilegios:
        acesso.privilegios.map(
          (item) =>
            item.privilegio
        ),
    };
  }

  throw new Error(
    "PERMISSAO_EMPRESA_INVALIDA"
  );
}

export function possuiPrivilegio(
  privilegios:
    PrivilegioEmpresa[],

  privilegio:
    PrivilegioEmpresa
) {
  return privilegios.includes(
    privilegio
  );
}