"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { createCliente } from "@/actions/clientes/create-cliente";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  empresaId: string;
};

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

const estadoInicial = {
  tipoPessoa: "JURIDICA" as TipoPessoa,

  nome: "",
  cpfCnpj: "",

  inscricaoEstadual: "",
  inscricaoMunicipal: "",
  suframa: "",

  email: "",
  telefone: "",

  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",

  municipio: "",
  codigoMunicipio: "",
  uf: "",
};

export function NovoClienteDialog({
  empresaId,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const [form, setForm] =
    useState(estadoInicial);

  function atualizarCampo(
    campo: keyof typeof estadoInicial,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function limparFormulario() {
    setForm(estadoInicial);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    const documento =
      form.cpfCnpj.replace(/\D/g, "");

    const tamanhoEsperado =
      form.tipoPessoa === "FISICA"
        ? 11
        : 14;

    if (
      documento.length !==
      tamanhoEsperado
    ) {
      alert(
        form.tipoPessoa === "FISICA"
          ? "Informe um CPF válido."
          : "Informe um CNPJ válido."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await createCliente({
          empresaId,

          tipoPessoa:
            form.tipoPessoa,

          nome: form.nome,

          cpfCnpj:
            form.cpfCnpj,

          inscricaoEstadual:
            form.inscricaoEstadual,

          inscricaoMunicipal:
            form.inscricaoMunicipal,

          suframa:
            form.suframa,

          email: form.email,
          telefone: form.telefone,

          cep: form.cep,

          logradouro:
            form.logradouro,

          numero: form.numero,

          complemento:
            form.complemento,

          bairro: form.bairro,

          municipio:
            form.municipio,

          codigoMunicipio:
            form.codigoMunicipio,

          uf: form.uf,
        });

      if (!resultado.success) {
        alert(resultado.message);
        return;
      }

      alert(
        "Cliente cadastrado com sucesso."
      );

      limparFormulario();
      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível cadastrar o cliente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor);

        if (!valor) {
          limparFormulario();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <Plus size={17} />
          Novo Cliente
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Novo Cliente
          </DialogTitle>

          <DialogDescription>
            Cadastre os dados fiscais e
            cadastrais do cliente.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <section className="space-y-4">
            <h3 className="font-semibold">
              Identificação
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={form.tipoPessoa}
                onChange={(event) =>
                  atualizarCampo(
                    "tipoPessoa",
                    event.target.value
                  )
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
                disabled={carregando}
              >
                <option value="JURIDICA">
                  Pessoa Jurídica
                </option>

                <option value="FISICA">
                  Pessoa Física
                </option>
              </select>

              <Input
                placeholder={
                  form.tipoPessoa ===
                  "FISICA"
                    ? "Nome completo"
                    : "Razão social"
                }
                value={form.nome}
                onChange={(event) =>
                  atualizarCampo(
                    "nome",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />

              <Input
                placeholder={
                  form.tipoPessoa ===
                  "FISICA"
                    ? "CPF"
                    : "CNPJ"
                }
                value={form.cpfCnpj}
                onChange={(event) =>
                  atualizarCampo(
                    "cpfCnpj",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />

              <Input
                placeholder="Inscrição Estadual"
                value={
                  form.inscricaoEstadual
                }
                onChange={(event) =>
                  atualizarCampo(
                    "inscricaoEstadual",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Inscrição Municipal"
                value={
                  form.inscricaoMunicipal
                }
                onChange={(event) =>
                  atualizarCampo(
                    "inscricaoMunicipal",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="SUFRAMA"
                value={form.suframa}
                onChange={(event) =>
                  atualizarCampo(
                    "suframa",
                    event.target.value
                  )
                }
                disabled={carregando}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold">
              Contato
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(event) =>
                  atualizarCampo(
                    "email",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Telefone"
                value={form.telefone}
                onChange={(event) =>
                  atualizarCampo(
                    "telefone",
                    event.target.value
                  )
                }
                disabled={carregando}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold">
              Endereço
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="CEP"
                value={form.cep}
                onChange={(event) =>
                  atualizarCampo(
                    "cep",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Logradouro"
                value={form.logradouro}
                onChange={(event) =>
                  atualizarCampo(
                    "logradouro",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Número"
                value={form.numero}
                onChange={(event) =>
                  atualizarCampo(
                    "numero",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Complemento"
                value={form.complemento}
                onChange={(event) =>
                  atualizarCampo(
                    "complemento",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Bairro"
                value={form.bairro}
                onChange={(event) =>
                  atualizarCampo(
                    "bairro",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Município"
                value={form.municipio}
                onChange={(event) =>
                  atualizarCampo(
                    "municipio",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="Código do Município IBGE"
                value={
                  form.codigoMunicipio
                }
                onChange={(event) =>
                  atualizarCampo(
                    "codigoMunicipio",
                    event.target.value
                  )
                }
                disabled={carregando}
              />

              <Input
                placeholder="UF"
                maxLength={2}
                value={form.uf}
                onChange={(event) =>
                  atualizarCampo(
                    "uf",
                    event.target.value
                      .toUpperCase()
                  )
                }
                disabled={carregando}
              />
            </div>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? "Cadastrando..."
                : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}