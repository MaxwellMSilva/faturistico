"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createNaturezaOperacao } from "@/actions/naturezas-operacao/create-natureza-operacao";

export function NovaNaturezaOperacaoDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [descricao, setDescricao] = useState("");
  const [cfop, setCfop] = useState("");

  const [finalidadeNfe, setFinalidadeNfe] =
    useState("NORMAL");

  const [consumidorFinal, setConsumidorFinal] =
    useState(false);

  const [contribuinteIcms, setContribuinteIcms] =
    useState(true);

  async function handleSave() {
    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    if (!cfop.trim()) {
      alert("Informe o CFOP.");
      return;
    }

    await createNaturezaOperacao({
      descricao,
      cfop,

      finalidadeNfe: finalidadeNfe as
        | "NORMAL"
        | "COMPLEMENTAR"
        | "AJUSTE"
        | "DEVOLUCAO",

      consumidorFinal,

      contribuinteIcms,
    });

    setDescricao("");
    setCfop("");
    setFinalidadeNfe("NORMAL");
    setConsumidorFinal(false);
    setContribuinteIcms(true);

    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Nova Natureza
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Nova Natureza de Operação
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">

            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value)
              }
            />

            <Input
              placeholder="CFOP"
              value={cfop}
              onChange={(e) =>
                setCfop(e.target.value)
              }
            />

            <select
              value={finalidadeNfe}
              onChange={(e) =>
                setFinalidadeNfe(e.target.value)
              }
              className="h-10 rounded-md border px-3"
            >
              <option value="NORMAL">
                Normal
              </option>

              <option value="COMPLEMENTAR">
                Complementar
              </option>

              <option value="AJUSTE">
                Ajuste
              </option>

              <option value="DEVOLUCAO">
                Devolução
              </option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={consumidorFinal}
                onChange={(e) =>
                  setConsumidorFinal(
                    e.target.checked
                  )
                }
              />

              Consumidor Final
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={contribuinteIcms}
                onChange={(e) =>
                  setContribuinteIcms(
                    e.target.checked
                  )
                }
              />

              Contribuinte de ICMS
            </label>

          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}