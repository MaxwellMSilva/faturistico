import type {
  PrivilegioEmpresa,
} from "@prisma/client";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import { privilegiosVisualizador } from "@/lib/usuarios/privilegios-empresa";

type Opcoes = {
  exigirEmpresaAtiva?: boolean;
};

type ContextoEmpresa =
  Awaited<
    ReturnType<
      typeof validarAcessoEmpresa
    >
  >;

export function contextoPossuiPrivilegioEmpresa(
  contexto: ContextoEmpresa,
  privilegio: PrivilegioEmpresa
) {
  const {
    usuario,
    acesso,
    somenteLeitura,
  } = contexto;

  if (somenteLeitura) {
    return false;
  }

  if (usuario.role === "OWNER") {
    return true;
  }

  if (!acesso || !acesso.ativo) {
    return false;
  }

  if (usuario.role === "ADMIN") {
    return acesso.permissao === "ADMIN";
  }

  if (
    acesso.permissao === "OWNER" ||
    acesso.permissao === "ADMIN"
  ) {
    return false;
  }

  if (
    acesso.permissao ===
    "VISUALIZADOR"
  ) {
    return privilegiosVisualizador.has(
      privilegio
    );
  }

  if (
    acesso.permissao ===
    "PERSONALIZADO"
  ) {
    return acesso.privilegios.some(
      (item) =>
        item.privilegio ===
        privilegio
    );
  }

  return false;
}

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

  if (
    exigirEmpresaAtiva &&
    !contexto.empresa.ativo
  ) {
    throw new Error(
      "EMPRESA_INATIVA_SOMENTE_LEITURA"
    );
  }

  if (
    contexto.usuario.role === "OWNER"
  ) {
    return contexto;
  }

  if (
    !contexto.acesso
  ) {
    throw new Error(
      "ACESSO_EMPRESA_NAO_AUTORIZADO"
    );
  }

  if (
    contexto.acesso &&
    !contexto.acesso.ativo
  ) {
    throw new Error(
      "ACESSO_EMPRESA_NAO_AUTORIZADO"
    );
  }

  if (
    contexto.acesso &&
    contexto.usuario.role ===
      "USUARIO" &&
    (contexto.acesso.permissao ===
      "OWNER" ||
      contexto.acesso.permissao ===
        "ADMIN")
  ) {
    throw new Error(
      "PERMISSAO_EMPRESA_INVALIDA"
    );
  }

  if (
    contextoPossuiPrivilegioEmpresa(
      contexto,
      privilegio
    )
  ) {
    return contexto;
  }

  throw new Error(
    "PRIVILEGIO_NAO_AUTORIZADO"
  );
}
