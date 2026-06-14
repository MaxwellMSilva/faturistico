"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Pencil } from "lucide-react";

import { updateCliente } from "@/actions/clientes/update-cliente";

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

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

type Cliente = {
  id: string;

  tipoPessoa: TipoPessoa;

  nome: string;
  cpfCnpj: string;

  inscricaoEstadual:
    | string
    | null;

  inscricaoMunicipal:
    | string
    | null;

  suframa: string | null;

  email: string | null;
  telefone: string | null;

  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;

  municipio: string | null;
  codigoMunicipio:
    | string
    | null;

  uf: string | null;
};

type Props = {
  empresaId: string;
  cliente: Cliente;
};

export function ClienteEditButton({
  empresaId,
  cliente,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const criarEstadoInicial = () => ({
    tipoPessoa:
      cliente.tipoPessoa,

    nome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj,

    inscricaoEstadual:
      cliente.inscricaoEstadual ?? "",

    inscricaoMunicipal:
      cliente.inscricaoMunicipal ?? "",

    suframa:
      cliente.suframa ?? "",

    email:
      cliente.email ?? "",

    telefone:
      cliente.telefone ?? "",

    cep:
      cliente.cep ?? "",

    logradouro:
      cliente.logradouro ?? "",

    numero:
      cliente.numero ?? "",

    complemento:
      cliente.complemento ?? "",

    bairro:
      cliente.bairro ?? "",

    municipio:
      cliente.municipio ?? "",

    codigoMunicipio:
      cliente.codigoMunicipio ?? "",

    uf:
      cliente.uf ?? "",
  });

  const [form, setForm] =
    useState(criarEstadoInicial);

  function atualizarCampo(
    campo: keyof ReturnType<
      typeof criarEstadoInicial
    >,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setCarregando(true);

      const resultado =
        await updateCliente({
          id: cliente.id,
          empresaId,

          ...form,
        });

      if (!resultado.success) {
        alert(resultado.message);
        return;
      }

      alert(
        "Cliente atualizado com sucesso."
      );

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível atualizar o cliente."
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

        if (valor) {
          setForm(
            criarEstadoInicial()
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
        >
          <Pencil size={16} />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Editar Cliente
          </DialogTitle>

          <DialogDescription>
            Atualize os dados cadastrais
            e fiscais do cliente.
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
                placeholder="Código Município IBGE"
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
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}