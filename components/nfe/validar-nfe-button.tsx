"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { validarNfeCompleta } from "@/actions/nfe/validar-nfe-completa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  empresaId: string;
  notaFiscalId: string;
  disabled?: boolean;
};

type ResultadoValidacao = {
  success: boolean;
  erros: string[];
  avisos: string[];
};

export function ValidarNfeButton({
  empresaId,
  notaFiscalId,
  disabled = false,
}: Props) {
  const [carregando, setCarregando] =
    useState(false);
  const [aberto, setAberto] =
    useState(false);
  const [resultado, setResultado] =
    useState<ResultadoValidacao | null>(
      null
    );

  async function handleValidar() {
    setResultado(null);
    setCarregando(true);

    try {
      const resposta =
        await validarNfeCompleta(
          empresaId,
          notaFiscalId
        );

      setResultado(resposta);
      setAberto(true);
    } catch (error) {
      console.error(
        "Erro ao validar NF-e:",
        error
      );

      setResultado({
        success: false,
        erros: [
          "Não foi possível validar a NF-e. Tente novamente.",
        ],
        avisos: [],
      });
      setAberto(true);
    } finally {
      setCarregando(false);
    }
  }

  const validada =
    resultado?.success === true;

  return (
    <>
      <Button
        type="button"
        onClick={handleValidar}
        disabled={disabled || carregando}
        className="h-11 min-w-44"
      >
        {carregando ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <ShieldCheck size={17} />
        )}
        {carregando
          ? "Validando..."
          : "Validar NF-e"}
      </Button>

      <Dialog
        open={aberto}
        onOpenChange={(valor) => {
          if (carregando) {
            return;
          }

          setAberto(valor);

          if (!valor) {
            setResultado(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div
              className={[
                "mb-2 flex h-12 w-12 items-center justify-center rounded-xl",
                validada
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              {validada ? (
                <CheckCircle2 size={24} />
              ) : (
                <CircleX size={24} />
              )}
            </div>

            <DialogTitle>
              {validada
                ? "NF-e validada com sucesso"
                : "Foram encontrados problemas"}
            </DialogTitle>

            <DialogDescription>
              {validada
                ? "O rascunho passou pelas validações fiscais disponíveis, incluindo a Reforma Tributária."
                : "Corrija os erros antes de prosseguir com a emissão da NF-e."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {resultado?.erros.length ? (
              <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
                  <CircleX size={18} />
                  Erros encontrados
                </div>

                <ol className="space-y-2">
                  {resultado.erros.map(
                    (erro, indice) => (
                      <li
                        key={`${indice}-${erro}`}
                        className="rounded-lg border bg-background px-3 py-2 text-sm leading-6"
                      >
                        <span className="mr-2 font-semibold text-destructive">
                          {indice + 1}.
                        </span>
                        {erro}
                      </li>
                    )
                  )}
                </ol>
              </section>
            ) : null}

            {resultado?.avisos.length ? (
              <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={18} />
                  Avisos
                </div>

                <ul className="space-y-2">
                  {resultado.avisos.map(
                    (aviso, indice) => (
                      <li
                        key={`${indice}-${aviso}`}
                        className="text-sm leading-6 text-muted-foreground"
                      >
                        • {aviso}
                      </li>
                    )
                  )}
                </ul>
              </section>
            ) : null}

            {validada &&
            !resultado?.avisos.length ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Emitente, destinatário,
                  operação, itens, tributos,
                  totais e classificação
                  IBS/CBS foram verificados.
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAberto(false)
              }
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
