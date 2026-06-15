import {
  notFound,
  redirect,
} from "next/navigation";

import { validarCadastroEmpresa } from "@/lib/empresa/validar-cadastro-empresa";

import { NovaEmpresaForm } from "@/components/empresa/nova-empresa-form";

export const dynamic =
  "force-dynamic";

export default async function NovaEmpresaPage() {
  try {
    await validarCadastroEmpresa();
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "";

    if (
      mensagem ===
      "USUARIO_NAO_AUTENTICADO"
    ) {
      redirect("/entrar");
    }

    notFound();
  }

  return <NovaEmpresaForm />;
}