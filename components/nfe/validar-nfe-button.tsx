"use client";

import { useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { validarNfe } from "@/actions/nfe/validar-nfe";

import { Button } from "@/components/ui/button";

type Props = {
  empresaId: string;
  notaFiscalId: string;

  disabled?: boolean;
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

  async function handleValidar() {
    try {
      setCarregando(true);

      const resultado =
        await validarNfe(
          empresaId,
          notaFiscalId
        );

      if (!resultado.success) {
        const mensagem = [
          "A NF-e possui os seguintes problemas:",
          "",
          ...resultado.erros.map(
            (erro, indice) =>
              `${indice + 1}. ${erro}`
          ),
        ].join("\n");

        alert(mensagem);

        return;
      }

      const avisos =
        resultado.avisos.length > 0
          ? [
              "",
              "Avisos:",
              ...resultado.avisos.map(
                (aviso, indice) =>
                  `${indice + 1}. ${aviso}`
              ),
            ].join("\n")
          : "";

      alert(
        `NF-e validada com sucesso.${avisos}`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível validar a NF-e."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleValidar}
      disabled={
        disabled ||
        carregando
      }
      className="h-12 px-6"
    >
      {carregando ? (
        <AlertTriangle size={17} />
      ) : (
        <CheckCircle2 size={17} />
      )}

      {carregando
        ? "Validando..."
        : "Validar NF-e"}
    </Button>
  );
}