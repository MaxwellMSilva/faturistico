"use server";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

export async function getDadosUsuario() {
  const gestor =
    await validarGestaoUsuarios();

  if (gestor.role === "OWNER") {
    const empresas =
      await prisma.empresa.findMany({
        where: {
          ativo: true,
        },

        select: {
          id: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpj: true,
        },

        orderBy: {
          razaoSocial: "asc",
        },
      });

    return {
      gestor,
      empresas,

      rolesPermitidos: [
        "ADMIN",
        "USUARIO",
      ] as const,
    };
  }

  const acessos =
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
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
      },

      orderBy: {
        empresa: {
          razaoSocial: "asc",
        },
      },
    });

  return {
    gestor,

    empresas:
      acessos.map(
        (acesso) =>
          acesso.empresa
      ),

    rolesPermitidos: [
      "USUARIO",
    ] as const,
  };
}