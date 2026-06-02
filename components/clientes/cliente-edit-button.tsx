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

import { updateCliente } from "@/actions/clientes/update-cliente";

type Props = {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string | null;
  telefone: string | null;
};

export function ClienteEditButton({
  id,
  nome: nomeInicial,
  cpfCnpj: cpfCnpjInicial,
  email: emailInicial,
  telefone: telefoneInicial,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState(nomeInicial);
  const [cpfCnpj, setCpfCnpj] = useState(cpfCnpjInicial);
  const [email, setEmail] = useState(emailInicial ?? "");
  const [telefone, setTelefone] = useState(
    telefoneInicial ?? ""
  );

  async function handleSave() {
    if (!nome.trim()) {
      alert("Informe o nome.");
      return;
    }

    if (!cpfCnpj.trim()) {
      alert("Informe o CPF/CNPJ.");
      return;
    }

    await updateCliente({
      id,
      nome,
      cpfCnpj,
      email,
      telefone,
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Editar Cliente
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Nome"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
            />

            <Input
              placeholder="CPF/CNPJ"
              value={cpfCnpj}
              onChange={(e) =>
                setCpfCnpj(e.target.value)
              }
            />

            <Input
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <Input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) =>
                setTelefone(e.target.value)
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