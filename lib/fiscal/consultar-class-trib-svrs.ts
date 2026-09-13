import https from "node:https";

import { obterCertificadoA1Runtime } from "@/lib/certificado/obter-certificado-a1-runtime";

const URL_CLASS_TRIB =
  "https://cff.svrs.rs.gov.br/api/v1/consultas/classTrib";

export async function consultarClassTribSvrs(
  empresaId: string
): Promise<unknown> {
  const certificado =
    await obterCertificadoA1Runtime(
      empresaId
    );

  return new Promise((resolve, reject) => {
    const requisicao = https.request(
      URL_CLASS_TRIB,
      {
        method: "GET",
        pfx: certificado.pfx,
        passphrase: certificado.senha,
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
        headers: {
          Accept: "application/json",
          "User-Agent": "Faturistico/0.1",
        },
      },
      (resposta) => {
        const partes: Buffer[] = [];

        resposta.on("data", (parte) => {
          partes.push(
            Buffer.isBuffer(parte)
              ? parte
              : Buffer.from(parte)
          );
        });

        resposta.on("end", () => {
          const conteudo = Buffer.concat(
            partes
          ).toString("utf8");

          const status =
            resposta.statusCode ?? 0;

          if (
            status < 200 ||
            status >= 300
          ) {
            reject(
              new Error(
                `A SVRS recusou a consulta da tabela oficial (HTTP ${status}).`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(conteudo));
          } catch {
            reject(
              new Error(
                "A SVRS retornou uma resposta inválida ao consultar a tabela oficial."
              )
            );
          }
        });
      }
    );

    requisicao.setTimeout(
      20_000,
      () => {
        requisicao.destroy(
          new Error(
            "A consulta da tabela oficial da SVRS excedeu o tempo limite."
          )
        );
      }
    );

    requisicao.on("error", (error) => {
      reject(
        new Error(
          `Não foi possível consultar a tabela oficial da SVRS: ${error.message}`
        )
      );
    });

    requisicao.end();
  });
}
