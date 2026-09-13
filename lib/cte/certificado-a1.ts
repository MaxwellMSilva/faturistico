import { readFile } from "node:fs/promises";
import path from "node:path";

import forge from "node-forge";

import { prisma } from "@/lib/prisma";
import { descriptografar } from "@/lib/seguranca/criptografia";

export type CertificadoA1Cte = {
  pfx: Buffer;
  senha: string;
  certificadoPem: string;
  chavePrivadaPem: string;
  certificadoBase64: string;
  validadeFim: Date;
};

export async function carregarCertificadoA1Cte(
  empresaId: string
): Promise<CertificadoA1Cte> {
  const certificado =
    await prisma.certificadoDigital.findFirst({
      where: {
        empresaId,
        ativo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!certificado) {
    throw new Error(
      "CERTIFICADO_DIGITAL_NAO_CONFIGURADO"
    );
  }

  if (
    certificado.validadeFim.getTime() <=
    Date.now()
  ) {
    throw new Error(
      "CERTIFICADO_DIGITAL_EXPIRADO"
    );
  }

  const caminho = path.join(
    process.cwd(),
    certificado.arquivoPath
  );

  const conteudoCriptografado =
    await readFile(caminho, "utf8");

  const pfx = Buffer.from(
    descriptografar(
      conteudoCriptografado
    ),
    "base64"
  );

  const senha = descriptografar(
    certificado.senhaCriptografada
  );

  const bufferForge =
    forge.util.createBuffer(
      pfx.toString("binary")
    );

  const asn1 =
    forge.asn1.fromDer(bufferForge);

  const pkcs12 =
    forge.pkcs12.pkcs12FromAsn1(
      asn1,
      false,
      senha
    );

  const oidCertificado =
    forge.pki.oids.certBag;
  const oidChaveProtegida =
    forge.pki.oids.pkcs8ShroudedKeyBag;
  const oidChave =
    forge.pki.oids.keyBag;

  const certificadoBag = (
    pkcs12.getBags({
      bagType: oidCertificado,
    })[oidCertificado] ?? []
  ).find((bag) => Boolean(bag.cert));

  const chaveBag = [
    ...(pkcs12.getBags({
      bagType: oidChaveProtegida,
    })[oidChaveProtegida] ?? []),
    ...(pkcs12.getBags({
      bagType: oidChave,
    })[oidChave] ?? []),
  ].find((bag) => Boolean(bag.key));

  if (!certificadoBag?.cert) {
    throw new Error(
      "CERTIFICADO_A1_SEM_CERTIFICADO"
    );
  }

  if (!chaveBag?.key) {
    throw new Error(
      "CERTIFICADO_A1_SEM_CHAVE_PRIVADA"
    );
  }

  const certificadoPem =
    forge.pki.certificateToPem(
      certificadoBag.cert
    );

  const chavePrivadaPem =
    forge.pki.privateKeyToPem(
      chaveBag.key
    );

  const certificadoBase64 =
    certificadoPem
      .replace(
        /-----BEGIN CERTIFICATE-----/g,
        ""
      )
      .replace(
        /-----END CERTIFICATE-----/g,
        ""
      )
      .replace(/\s+/g, "");

  return {
    pfx,
    senha,
    certificadoPem,
    chavePrivadaPem,
    certificadoBase64,
    validadeFim:
      certificado.validadeFim,
  };
}
