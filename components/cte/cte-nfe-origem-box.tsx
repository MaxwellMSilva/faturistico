"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  LoaderCircle,
  Search,
} from "lucide-react";

import {
  buscarNfePorChaveParaCte,
} from "@/actions/cte/iniciar-cte-com-nfe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  DadosNfeParaCte,
} from "@/lib/cte/nfe-origem";

function numeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function chaveStorage(empresaId: string) {
  return `faturistico:cte:nfe-origem:${empresaId}`;
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
  const [chave, setChave] =
    useState("");
  const [processando, setProcessando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState<{
      tipo: "sucesso" | "erro";
      texto: string;
    } | null>(null);

  useEffect(() => {
    const storageKey =
      chaveStorage(empresaId);
    const armazenado =
      sessionStorage.getItem(storageKey);

    if (!armazenado) return;

    sessionStorage.removeItem(storageKey);

    try {
      const importadas = JSON.parse(
        armazenado
      ) as DadosNfeParaCte[];

      if (
        !Array.isArray(importadas) ||
        importadas.length === 0
      ) {
        return;
      }

      const [principal, ...demais] =
        importadas;

      for (const nota of demais) {
        onCarregar({
          ...nota,
          valorNota: 0,
          produtoPredominante: "",
          pesoBruto: null,
          quantidadeVolumes: null,
        });
      }

      const valorTotal =
        importadas.reduce(
          (total, nota) =>
            total + nota.valorNota,
          0
        );

      const pesos = importadas
        .map((nota) => nota.pesoBruto)
        .filter(
          (valor): valor is number =>
            valor !== null && valor > 0
        );

      const volumes = importadas
        .map(
          (nota) =>
            nota.quantidadeVolumes
        )
        .filter(
          (valor): valor is number =>
            valor !== null && valor > 0
        );

      onCarregar({
        ...principal,
        valorNota: valorTotal,
        pesoBruto:
          pesos.length > 0
            ? pesos.reduce(
                (total, valor) =>
                  total + valor,
                0
              )
            : null,
        quantidadeVolumes:
          volumes.length > 0
            ? volumes.reduce(
                (total, valor) =>
                  total + valor,
                0
              )
            : null,
      });

      setChave(principal.chaveAcesso);
      setMensagem({
        tipo: "sucesso",
        texto:
          importadas.length === 1
            ? "1 NF-e foi carregada pelo XML. Confira os dados antes de salvar o CT-e."
            : `${importadas.length} NF-e foram carregadas pelos XMLs e vinculadas ao CT-e. Confira os dados antes de salvar.`,
      });
    } catch (error) {
      console.error(
        "Erro ao aplicar XMLs importados no CT-e:",
        error
      );
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível aplicar os XMLs importados ao cadastro do CT-e.",
      });
    }
  }, [empresaId, onCarregar]);

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
      <div>
        <h2 className="text-sm font-semibold">
          Buscar NF-e pela chave
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
          Informe a chave de acesso para consultar a NF-e e aproveitar os dados disponíveis no CT-e.
        </p>
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

      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
        A busca pela chave usa o certificado A1 da empresa e o Ambiente Nacional da NF-e. O XML completo só será retornado quando a empresa tiver acesso ao documento.
      </p>

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
