import { calcularDigitoVerificador } from "@/lib/fiscal/gerar-chave-acesso";
import {
  CODIGOS_UF,
  somenteNumeros,
} from "@/lib/cte/util";

type Params = {
  uf: string;
  cnpj: string;
  dataEmissao: Date;
  serie: number;
  numero: number;
  codigoNumerico: string;
  tipoEmissao?: number;
};

export function gerarChaveAcessoCte({
  uf,
  cnpj,
  dataEmissao,
  serie,
  numero,
  codigoNumerico,
  tipoEmissao = 1,
}: Params) {
  const codigoUf =
    CODIGOS_UF[uf.toUpperCase()];

  if (!codigoUf) {
    throw new Error("UF_EMITENTE_INVALIDA");
  }

  const documento = somenteNumeros(cnpj);

  if (documento.length !== 14) {
    throw new Error("CNPJ_EMITENTE_INVALIDO");
  }

  const codigo =
    somenteNumeros(codigoNumerico)
      .padStart(8, "0")
      .slice(-8);

  const ano = String(
    dataEmissao.getFullYear()
  ).slice(-2);

  const mes = String(
    dataEmissao.getMonth() + 1
  ).padStart(2, "0");

  const chaveSemDv = [
    codigoUf,
    `${ano}${mes}`,
    documento,
    "57",
    String(serie).padStart(3, "0"),
    String(numero).padStart(9, "0"),
    String(tipoEmissao),
    codigo,
  ].join("");

  if (chaveSemDv.length !== 43) {
    throw new Error(
      "CHAVE_CTE_BASE_INVALIDA"
    );
  }

  const dv =
    calcularDigitoVerificador(
      chaveSemDv
    );

  return {
    chave: `${chaveSemDv}${dv}`,
    dv,
    codigoNumerico: codigo,
  };
}
