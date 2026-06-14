"use server";

import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";

import path from "node:path";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { criptografar } from "@/lib/seguranca/criptografia";

import { lerCertificadoA1 } from "@/lib/certificado/ler-certificado-a1";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type UploadCertificadoResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

const TAMANHO_MAXIMO =
  3 * 1024 * 1024;

export async function uploadCertificado(
  empresaId: string,
  formData: FormData
): Promise<UploadCertificadoResult> {
  const { acesso } =
    await validarAcessoEmpresa(
      empresaId
    );

  if (
    acesso.permissao !== "OWNER" &&
    acesso.permissao !== "ADMIN"
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar o certificado.",
    };
  }

  const arquivo =
    formData.get("arquivo");

  const senhaRecebida =
    formData.get("senha");

  if (!(arquivo instanceof File)) {
    return {
      success: false,
      message:
        "Selecione o certificado digital.",
    };
  }

  const senha =
    typeof senhaRecebida === "string"
      ? senhaRecebida
      : "";

  if (!senha) {
    return {
      success: false,
      message:
        "Informe a senha do certificado.",
    };
  }

  const extensao =
    path
      .extname(arquivo.name)
      .toLowerCase();

  if (
    extensao !== ".pfx" &&
    extensao !== ".p12"
  ) {
    return {
      success: false,
      message:
        "Envie um arquivo .pfx ou .p12.",
    };
  }

  if (
    arquivo.size === 0 ||
    arquivo.size > TAMANHO_MAXIMO
  ) {
    return {
      success: false,
      message:
        "O certificado deve possuir no máximo 3 MB.",
    };
  }

  const arrayBuffer =
    await arquivo.arrayBuffer();

  const arquivoBuffer =
    Buffer.from(arrayBuffer);

  let dadosCertificado;

  try {
    dadosCertificado =
      lerCertificadoA1(
        arquivoBuffer,
        senha
      );
  } catch (error) {
    console.error(
      "Erro ao ler certificado:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível abrir o certificado. Verifique o arquivo e a senha.",
    };
  }

  if (
    dadosCertificado.validadeFim <
    new Date()
  ) {
    return {
      success: false,
      message:
        "O certificado informado está expirado.",
    };
  }

  const pastaRelativa =
    path.join(
      "storage",
      "certificados",
      empresaId
    );

  const pastaCompleta =
    path.join(
      process.cwd(),
      pastaRelativa
    );

  await mkdir(
    pastaCompleta,
    {
      recursive: true,
    }
  );

  const nomeArmazenado =
    `${randomUUID()}.pfx.enc`;

  const caminhoCompleto =
    path.join(
      pastaCompleta,
      nomeArmazenado
    );

  const caminhoRelativo =
    path
      .join(
        pastaRelativa,
        nomeArmazenado
      )
      .replaceAll("\\", "/");

  const arquivoCriptografado =
    criptografar(
      arquivoBuffer.toString(
        "base64"
      )
    );

  await writeFile(
    caminhoCompleto,
    arquivoCriptografado,
    "utf8"
  );

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.certificadoDigital.updateMany({
          where: {
            empresaId,
            ativo: true,
          },

          data: {
            ativo: false,
          },
        });

        await tx.certificadoDigital.create({
          data: {
            empresaId,

            nomeArquivo:
              arquivo.name,

            arquivoPath:
              caminhoRelativo,

            senhaCriptografada:
              criptografar(senha),

            serialNumber:
              dadosCertificado
                .serialNumber,

            thumbprint:
              dadosCertificado
                .thumbprint,

            titular:
              dadosCertificado
                .titular,

            cnpjTitular:
              dadosCertificado
                .cnpjTitular,

            emitidoPor:
              dadosCertificado
                .emitidoPor,

            validadeInicio:
              dadosCertificado
                .validadeInicio,

            validadeFim:
              dadosCertificado
                .validadeFim,

            ativo: true,
          },
        });
      }
    );

    revalidatePath(
      `/empresa/${empresaId}/configuracoes`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao salvar certificado:",
      error
    );

    await unlink(
      caminhoCompleto
    ).catch(() => undefined);

    return {
      success: false,
      message:
        "Não foi possível salvar o certificado.",
    };
  }
}