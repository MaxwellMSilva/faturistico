"use server";

import { getNfe } from "./get-nfe";
import { gerarXml } from "@/lib/nfe/gerar-xml";

export async function gerarXmlNfe(
  id: string
) {
  const nota = await getNfe(id);

  if (!nota) {
    throw new Error(
      "NF-e não encontrada."
    );
  }

  return gerarXml({
    nota,
  });
}