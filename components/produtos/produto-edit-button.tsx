"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { updateProduto } from "@/actions/produtos/update-produto";

type Props = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  unidade: string;
  ncm: string | null;
  cfopPadrao: string | null;
  valorUnitario: number;
};

export function ProdutoEditButton({
  id,
  codigo: codigoInicial,
  descricao: descricaoInicial,
  tipo: tipoInicial,
  unidade: unidadeInicial,
  ncm: ncmInicial,
  cfopPadrao: cfopInicial,
  valorUnitario: valorInicial,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [codigo, setCodigo] = useState(codigoInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [tipo, setTipo] = useState(tipoInicial);
  const [unidade, setUnidade] = useState(unidadeInicial);
  const [ncm, setNcm] = useState(ncmInicial ?? "");
  const [cfop, setCfop] = useState(cfopInicial ?? "");
  const [valor, setValor] = useState(
    valorInicial.toString()
  );

  async function handleSave() {
    if (!codigo.trim()) {
      alert("Informe o código.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    await updateProduto({
      id,
      codigo,
      descricao,
      tipo: tipo as "PRODUTO" | "SERVICO",
      unidade,
      ncm,
      cfopPadrao: cfop,
      valorUnitario: Number(valor),
    });

    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
      >
        Editar
      </button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Editar Produto
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Código"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value)
              }
            />

            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value)
              }
            />

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
              }
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
              onChange={(e) =>
                setUnidade(e.target.value)
              }
            />

            <Input
              placeholder="NCM"
              value={ncm}
              onChange={(e) =>
                setNcm(e.target.value)
              }
            />

            <Input
              placeholder="CFOP"
              value={cfop}
              onChange={(e) =>
                setCfop(e.target.value)
              }
            />

            <Input
              type="number"
              placeholder="Valor Unitário"
              value={valor}
              onChange={(e) =>
                setValor(e.target.value)
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}