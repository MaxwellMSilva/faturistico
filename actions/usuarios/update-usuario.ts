"use server";

import { revalidatePath } from "next/cache";

import { hash } from "bcryptjs";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type PermissaoEmpresa =
  | "ADMIN"
  | "FATURAMENTO"
  | "OPERADOR"
  | "VISUALIZADOR";

type AcessoEmpresa = {
  empresaId: string;
  permissao: PermissaoEmpresa;
};

type UpdateUsuarioData = {
  usuarioId: string;

  nome: string;
  email: string;

  role: RoleUsuario;

  novaSenha?: string;

  acessos: AcessoEmpresa[];
};

type UpdateUsuarioResult =
  | {
      success: true;
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

export async function updateUsuario(
  data: UpdateUsuarioData
): Promise<UpdateUsuarioResult> {
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
        "Você não possui permissão para editar usuários.",
    };
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: data.usuarioId,
      },

      include: {
        empresas: {
          select: {
            empresaId: true,
            permissao: true,
            ativo: true,
          },
        },
      },
    });

  if (!usuario) {
    return {
      success: false,
      message:
        "Usuário não encontrado.",
    };
  }

  /*
   * O OWNER somente pode ser alterado
   * pelo próprio OWNER.
   */

  if (usuario.role === "OWNER") {
    if (
      gestor.role !== "OWNER" ||
      gestor.id !== usuario.id
    ) {
      return {
        success: false,
        message:
          "Somente o proprietário pode alterar os próprios dados.",
      };
    }

    if (data.role !== "OWNER") {
      return {
        success: false,
        message:
          "A função do proprietário não pode ser alterada.",
      };
    }
  }

  /*
   * ADMIN não pode editar OWNER
   * nem outro ADMIN.
   */

  if (
    gestor.role === "ADMIN" &&
    usuario.role !== "USUARIO"
  ) {
    return {
      success: false,
      message:
        "Administradores podem editar apenas usuários comuns.",
    };
  }

  /*
   * ADMIN não pode promover usuário
   * para ADMIN ou OWNER.
   */

  if (
    gestor.role === "ADMIN" &&
    data.role !== "USUARIO"
  ) {
    return {
      success: false,
      message:
        "Administradores não podem promover usuários.",
    };
  }

  /*
   * Ninguém pode criar outro OWNER
   * por meio da edição.
   */

  if (
    usuario.role !== "OWNER" &&
    data.role === "OWNER"
  ) {
    return {
      success: false,
      message:
        "Não é permitido cadastrar outro proprietário.",
    };
  }

  const nome =
    data.nome.trim();

  const email =
    data.email
      .trim()
      .toLowerCase();

  const novaSenha =
    data.novaSenha?.trim() ?? "";

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

  if (
    novaSenha &&
    novaSenha.length < 6
  ) {
    return {
      success: false,
      message:
        "A nova senha deve possuir pelo menos 6 caracteres.",
    };
  }

  const emailExistente =
    await prisma.usuario.findFirst({
      where: {
        email,

        id: {
          not: usuario.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (emailExistente) {
    return {
      success: false,
      message:
        "Já existe outro usuário cadastrado com este e-mail.",
    };
  }

  /*
   * Para o OWNER, esta action altera
   * somente os dados pessoais e senha.
   */

  if (usuario.role === "OWNER") {
    try {
      const senhaHash =
        novaSenha
          ? await hash(
              novaSenha,
              10
            )
          : undefined;

      await prisma.usuario.update({
        where: {
          id: usuario.id,
        },

        data: {
          nome,
          email,

          ...(senhaHash
            ? {
                senhaHash,
              }
            : {}),
        },
      });

      revalidatePath(
        "/usuarios"
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Erro ao atualizar proprietário:",
        error
      );

      return {
        success: false,
        message:
          "Não foi possível atualizar os dados do proprietário.",
      };
    }
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
    acessosUnicos.length === 0
  ) {
    return {
      success: false,
      message:
        "Selecione pelo menos uma empresa para o usuário.",
    };
  }

  if (data.role === "ADMIN") {
    const permissaoInvalida =
      acessosUnicos.some(
        (acesso) =>
          acesso.permissao !==
          "ADMIN"
      );

    if (permissaoInvalida) {
      return {
        success: false,
        message:
          "Administradores devem possuir permissão administrativa nas empresas selecionadas.",
      };
    }
  }

  if (data.role === "USUARIO") {
    const permissoesPermitidas =
      new Set([
        "FATURAMENTO",
        "OPERADOR",
        "VISUALIZADOR",
      ]);

    const permissaoInvalida =
      acessosUnicos.some(
        (acesso) =>
          !permissoesPermitidas.has(
            acesso.permissao
          )
      );

    if (permissaoInvalida) {
      return {
        success: false,
        message:
          "Usuários comuns não podem receber permissão administrativa.",
      };
    }
  }

  const empresasSelecionadas =
    acessosUnicos.map(
      (acesso) =>
        acesso.empresaId
    );

  let empresasGerenciadas:
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

    empresasGerenciadas =
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

    empresasGerenciadas =
      acessosGestor.map(
        (acesso) =>
          acesso.empresaId
      );
  }

  const empresasGerenciadasSet =
    new Set(
      empresasGerenciadas
    );

  const empresaSemPermissao =
    empresasSelecionadas.some(
      (empresaId) =>
        !empresasGerenciadasSet.has(
          empresaId
        )
    );

  if (empresaSemPermissao) {
    return {
      success: false,
      message:
        "Você não possui permissão para gerenciar uma das empresas selecionadas.",
    };
  }

  try {
    const senhaHash =
      novaSenha
        ? await hash(
            novaSenha,
            10
          )
        : undefined;

    await prisma.$transaction(
      async (tx) => {
        await tx.usuario.update({
          where: {
            id: usuario.id,
          },

          data: {
            nome,
            email,
            role: data.role,

            ...(senhaHash
              ? {
                  senhaHash,
                }
              : {}),
          },
        });

        /*
         * OWNER pode gerenciar todos
         * os vínculos do usuário.
         */

        if (
          gestor.role === "OWNER"
        ) {
          await tx.usuarioEmpresa.deleteMany({
            where: {
              usuarioId:
                usuario.id,

              empresaId: {
                notIn:
                  empresasSelecionadas,
              },
            },
          });
        } else {
          /*
           * ADMIN remove somente vínculos
           * das empresas que administra.
           */

          const empresasDoAdmin =
            await tx.usuarioEmpresa.findMany({
              where: {
                usuarioId:
                  gestor.id,

                ativo: true,

                permissao: "ADMIN",
              },

              select: {
                empresaId: true,
              },
            });

          const idsEmpresasDoAdmin =
            empresasDoAdmin.map(
              (acesso) =>
                acesso.empresaId
            );

          await tx.usuarioEmpresa.deleteMany({
            where: {
              usuarioId:
                usuario.id,

              empresaId: {
                in:
                  idsEmpresasDoAdmin,

                notIn:
                  empresasSelecionadas,
              },
            },
          });
        }

        for (
          const acesso of
          acessosUnicos
        ) {
          await tx.usuarioEmpresa.upsert({
            where: {
              usuarioId_empresaId: {
                usuarioId:
                  usuario.id,

                empresaId:
                  acesso.empresaId,
              },
            },

            create: {
              usuarioId:
                usuario.id,

              empresaId:
                acesso.empresaId,

              permissao:
                acesso.permissao,

              ativo: true,
            },

            update: {
              permissao:
                acesso.permissao,

              ativo: true,
            },
          });
        }
      }
    );

    revalidatePath(
      "/usuarios"
    );

    return {
      success: true,
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
          "Já existe outro usuário cadastrado com este e-mail.",
      };
    }

    console.error(
      "Erro ao atualizar usuário:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o usuário.",
    };
  }
}