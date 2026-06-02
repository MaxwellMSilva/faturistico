"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { createCliente } from "@/actions/clientes/create-cliente";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";

export function NovoClienteDialog() {
  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Novo Cliente
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Novo Cliente
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <Input
              placeholder="CPF/CNPJ"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
            />

            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <Input placeholder="CEP" />

            <Input placeholder="Logradouro" />

            <Input placeholder="Número" />

            <Input placeholder="Bairro" />

            <Input placeholder="Município" />

            <Input placeholder="UF" />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={async () => {
                if (!nome.trim()) {
                  alert("Informe o nome.");
                  return;
                }

                if (!cpfCnpj.trim()) {
                  alert("Informe o CPF/CNPJ.");
                  return;
                }

                await createCliente({
                  nome,
                  cpfCnpj,
                  email,
                  telefone,
                });

                router.refresh();

                setNome("");
                setCpfCnpj("");
                setEmail("");
                setTelefone("");

                alert("Cliente criado!");

                setOpen(false);
              }}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}