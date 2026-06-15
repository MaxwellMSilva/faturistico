import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function validarEmpresaAtivaParaAlteracao(
  empresaId: string
) {
  const contexto =
    await validarAcessoEmpresa(
      empresaId
    );

  if (!contexto.empresa.ativo) {
    throw new Error(
      "EMPRESA_INATIVA_SOMENTE_LEITURA"
    );
  }

  return contexto;
}