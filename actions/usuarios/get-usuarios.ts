"use server";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";
import { RoleUsuario } from "@prisma/client";

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
            role: "asc",
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

              empresa:
                acesso.empresa,
            })
          ),

        podeEditar:
          usuario.role !== "OWNER" ||
          usuario.id === gestor.id,

        podeInativar:
          usuario.role !== "OWNER" &&
          usuario.id !== gestor.id,
      })
    );
  }

  const acessosAdministrador =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId: gestor.id,

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
        role: RoleUsuario.USUARIO,

        empresas: {
          some: {
            empresaId: {
              in:
                empresasAdministradas,
            },

            ativo: true,
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
          },

          orderBy: {
            empresa: {
              razaoSocial: "asc",
            },
          },
        },
      },

      orderBy: {
        nome: "asc",
      },
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

            empresa:
              acesso.empresa,
          })
        ),

      podeEditar: true,
      podeInativar: true,
    })
  );
}