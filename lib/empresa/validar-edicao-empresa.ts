import { validarEmpresaAtivaParaAlteracao } from "@/lib/empresa/validar-empresa-ativa-para-alteracao";

export async function validarEdicaoEmpresa(
  empresaId: string
) {
  const contexto =
    await validarEmpresaAtivaParaAlteracao(
      empresaId
    );

  const {
    usuario,
    acesso,
  } = contexto;

  if (usuario.role === "OWNER") {
    return contexto;
  }

  if (
    usuario.role !== "ADMIN" ||
    !acesso ||
    !acesso.ativo ||
    acesso.permissao !== "ADMIN"
  ) {
    throw new Error(
      "EDICAO_EMPRESA_NAO_AUTORIZADA"
    );
  }

  return contexto;
}