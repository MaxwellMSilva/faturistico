"use server";

import {
  RoleUsuario,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

export async function getUsuarios() {
  const gestor =
    await validarGestaoUsuarios();

  /*
   * OWNER visualiza todos os usuários
   * e todos os vínculos empresariais.
   */

  if (gestor.role === "OWNER") {
    const usuarios =
      await prisma.usuario.findMany({
        include: {
          empresas: {
            include: {
              empresa: {
                select: {
                  id: true,

                  razaoSocial: true,
                  nomeFantasia: true,

                  cnpj: true,
                  ativo: true,
                },
              },

              privilegios: {
                select: {
                  privilegio: true,
                },

                orderBy: {
                  privilegio: "asc",
                },
              },
            },

            orderBy: {
              empresa: {
                razaoSocial: "asc",
              },
            },
          },
        },

        orderBy: [
          {
            createdAt: "desc",
          },
          {
            nome: "asc",
          },
        ],
      });

    return usuarios.map(
      (usuario) => ({
        id: usuario.id,

        nome: usuario.nome,
        email: usuario.email,

        role: usuario.role,
        ativo: usuario.ativo,

        createdAt:
          usuario.createdAt.toISOString(),

        empresas:
          usuario.empresas.map(
            (acesso) => ({
              id: acesso.id,

              empresaId:
                acesso.empresaId,

              permissao:
                acesso.permissao,

              ativo:
                acesso.ativo,

              privilegios:
                acesso.privilegios.map(
                  (item) =>
                    item.privilegio
                ),

              empresa:
                acesso.empresa,
            })
          ),

        /*
         * O OWNER pode editar:
         *
         * - os próprios dados;
         * - administradores;
         * - usuários comuns.
         *
         * Outro registro OWNER não deve
         * existir no sistema.
         */

        podeEditar:
          usuario.role !==
            RoleUsuario.OWNER ||
          usuario.id === gestor.id,

        /*
         * O OWNER não pode ser inativado.
         */

        podeInativar:
          usuario.role !==
            RoleUsuario.OWNER &&
          usuario.id !== gestor.id,
      })
    );
  }

  /*
   * ADMIN visualiza somente usuários
   * comuns vinculados às empresas ativas
   * nas quais possui permissão ADMIN.
   */

  const acessosAdministrador =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId:
          gestor.id,

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

  const empresasAdministradas =
    acessosAdministrador.map(
      (acesso) =>
        acesso.empresaId
    );

  if (
    empresasAdministradas.length ===
    0
  ) {
    return [];
  }

  const usuarios =
    await prisma.usuario.findMany({
      where: {
        role:
          RoleUsuario.USUARIO,

        empresas: {
          some: {
            empresaId: {
              in:
                empresasAdministradas,
            },

            ativo: true,

            empresa: {
              ativo: true,
            },
          },
        },
      },

      include: {
        empresas: {
          where: {
            empresaId: {
              in:
                empresasAdministradas,
            },

            /*
             * Mostra ao ADMIN somente os
             * vínculos das empresas que
             * ele administra.
             */

            empresa: {
              ativo: true,
            },
          },

          include: {
            empresa: {
              select: {
                id: true,

                razaoSocial: true,
                nomeFantasia: true,

                cnpj: true,
                ativo: true,
              },
            },

            privilegios: {
              select: {
                privilegio: true,
              },

              orderBy: {
                privilegio: "asc",
              },
            },
          },

          orderBy: {
            empresa: {
              razaoSocial: "asc",
            },
          },
        },
      },

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          nome: "asc",
        },
      ],
    });

  return usuarios.map(
    (usuario) => ({
      id: usuario.id,

      nome: usuario.nome,
      email: usuario.email,

      role: usuario.role,
      ativo: usuario.ativo,

      createdAt:
        usuario.createdAt.toISOString(),

      empresas:
        usuario.empresas.map(
          (acesso) => ({
            id: acesso.id,

            empresaId:
              acesso.empresaId,

            permissao:
              acesso.permissao,

            ativo:
              acesso.ativo,

            privilegios:
              acesso.privilegios.map(
                (item) =>
                  item.privilegio
              ),

            empresa:
              acesso.empresa,
          })
        ),

      /*
       * A consulta já retorna somente
       * usuários comuns das empresas
       * administradas pelo gestor.
       */

      podeEditar: true,
      podeInativar:
        usuario.id !== gestor.id,
    })
  );
}
