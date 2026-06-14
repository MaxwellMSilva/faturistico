import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function obterChave() {
  const valor =
    process.env.ENCRYPTION_KEY;

  if (!valor) {
    throw new Error(
      "ENCRYPTION_KEY não foi configurada."
    );
  }

  const chave = Buffer.from(
    valor,
    "hex"
  );

  if (chave.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY deve possuir 64 caracteres hexadecimais."
    );
  }

  return chave;
}

export function criptografar(
  valor: string
) {
  const chave = obterChave();

  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      ALGORITHM,
      chave,
      iv
    );

  const conteudoCriptografado =
    Buffer.concat([
      cipher.update(
        valor,
        "utf8"
      ),

      cipher.final(),
    ]);

  const authTag =
    cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    conteudoCriptografado.toString(
      "hex"
    ),
  ].join(":");
}

export function descriptografar(
  valorCriptografado: string
) {
  const chave = obterChave();

  const [
    ivHex,
    authTagHex,
    conteudoHex,
  ] = valorCriptografado.split(":");

  if (
    !ivHex ||
    !authTagHex ||
    !conteudoHex
  ) {
    throw new Error(
      "Conteúdo criptografado inválido."
    );
  }

  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      chave,
      Buffer.from(ivHex, "hex")
    );

  decipher.setAuthTag(
    Buffer.from(
      authTagHex,
      "hex"
    )
  );

  const conteudo =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          conteudoHex,
          "hex"
        )
      ),

      decipher.final(),
    ]);

  return conteudo.toString("utf8");
}