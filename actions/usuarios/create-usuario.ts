"use server";

import { revalidatePath } from "next/cache";

import { hash } from "bcryptjs";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

type RoleNovoUsuario =
  | "ADMIN"
  | "USUARIO";

type PermissaoNovoUsuario =
  | "ADMIN"
  | "FATURAMENTO"
  | "OPERADOR"
  | "VISUALIZADOR";

type AcessoEmpresa = {
  empresaId: string;

  permissao:
    PermissaoNovoUsuario;
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
        "Informe uma função válida para o usuário.",
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
    !Array.isArray(data.acessos) ||
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
   * Permissão empresarial conforme
   * o papel global.
   */

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
          "Um administrador deve possuir permissão de administrador nas empresas selecionadas.",
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
          "Usuários comuns não podem receber permissão de proprietário ou administrador.",
      };
    }
  }

  /*
   * Verifica quais empresas o gestor
   * pode administrar.
   */

  const empresasSelecionadas =
    acessosUnicos.map(
      (acesso) =>
        acesso.empresaId
    );

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
        "Você não possui permissão para vincular usuários a uma das empresas selecionadas.",
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
              acessosUnicos.map(
                (acesso) => ({
                  empresaId:
                    acesso.empresaId,

                  permissao:
                    acesso.permissao,

                  ativo: true,
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