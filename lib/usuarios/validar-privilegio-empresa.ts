import type {
  PrivilegioEmpresa,
} from "@prisma/client";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import { privilegiosVisualizador } from "@/lib/usuarios/privilegios-empresa";

type Opcoes = {
  exigirEmpresaAtiva?: boolean;
};

export async function validarPrivilegioEmpresa(
  empresaId: string,
  privilegio: PrivilegioEmpresa,
  opcoes: Opcoes = {}
) {
  const {
    exigirEmpresaAtiva = true,
  } = opcoes;

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
   * Qualquer alteração em empresa
   * inativa deve ser bloqueada,
   * inclusive para o OWNER.
   */

  if (
    exigirEmpresaAtiva &&
    !empresa.ativo
  ) {
    throw new Error(
      "EMPRESA_INATIVA_SOMENTE_LEITURA"
    );
  }

  /*
   * OWNER global possui acesso total.
   */

  if (
    usuario.role === "OWNER"
  ) {
    return contexto;
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
   * ADMIN global precisa possuir
   * vínculo ADMIN nesta empresa.
   */

  if (
    usuario.role === "ADMIN"
  ) {
    if (
      acesso.permissao ===
      "ADMIN"
    ) {
      return contexto;
    }

    throw new Error(
      "PRIVILEGIO_NAO_AUTORIZADO"
    );
  }

  /*
   * USUARIO não pode possuir vínculo
   * OWNER ou ADMIN.
   */

  if (
    acesso.permissao ===
      "OWNER" ||
    acesso.permissao ===
      "ADMIN"
  ) {
    throw new Error(
      "PERMISSAO_EMPRESA_INVALIDA"
    );
  }

  /*
   * VISUALIZADOR recebe automaticamente
   * somente privilégios de consulta.
   */

  if (
    acesso.permissao ===
    "VISUALIZADOR"
  ) {
    if (
      privilegiosVisualizador.has(
        privilegio
      )
    ) {
      return contexto;
    }

    throw new Error(
      "PRIVILEGIO_NAO_AUTORIZADO"
    );
  }

  /*
   * PERSONALIZADO depende dos privilégios
   * gravados em UsuarioEmpresaPrivilegio.
   */

  if (
    acesso.permissao ===
    "PERSONALIZADO"
  ) {
    const possuiPrivilegio =
      acesso.privilegios.some(
        (item) =>
          item.privilegio ===
          privilegio
      );

    if (possuiPrivilegio) {
      return contexto;
    }

    throw new Error(
      "PRIVILEGIO_NAO_AUTORIZADO"
    );
  }

  throw new Error(
    "PRIVILEGIO_NAO_AUTORIZADO"
  );
}
