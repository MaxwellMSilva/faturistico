"use client";

import { useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { validarNfe } from "@/actions/nfe/validar-nfe";

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
  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [aberto, setAberto] =
    useState(false);

  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoValidacao | null>(
      null
    );

  async function handleValidar() {
    setResultado(null);

    try {
      setCarregando(true);

      const resposta =
        await validarNfe(
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

  const possuiErros =
    Boolean(
      resultado?.erros.length
    );

  const possuiAvisos =
    Boolean(
      resultado?.avisos.length
    );

  return (
    <>
      <Button
        type="button"
        onClick={handleValidar}
        disabled={
          disabled ||
          carregando
        }
        className="h-11 min-w-44"
      >
        {carregando ? (
          <>
            <LoaderCircle
              size={17}
              className="animate-spin"
            />

            Validando...
          </>
        ) : (
          <>
            <ShieldCheck size={17} />

            Validar NF-e
          </>
        )}
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
                <CheckCircle2
                  size={24}
                />
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
                ? "Os dados atuais do rascunho passaram pelas validações disponíveis no sistema."
                : "Corrija os problemas indicados antes de prosseguir com a emissão da NF-e."}
            </DialogDescription>
          </DialogHeader>

          <div
            aria-live="polite"
            className="space-y-5"
          >
            {validada &&
              !possuiAvisos && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                  />

                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Nenhum problema
                      encontrado
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Emitente, destinatário,
                      natureza de operação,
                      itens, tributos e totais
                      foram verificados.
                    </p>
                  </div>
                </div>
              )}

            {possuiErros && (
              <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="mb-4 flex items-start gap-3">
                  <CircleX
                    size={19}
                    className="mt-0.5 shrink-0 text-destructive"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-destructive">
                      Erros encontrados
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Estes problemas impedem
                      o avanço do documento.
                    </p>
                  </div>
                </div>

                <ol className="space-y-3">
                  {resultado?.erros.map(
                    (erro, indice) => (
                      <li
                        key={`${indice}-${erro}`}
                        className="flex items-start gap-3 rounded-lg border bg-background px-3 py-3 text-sm"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                          {indice + 1}
                        </span>

                        <span className="leading-6">
                          {erro}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </section>
            )}

            {possuiAvisos && (
              <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="mb-4 flex items-start gap-3">
                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      Avisos
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      A validação foi concluída,
                      mas estes pontos devem ser
                      observados.
                    </p>
                  </div>
                </div>

                <ol className="space-y-3">
                  {resultado?.avisos.map(
                    (aviso, indice) => (
                      <li
                        key={`${indice}-${aviso}`}
                        className="flex items-start gap-3 rounded-lg border bg-background px-3 py-3 text-sm"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {indice + 1}
                        </span>

                        <span className="leading-6">
                          {aviso}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </section>
            )}

            {validada && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm font-medium">
                  Validação interna concluída
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Esta etapa verifica os dados
                  disponíveis no sistema. A
                  validação definitiva do XML e
                  das regras fiscais ocorrerá
                  posteriormente durante a
                  assinatura e transmissão à
                  SEFAZ.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
            >
              Fechar
            </Button>

            {!validada && (
              <Button
                type="button"
                className="h-11"
                onClick={() =>
                  setAberto(false)
                }
              >
                Revisar NF-e
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}