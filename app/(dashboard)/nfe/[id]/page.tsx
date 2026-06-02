import { notFound } from "next/navigation";

import { getNfe } from "@/actions/nfe/get-nfe";
import { getClientes } from "@/actions/clientes/get-clientes";
import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-natureza-operacao";
import { getProdutos } from "@/actions/produtos/get-produto";

import { NfeEditForm } from "@/components/nfe/nfe-edit-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NfeEditPage({
  params,
}: Props) {
  const { id } = await params;

  const nota = await getNfe(id);

  if (!nota) {
    notFound();
  }

  const clientes = await getClientes();

  const naturezas =
    await getNaturezasOperacao();

  const produtos =
    await getProdutos();

  return (
    <NfeEditForm
      nota={nota}
      clientes={clientes}
      naturezas={naturezas}
      produtos={produtos}
    />
  );
}