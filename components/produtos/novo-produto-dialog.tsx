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

import { createProduto } from "@/actions/produtos/create-produto";

export function NovoProdutoDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("PRODUTO");
  const [unidade, setUnidade] = useState("UN");
  const [ncm, setNcm] = useState("");
  const [cfop, setCfop] = useState("");
  const [valor, setValor] = useState("");

  async function handleSave() {
    if (!codigo.trim()) {
      alert("Informe o código.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    await createProduto({
      codigo,
      descricao,
      tipo: tipo as "PRODUTO" | "SERVICO",
      unidade,
      ncm,
      cfopPadrao: cfop,
      valorUnitario: Number(valor),
    });

    router.refresh();

    setCodigo("");
    setDescricao("");
    setTipo("PRODUTO");
    setUnidade("UN");
    setNcm("");
    setCfop("");
    setValor("");

    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Novo Produto
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Novo Produto
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">

            <Input
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />

            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="h-10 rounded-md border px-3"
            >
              <option value="PRODUTO">
                Produto
              </option>

              <option value="SERVICO">
                Serviço
              </option>
            </select>

            <Input
              placeholder="Unidade"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
            />

            <Input
              placeholder="NCM"
              value={ncm}
              onChange={(e) => setNcm(e.target.value)}
            />

            <Input
              placeholder="CFOP"
              value={cfop}
              onChange={(e) => setCfop(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Valor Unitário"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />

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