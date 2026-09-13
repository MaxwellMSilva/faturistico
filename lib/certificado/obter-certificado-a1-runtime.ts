import path from "node:path";
import { readFile } from "node:fs/promises";

import { prisma } from "@/lib/prisma";
import { descriptografar } from "@/lib/seguranca/criptografia";

export type CertificadoA1Runtime = {
  pfx: Buffer;
  senha: string;
  validadeFim: Date;
  cnpjTitular: string | null;
};

export async function obterCertificadoA1Runtime(
  empresaId: string
): Promise<CertificadoA1Runtime> {
  const certificado =
    await prisma.certificadoDigital.findFirst({
      where: {
        empresaId,
        ativo: true,
        validadeFim: {
          gt: new Date(),
        },
      },
      orderBy: {
        validadeFim: "desc",
      },
      select: {
        arquivoPath: true,
        senhaCriptografada: true,
        validadeFim: true,
        cnpjTitular: true,
      },
    });

  if (!certificado) {
    throw new Error(
      "Cadastre um certificado digital A1 válido para consultar a tabela oficial da Reforma Tributária."
    );
  }

  const caminhoArquivo = path.resolve(
    process.cwd(),
    certificado.arquivoPath
  );

  let arquivoCriptografado: string;

  try {
    arquivoCriptografado = await readFile(
      caminhoArquivo,
      "utf8"
    );
  } catch {
    throw new Error(
      "O arquivo do certificado digital não foi encontrado no servidor."
    );
  }

  let pfxBase64: string;
  let senha: string;

  try {
    pfxBase64 = descriptografar(
      arquivoCriptografado
    );

    senha = descriptografar(
      certificado.senhaCriptografada
    );
  } catch {
    throw new Error(
      "Não foi possível abrir o certificado digital. Verifique a configuração da chave de criptografia."
    );
  }

  const pfx = Buffer.from(
    pfxBase64,
    "base64"
  );

  if (pfx.length === 0) {
    throw new Error(
      "O certificado digital armazenado está vazio ou inválido."
    );
  }

  return {
    pfx,
    senha,
    validadeFim: certificado.validadeFim,
    cnpjTitular: certificado.cnpjTitular,
  };
}
