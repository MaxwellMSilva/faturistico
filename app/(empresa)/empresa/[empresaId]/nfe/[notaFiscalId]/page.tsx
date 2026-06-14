import { notFound } from "next/navigation";

import { getNfeDetalhes } from "@/actions/nfe/get-nfe-detalhes";

import { NfeRascunhoForm } from "@/components/nfe/nfe-rascunho-form";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
    notaFiscalId: string;
  }>;
};

export default async function NfeDetalhesPage({
  params,
}: Props) {
  const {
    empresaId,
    notaFiscalId,
  } = await params;

  const dados =
    await getNfeDetalhes(
      empresaId,
      notaFiscalId
    );

  if (!dados) {
    notFound();
  }

  return (
    <NfeRascunhoForm
      empresaId={empresaId}
      nota={dados.nota}
      produtos={dados.produtos}
    />
  );
}