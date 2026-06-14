import forge from "node-forge";

export type DadosCertificadoA1 = {
  serialNumber: string | null;
  thumbprint: string | null;

  titular: string | null;
  cnpjTitular: string | null;
  emitidoPor: string | null;

  validadeInicio: Date;
  validadeFim: Date;
};

function obterNomeComum(
  atributos: forge.pki.CertificateField[]
) {
  const atributo = atributos.find(
    (item) =>
      item.shortName === "CN" ||
      item.name === "commonName"
  );

  return atributo?.value
    ? String(atributo.value)
    : null;
}

function localizarCnpj(
  atributos: forge.pki.CertificateField[]
) {
  const texto = atributos
    .map((atributo) =>
      String(atributo.value ?? "")
    )
    .join(" ");

  const resultado =
    texto.match(/\d{14}/);

  return resultado?.[0] ?? null;
}

export function lerCertificadoA1(
  arquivo: Buffer,
  senha: string
): DadosCertificadoA1 {
  const bufferForge =
    forge.util.createBuffer(
      arquivo.toString("binary")
    );

  const asn1 =
    forge.asn1.fromDer(
      bufferForge
    );

  const pkcs12 =
    forge.pkcs12.pkcs12FromAsn1(
      asn1,
      false,
      senha
    );

  const oidCertificado =
    forge.pki.oids.certBag;

  const certificados =
    pkcs12.getBags({
      bagType: oidCertificado,
    })[oidCertificado] ?? [];

  const certificadoBag =
    certificados.find(
      (bag) => Boolean(bag.cert)
    );

  const certificado =
    certificadoBag?.cert;

  if (!certificado) {
    throw new Error(
      "Nenhum certificado foi encontrado no arquivo."
    );
  }

  const oidChaveProtegida =
    forge.pki.oids
      .pkcs8ShroudedKeyBag;

  const oidChave =
    forge.pki.oids.keyBag;

  const chavesProtegidas =
    pkcs12.getBags({
      bagType:
        oidChaveProtegida,
    })[oidChaveProtegida] ?? [];

  const chaves =
    pkcs12.getBags({
      bagType: oidChave,
    })[oidChave] ?? [];

  if (
    chavesProtegidas.length === 0 &&
    chaves.length === 0
  ) {
    throw new Error(
      "A chave privada não foi encontrada no certificado."
    );
  }

  const certificadoAsn1 =
    forge.pki.certificateToAsn1(
      certificado
    );

  const certificadoDer =
    forge.asn1
      .toDer(certificadoAsn1)
      .getBytes();

  const sha1 =
    forge.md.sha1.create();

  sha1.update(certificadoDer);

  const thumbprint =
    sha1
      .digest()
      .toHex()
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(":") ?? null;

  return {
    serialNumber:
      certificado.serialNumber
        ?.toUpperCase() ?? null,

    thumbprint,

    titular:
      obterNomeComum(
        certificado.subject
          .attributes
      ),

    cnpjTitular:
      localizarCnpj(
        certificado.subject
          .attributes
      ),

    emitidoPor:
      obterNomeComum(
        certificado.issuer
          .attributes
      ),

    validadeInicio:
      certificado.validity
        .notBefore,

    validadeFim:
      certificado.validity
        .notAfter,
  };
}