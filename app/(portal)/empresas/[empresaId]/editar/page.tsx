import {
  notFound,
  redirect,
} from "next/navigation";

import { prisma } from "@/lib/prisma";

import { validarEdicaoEmpresa } from "@/lib/empresa/validar-edicao-empresa";

import { EditarEmpresaForm } from "@/components/empresa/editar-empresa-form";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

export default async function EditarEmpresaPage({
  params,
}: Props) {
  const { empresaId } =
    await params;

  try {
    await validarEdicaoEmpresa(
      empresaId
    );
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "";

    if (
      mensagem ===
      "Usuário não autenticado."
    ) {
      redirect("/entrar");
    }

    notFound();
  }

  const empresa =
    await prisma.empresa.findUnique({
      where: {
        id: empresaId,
      },

      select: {
        id: true,

        razaoSocial: true,
        nomeFantasia: true,

        cnpj: true,

        inscricaoEstadual:
          true,

        inscricaoMunicipal:
          true,

        email: true,
        telefone: true,

        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,

        bairro: true,

        municipio: true,

        codigoMunicipio:
          true,

        uf: true,
      },
    });

  if (!empresa) {
    notFound();
  }

  return (
    <EditarEmpresaForm
      empresa={{
        id:
          empresa.id,

        razaoSocial:
          empresa.razaoSocial,

        nomeFantasia:
          empresa.nomeFantasia ??
          "",

        cnpj:
          empresa.cnpj,

        inscricaoEstadual:
          empresa.inscricaoEstadual ??
          "",

        inscricaoMunicipal:
          empresa.inscricaoMunicipal ??
          "",

        email:
          empresa.email ?? "",

        telefone:
          empresa.telefone ?? "",

        cep:
          empresa.cep ?? "",

        logradouro:
          empresa.logradouro ??
          "",

        numero:
          empresa.numero ?? "",

        complemento:
          empresa.complemento ??
          "",

        bairro:
          empresa.bairro ?? "",

        municipio:
          empresa.municipio ??
          "",

        codigoMunicipio:
          empresa.codigoMunicipio ??
          "",

        uf:
          empresa.uf ?? "",
      }}
    />
  );
}