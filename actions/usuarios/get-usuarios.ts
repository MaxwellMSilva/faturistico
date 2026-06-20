"use server";

import {
  RoleUsuario,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

export async function getUsuarios() {
  const gestor =
    await validarGestaoUsuarios();

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
          usuario.empresas.flatMap(
            (acesso) => {
              if (
                acesso.permissao ===
                "OWNER"
              ) {
                return [];
              }

              return [
                {
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
                },
              ];
            }
          ),

        podeEditar:
          usuario.role !==
            RoleUsuario.OWNER ||
          usuario.id === gestor.id,

        podeInativar:
          usuario.role !==
            RoleUsuario.OWNER &&
          usuario.id !== gestor.id,
      })
    );
  }

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
        usuario.empresas.flatMap(
          (acesso) => {
            if (
              acesso.permissao ===
              "OWNER"
            ) {
              return [];
            }

            return [
              {
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
              },
            ];
          }
        ),

      podeEditar: true,
      podeInativar:
        usuario.id !== gestor.id,
    })
  );
}
