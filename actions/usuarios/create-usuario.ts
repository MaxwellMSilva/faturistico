"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  type PrivilegioEmpresa,
} from "@prisma/client";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

import {
  privilegioEmpresaValido,
  resolverPrivilegiosEmpresa,
  validarDependenciasPrivilegiosEmpresa,
} from "@/lib/usuarios/privilegios-empresa";

type RoleNovoUsuario =
  | "ADMIN"
  | "USUARIO";

type PermissaoNovoUsuario =
  | "ADMIN"
  | "PERSONALIZADO"
  | "VISUALIZADOR";

type AcessoEmpresa = {
  empresaId: string;

  permissao:
    PermissaoNovoUsuario;

  privilegios?: string[];
};

type CreateUsuarioData = {
  nome: string;
  email: string;
  senha: string;

  role: RoleNovoUsuario;

  acessos: AcessoEmpresa[];
};

type CreateUsuarioResult =
  | {
      success: true;
      usuarioId: string;
    }
  | {
      success: false;
      message: string;
    };

function emailValido(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function createUsuario(
  data: CreateUsuarioData
): Promise<CreateUsuarioResult> {
  let gestor: Awaited<
    ReturnType<
      typeof validarGestaoUsuarios
    >
  >;

  try {
    gestor =
      await validarGestaoUsuarios();
  } catch {
    return {
      success: false,
      message:
        "Você não possui permissão para cadastrar usuários.",
    };
  }

  const nome =
    data.nome.trim();

  const email =
    data.email
      .trim()
      .toLowerCase();

  const senha =
    data.senha;

  if (!nome) {
    return {
      success: false,
      message:
        "Informe o nome do usuário.",
    };
  }

  if (!emailValido(email)) {
    return {
      success: false,
      message:
        "Informe um e-mail válido.",
    };
  }

  if (senha.length < 6) {
    return {
      success: false,
      message:
        "A senha deve possuir pelo menos 6 caracteres.",
    };
  }

  if (
    data.role !== "ADMIN" &&
    data.role !== "USUARIO"
  ) {
    return {
      success: false,
      message:
        "Informe uma função válida.",
    };
  }

  /*
   * Somente o OWNER pode criar ADMIN.
   */

  if (
    gestor.role === "ADMIN" &&
    data.role !== "USUARIO"
  ) {
    return {
      success: false,
      message:
        "Administradores não podem cadastrar outros administradores.",
    };
  }

  if (
    !Array.isArray(
      data.acessos
    ) ||
    data.acessos.length === 0
  ) {
    return {
      success: false,
      message:
        "Selecione pelo menos uma empresa.",
    };
  }

  /*
   * Remove empresas repetidas.
   */

  const acessosUnicos =
    Array.from(
      new Map(
        data.acessos.map(
          (acesso) => [
            acesso.empresaId,
            acesso,
          ]
        )
      ).values()
    );

  if (
    acessosUnicos.some(
      (acesso) =>
        !acesso.empresaId
    )
  ) {
    return {
      success: false,
      message:
        "Existe uma empresa inválida na seleção.",
    };
  }

  /*
   * Valida permissões conforme o papel
   * global do novo usuário.
   */

  if (data.role === "ADMIN") {
    const acessoInvalido =
      acessosUnicos.some(
        (acesso) =>
          acesso.permissao !==
          "ADMIN"
      );

    if (acessoInvalido) {
      return {
        success: false,
        message:
          "Administradores devem possuir permissão ADMIN nas empresas selecionadas.",
      };
    }
  }

  if (data.role === "USUARIO") {
    const permissoesPermitidas =
      new Set([
        "PERSONALIZADO",
        "VISUALIZADOR",
      ]);

    const acessoInvalido =
      acessosUnicos.some(
        (acesso) =>
          !permissoesPermitidas.has(
            acesso.permissao
          )
      );

    if (acessoInvalido) {
      return {
        success: false,
        message:
          "Usuários comuns devem utilizar acesso personalizado ou visualizador.",
      };
    }
  }

  /*
   * Monta e valida os privilégios
   * personalizados.
   */

  const acessosPreparados:
    Array<{
      empresaId: string;

      permissao:
        PermissaoNovoUsuario;

      privilegios:
        PrivilegioEmpresa[];
    }> = [];

  for (
    const acesso of
    acessosUnicos
  ) {
    if (
      acesso.permissao !==
      "PERSONALIZADO"
    ) {
      acessosPreparados.push({
        empresaId:
          acesso.empresaId,

        permissao:
          acesso.permissao,

        privilegios: [],
      });

      continue;
    }

    const privilegiosRecebidos =
      Array.from(
        new Set(
          acesso.privilegios ??
            []
        )
      );

    const privilegioInvalido =
      privilegiosRecebidos.find(
        (privilegio) =>
          !privilegioEmpresaValido(
            privilegio
          )
      );

    if (privilegioInvalido) {
      return {
        success: false,
        message:
          "Existe um privilégio inválido na seleção.",
      };
    }

    const privilegiosValidos =
      privilegiosRecebidos as PrivilegioEmpresa[];

    if (
      !validarDependenciasPrivilegiosEmpresa(
        privilegiosValidos
      )
    ) {
      return {
        success: false,
        message:
          "Para marcar aÃ§Ãµes de um mÃ³dulo, marque tambÃ©m a permissÃ£o de visualizar.",
      };
    }

    const privilegiosResolvidos =
      resolverPrivilegiosEmpresa(
        privilegiosValidos
      );

    if (
      privilegiosResolvidos.length ===
      0
    ) {
      return {
        success: false,
        message:
          "Selecione pelo menos um privilégio para o acesso personalizado.",
      };
    }

    acessosPreparados.push({
      empresaId:
        acesso.empresaId,

      permissao:
        "PERSONALIZADO",

      privilegios:
        privilegiosResolvidos,
    });
  }

  const empresasSelecionadas =
    acessosPreparados.map(
      (acesso) =>
        acesso.empresaId
    );

  /*
   * Verifica se as empresas estão ativas
   * e se o gestor pode administrá-las.
   */

  let empresasPermitidas:
    string[];

  if (gestor.role === "OWNER") {
    const empresas =
      await prisma.empresa.findMany({
        where: {
          id: {
            in:
              empresasSelecionadas,
          },

          ativo: true,
        },

        select: {
          id: true,
        },
      });

    empresasPermitidas =
      empresas.map(
        (empresa) =>
          empresa.id
      );
  } else {
    const acessosGestor =
      await prisma.usuarioEmpresa.findMany({
        where: {
          usuarioId:
            gestor.id,

          empresaId: {
            in:
              empresasSelecionadas,
          },

          ativo: true,

          permissao: "ADMIN",

          empresa: {
            ativo: true,
          },
        },

        select: {
          empresaId: true,
        },
      });

    empresasPermitidas =
      acessosGestor.map(
        (acesso) =>
          acesso.empresaId
      );
  }

  const empresasPermitidasSet =
    new Set(
      empresasPermitidas
    );

  const empresaNaoPermitida =
    empresasSelecionadas.some(
      (empresaId) =>
        !empresasPermitidasSet.has(
          empresaId
        )
    );

  if (empresaNaoPermitida) {
    return {
      success: false,
      message:
        "Você não possui permissão para vincular o usuário a uma das empresas selecionadas.",
    };
  }

  const usuarioExistente =
    await prisma.usuario.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
      },
    });

  if (usuarioExistente) {
    return {
      success: false,
      message:
        "Já existe um usuário cadastrado com este e-mail.",
    };
  }

  const senhaHash =
    await hash(
      senha,
      10
    );

  try {
    const usuario =
      await prisma.usuario.create({
        data: {
          nome,
          email,
          senhaHash,

          role:
            data.role,

          ativo: true,

          empresas: {
            create:
              acessosPreparados.map(
                (acesso) => ({
                  empresaId:
                    acesso.empresaId,

                  permissao:
                    acesso.permissao,

                  ativo: true,

                  privilegios:
                    acesso.permissao ===
                      "PERSONALIZADO"
                      ? {
                          create:
                            acesso.privilegios.map(
                              (
                                privilegio
                              ) => ({
                                privilegio,
                              })
                            ),
                        }
                      : undefined,
                })
              ),
          },
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      "/usuarios"
    );

    return {
      success: true,
      usuarioId:
        usuario.id,
    };
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message:
          "Já existe um usuário cadastrado com este e-mail.",
      };
    }

    console.error(
      "Erro ao cadastrar usuário:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o usuário.",
    };
  }
}
