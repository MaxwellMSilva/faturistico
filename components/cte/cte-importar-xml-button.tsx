"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  FileUp,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  extrairDadosNfeParaCte,
  type DadosNfeParaCte,
} from "@/lib/cte/nfe-origem";

function chaveStorage(empresaId: string) {
  return `faturistico:cte:nfe-origem:${empresaId}`;
}

function mensagemErroXml(error: unknown) {
  const codigo =
    error instanceof Error
      ? error.message
      : "";

  if (
    codigo === "XML_NFE_VAZIO" ||
    codigo === "XML_NFE_INVALIDO"
  ) {
    return "Um dos arquivos não contém uma NF-e válida.";
  }

  if (
    codigo ===
    "XML_NAO_E_NFE_MODELO_55"
  ) {
    return "Um dos XMLs informados não é de uma NF-e modelo 55.";
  }

  if (
    codigo ===
    "XML_NFE_SEM_PROTOCOLO_AUTORIZACAO"
  ) {
    return "Use somente XMLs autorizados de NF-e, contendo o protocolo de autorização.";
  }

  if (
    codigo === "XML_NFE_NAO_AUTORIZADO"
  ) {
    return "Uma das NF-e selecionadas não está autorizada.";
  }

  if (codigo === "CHAVE_NFE_INVALIDA") {
    return "Uma das NF-e possui chave de acesso inválida.";
  }

  return "Não foi possível ler um dos XMLs selecionados.";
}

type Props = {
  empresaId: string;
};

export function CteImportarXmlButton({
  empresaId,
}: Props) {
  const router = useRouter();
  const inputRef =
    useRef<HTMLInputElement>(null);
  const [processando, setProcessando] =
    useState(false);

  async function importar(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (arquivos.length === 0) return;

    const arquivoInvalido =
      arquivos.find(
        (arquivo) =>
          !arquivo.name
            .toLowerCase()
            .endsWith(".xml")
      );

    if (arquivoInvalido) {
      window.alert(
        "Selecione somente arquivos XML de NF-e."
      );
      return;
    }

    const arquivoGrande =
      arquivos.find(
        (arquivo) =>
          arquivo.size > 10_000_000
      );

    if (arquivoGrande) {
      window.alert(
        `O arquivo ${arquivoGrande.name} excede o limite de 10 MB.`
      );
      return;
    }

    setProcessando(true);

    try {
      const dados: DadosNfeParaCte[] = [];
      const chaves = new Set<string>();

      for (const arquivo of arquivos) {
        const xml = await arquivo.text();
        const nota =
          extrairDadosNfeParaCte(xml);

        if (!chaves.has(nota.chaveAcesso)) {
          chaves.add(nota.chaveAcesso);
          dados.push(nota);
        }
      }

      if (dados.length === 0) {
        window.alert(
          "Nenhuma NF-e válida foi encontrada nos arquivos selecionados."
        );
        return;
      }

      if (dados.length > 1) {
        const primeira = dados[0];
        const participantesDiferentes =
          dados.some(
            (nota) =>
              nota.emitenteDocumento !==
                primeira.emitenteDocumento ||
              nota.destinatarioDocumento !==
                primeira.destinatarioDocumento
          );

        if (participantesDiferentes) {
          window.alert(
            "Para carregar várias NF-e no mesmo CT-e, os XMLs precisam ter o mesmo emitente e o mesmo destinatário."
          );
          return;
        }
      }

      sessionStorage.setItem(
        chaveStorage(empresaId),
        JSON.stringify(dados)
      );

      router.push(
        `/empresa/${empresaId}/cte/novo?origem=xml`
      );
    } catch (error) {
      console.error(
        "Erro ao importar XMLs para CT-e:",
        error
      );
      window.alert(mensagemErroXml(error));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xml,text/xml,application/xml"
        multiple
        className="hidden"
        onChange={importar}
      />

      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={processando}
        onClick={() =>
          inputRef.current?.click()
        }
      >
        {processando ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <FileUp size={17} />
        )}
        {processando
          ? "Lendo XML..."
          : "Importar XML"}
      </Button>
    </>
  );
}
