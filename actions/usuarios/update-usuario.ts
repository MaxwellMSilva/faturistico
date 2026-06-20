"use server";

import { revalidatePath } from "next/cache";

import { hash } from "bcryptjs";

import {
  Prisma,
  RoleUsuario,
  type PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

import {
  privilegioEmpresaValido,
  resolverPrivilegiosEmpresa,
  validarDependenciasPrivilegiosEmpresa,
} from "@/lib/usuarios/privilegios-empresa";

type RoleEditavel =
  | "ADMIN"
  | "USUARIO";

type PermissaoEditavel =
  | "ADMIN"
  | "PERSONALIZADO"
  | "VISUALIZADOR";

type AcessoEmpresa = {
  empresaId: string;

  permissao:
    PermissaoEditavel;

  privilegios?: string[];
};

type UpdateUsuarioData = {
  usuarioId: string;

  nome: string;
  email: string;

  role:
    | "OWNER"
    | RoleEditavel;

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

  if (!data.usuarioId) {
    return {
      success: false,
      message:
        "Usuário não informado.",
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
            id: true,
            empresaId: true,
            permissao: true,
            ativo: true,

            empresa: {
              select: {
                ativo: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            },
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

  if (
    usuario.role ===
    RoleUsuario.OWNER
  ) {
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

    if (
      data.role !== "OWNER"
    ) {
      return {
        success: false,
        message:
          "A função do proprietário não pode ser alterada.",
      };
    }
  }

  /*
   * ADMIN pode editar somente usuários
   * comuns vinculados às empresas que
   * ele administra.
   */

  if (
    gestor.role === "ADMIN"
  ) {
    if (
      usuario.role !==
      RoleUsuario.USUARIO
    ) {
      return {
        success: false,
        message:
          "Administradores podem editar apenas usuários comuns.",
      };
    }

    if (
      data.role !== "USUARIO"
    ) {
      return {
        success: false,
        message:
          "Administradores não podem promover usuários.",
      };
    }
  }

  /*
   * Impede criação de outro OWNER por
   * meio da edição.
   */

  if (
    usuario.role !==
      RoleUsuario.OWNER &&
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
    data.novaSenha?.trim() ??
    "";

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
   * Para o OWNER, altera somente
   * dados pessoais e senha.
   */

  if (
    usuario.role ===
    RoleUsuario.OWNER
  ) {
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

  if (
    !Array.isArray(
      data.acessos
    ) ||
    data.acessos.length === 0
  ) {
    return {
      success: false,
      message:
        "Selecione pelo menos uma empresa para o usuário.",
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
   * Validação da permissão empresarial.
   */

  if (
    data.role === "ADMIN"
  ) {
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
          "Administradores devem possuir permissão administrativa nas empresas selecionadas.",
      };
    }
  }

  if (
    data.role === "USUARIO"
  ) {
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
   * Não altera vínculos pertencentes a
   * empresas inativas.
   *
   * Também impede alterar o papel global
   * se isso deixar um vínculo inativo com
   * permissão incompatível.
   */

  if (
    data.role !== usuario.role
  ) {
    const acessoInativoIncompativel =
      usuario.empresas.find(
        (acesso) => {
          if (
            acesso.empresa.ativo
          ) {
            return false;
          }

          if (
            data.role === "ADMIN"
          ) {
            return (
              acesso.permissao !==
              "ADMIN"
            );
          }

          return (
            acesso.permissao !==
              "PERSONALIZADO" &&
            acesso.permissao !==
              "VISUALIZADOR"
          );
        }
      );

    if (
      acessoInativoIncompativel
    ) {
      const empresaNome =
        acessoInativoIncompativel
          .empresa
          .nomeFantasia ??
        acessoInativoIncompativel
          .empresa
          .razaoSocial;

      return {
        success: false,
        message:
          `Não é possível alterar a função enquanto o usuário possuir vínculo incompatível com a empresa inativa "${empresaNome}". Reative a empresa primeiro.`,
      };
    }
  }

  /*
   * Prepara e valida os privilégios.
   */

  const acessosPreparados:
    Array<{
      empresaId: string;

      permissao:
        PermissaoEditavel;

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
      privilegiosRecebidos as
        PrivilegioEmpresa[];

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
          "Selecione pelo menos um privilégio para cada acesso personalizado.",
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
   * Determina as empresas ativas que
   * o gestor pode administrar.
   */

  let empresasGerenciadas:
    string[];

  if (
    gestor.role === "OWNER"
  ) {
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

  const empresaNaoPermitida =
    empresasSelecionadas.some(
      (empresaId) =>
        !empresasGerenciadasSet.has(
          empresaId
        )
    );

  if (empresaNaoPermitida) {
    return {
      success: false,
      message:
        "Você não possui permissão para gerenciar uma das empresas selecionadas.",
    };
  }

  /*
   * Impede um ADMIN de editar por ID
   * um usuário que não esteja atualmente
   * ligado a uma empresa administrada.
   */

  if (
    gestor.role === "ADMIN"
  ) {
    const usuarioGerenciavel =
      await prisma.usuarioEmpresa.findFirst({
        where: {
          usuarioId:
            usuario.id,

          empresaId: {
            in:
              empresasGerenciadas,
          },

          ativo: true,
        },

        select: {
          id: true,
        },
      });

    if (!usuarioGerenciavel) {
      return {
        success: false,
        message:
          "Você não possui permissão para editar este usuário.",
      };
    }
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

            role:
              data.role,

            ...(senhaHash
              ? {
                  senhaHash,
                }
              : {}),
          },
        });

        /*
         * Empresas ativas que podem ter
         * os vínculos alterados.
         */

        let idsEmpresasAlteraveis:
          string[];

        if (
          gestor.role === "OWNER"
        ) {
          const empresasAtivas =
            await tx.empresa.findMany({
              where: {
                ativo: true,
              },

              select: {
                id: true,
              },
            });

          idsEmpresasAlteraveis =
            empresasAtivas.map(
              (empresa) =>
                empresa.id
            );
        } else {
          const acessosDoAdmin =
            await tx.usuarioEmpresa.findMany({
              where: {
                usuarioId:
                  gestor.id,

                ativo: true,

                permissao:
                  "ADMIN",

                empresa: {
                  ativo: true,
                },
              },

              select: {
                empresaId: true,
              },
            });

          idsEmpresasAlteraveis =
            acessosDoAdmin.map(
              (acesso) =>
                acesso.empresaId
            );
        }

        /*
         * Remove apenas vínculos de
         * empresas ativas e gerenciáveis
         * que foram desmarcadas.
         *
         * Vínculos de empresas inativas
         * permanecem intocados.
         */

        await tx.usuarioEmpresa.deleteMany({
          where: {
            usuarioId:
              usuario.id,

            empresaId: {
              in:
                idsEmpresasAlteraveis,

              notIn:
                empresasSelecionadas,
            },
          },
        });

        for (
          const acesso of
          acessosPreparados
        ) {
          const vinculo =
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

              select: {
                id: true,
              },
            });

          /*
           * Sempre limpa os privilégios
           * anteriores.
           *
           * ADMIN e VISUALIZADOR não
           * utilizam registros manuais.
           */

          await tx.usuarioEmpresaPrivilegio.deleteMany({
            where: {
              usuarioEmpresaId:
                vinculo.id,
            },
          });

          if (
            acesso.permissao ===
              "PERSONALIZADO" &&
            acesso.privilegios.length >
              0
          ) {
            await tx.usuarioEmpresaPrivilegio.createMany({
              data:
                acesso.privilegios.map(
                  (privilegio) => ({
                    usuarioEmpresaId:
                      vinculo.id,

                    privilegio,
                  })
                ),
            });
          }
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
        Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code === "P2002"
      ) {
        return {
          success: false,
          message:
            "Já existe outro usuário cadastrado com este e-mail.",
        };
      }

      if (
        error.code === "P2025"
      ) {
        return {
          success: false,
          message:
            "Usuário ou vínculo não encontrado.",
        };
      }
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
