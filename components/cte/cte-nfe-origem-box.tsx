"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  FileUp,
  LoaderCircle,
  Search,
} from "lucide-react";

import {
  buscarNfePorChaveParaCte,
  processarXmlNfeParaCte,
} from "@/actions/cte/iniciar-cte-com-nfe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  DadosNfeParaCte,
} from "@/lib/cte/nfe-origem";

function numeros(valor: string) {
  return valor.replace(/\D/g, "");
}

type Props = {
  empresaId: string;
  onCarregar: (
    dados: DadosNfeParaCte
  ) => void;
};

export function CteNfeOrigemBox({
  empresaId,
  onCarregar,
}: Props) {
  const inputArquivo =
    useRef<HTMLInputElement>(null);
  const [chave, setChave] =
    useState("");
  const [processando, setProcessando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState<{
      tipo: "sucesso" | "erro";
      texto: string;
    } | null>(null);

  async function importarXml(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo =
      event.target.files?.[0];

    event.target.value = "";

    if (!arquivo) return;

    if (
      !arquivo.name
        .toLowerCase()
        .endsWith(".xml")
    ) {
      setMensagem({
        tipo: "erro",
        texto:
          "Selecione um arquivo XML de NF-e.",
      });
      return;
    }

    if (arquivo.size > 10_000_000) {
      setMensagem({
        tipo: "erro",
        texto:
          "O XML excede o limite de 10 MB.",
      });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const xml =
        await arquivo.text();
      const resultado =
        await processarXmlNfeParaCte({
          empresaId,
          xml,
        });

      if (!resultado.success) {
        setMensagem({
          tipo: "erro",
          texto: resultado.message,
        });
        return;
      }

      onCarregar(resultado.dados);
      setChave(
        resultado.dados.chaveAcesso
      );
      setMensagem({
        tipo: "sucesso",
        texto:
          `NF-e ${resultado.dados.numeroNfe ?? ""} carregada pelo XML. Confira os dados antes de salvar o CT-e.`,
      });
    } catch (error) {
      console.error(
        "Erro ao importar XML da NF-e:",
        error
      );
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível ler o XML da NF-e.",
      });
    } finally {
      setProcessando(false);
    }
  }

  async function buscarPorChave() {
    const chaveLimpa =
      numeros(chave);

    if (chaveLimpa.length !== 44) {
      setMensagem({
        tipo: "erro",
        texto:
          "Informe os 44 dígitos da chave da NF-e.",
      });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const resultado =
        await buscarNfePorChaveParaCte({
          empresaId,
          chaveAcesso: chaveLimpa,
        });

      if (!resultado.success) {
        setMensagem({
          tipo: "erro",
          texto: resultado.message,
        });
        return;
      }

      onCarregar(resultado.dados);
      setMensagem({
        tipo: "sucesso",
        texto:
          `NF-e ${resultado.dados.numeroNfe ?? ""} localizada e carregada. Confira os dados antes de salvar o CT-e.`,
      });
    } catch (error) {
      console.error(
        "Erro ao buscar NF-e pela chave:",
        error
      );
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível consultar a NF-e pela chave.",
      });
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            Iniciar CT-e pela NF-e
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            Importe o XML autorizado da NF-e ou consulte pelo número da chave para preencher os dados disponíveis do transporte.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <input
            ref={inputArquivo}
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            onChange={importarXml}
          />
          <Button
            type="button"
            variant="outline"
            disabled={processando}
            onClick={() =>
              inputArquivo.current?.click()
            }
          >
            {processando ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <FileUp size={16} />
            )}
            Importar XML
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={chave}
          onChange={(event) =>
            setChave(
              numeros(
                event.target.value
              ).slice(0, 44)
            )
          }
          inputMode="numeric"
          maxLength={44}
          placeholder="Digite a chave de acesso da NF-e (44 dígitos)"
          className="h-10 flex-1 font-mono"
        />
        <Button
          type="button"
          variant="outline"
          disabled={
            processando ||
            chave.length !== 44
          }
          onClick={buscarPorChave}
          className="h-10"
        >
          {processando ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Search size={16} />
          )}
          Buscar NF-e
        </Button>
      </div>

      {mensagem && (
        <div
          className={[
            "mt-3 rounded-xl border px-3 py-2 text-xs leading-5",
            mensagem.tipo === "sucesso"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          ].join(" ")}
        >
          {mensagem.texto}
        </div>
      )}
    </section>
  );
}
