"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { createRascunhoNfe } from "@/actions/nfe/create-rascunho-nfe";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Cliente = {
  id: string;
  nome: string;
  cpfCnpj: string;
};

type Natureza = {
  id: string;
  descricao: string;
  cfop: string;
};

type Props = {
  empresaId: string;

  clientes: Cliente[];

  naturezas: Natureza[];

  serieNfe: number;
};

export function NovaNfeDialog({
  empresaId,
  clientes,
  naturezas,
  serieNfe,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const [
    clienteId,
    setClienteId,
  ] = useState("");

  const [
    naturezaOperacaoId,
    setNaturezaOperacaoId,
  ] = useState("");

  const [
    informacoesComplementares,
    setInformacoesComplementares,
  ] = useState("");

  function limparFormulario() {
    setClienteId("");
    setNaturezaOperacaoId("");
    setInformacoesComplementares("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setCarregando(true);

      const resultado =
        await createRascunhoNfe({
          empresaId,

          clienteId,

          naturezaOperacaoId,

          informacoesComplementares,
        });

      if (!resultado.success) {
        alert(resultado.message);
        return;
      }

      alert(
        "Rascunho da NF-e criado com sucesso."
      );

      setAberto(false);
      limparFormulario();

      router.push(
        `/empresa/${empresaId}/nfe/${resultado.notaFiscalId}`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível criar a NF-e."
      );
    } finally {
      setCarregando(false);
    }
  }

  const podeCriar =
    clientes.length > 0 &&
    naturezas.length > 0;

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
        <Button
          type="button"
          disabled={!podeCriar}
        >
          <Plus size={17} />
          Nova NF-e
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Nova NF-e
          </DialogTitle>

          <DialogDescription>
            Crie um rascunho para depois
            adicionar os produtos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              Série da NF-e
            </p>

            <p className="text-lg font-semibold">
              {serieNfe}
            </p>
          </div>

          <div className="space-y-4">
            <select
              value={clienteId}
              onChange={(event) =>
                setClienteId(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
              required
            >
              <option value="">
                Selecione o cliente
              </option>

              {clientes.map(
                (cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nome} —{" "}
                    {cliente.cpfCnpj}
                  </option>
                )
              )}
            </select>

            <select
              value={
                naturezaOperacaoId
              }
              onChange={(event) =>
                setNaturezaOperacaoId(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
              required
            >
              <option value="">
                Selecione a natureza de operação
              </option>

              {naturezas.map(
                (natureza) => (
                  <option
                    key={natureza.id}
                    value={natureza.id}
                  >
                    {natureza.descricao} — CFOP{" "}
                    {natureza.cfop}
                  </option>
                )
              )}
            </select>

            <textarea
              placeholder="Informações complementares"
              value={
                informacoesComplementares
              }
              onChange={(event) =>
                setInformacoesComplementares(
                  event.target.value
                )
              }
              className="min-h-28 w-full resize-y rounded-md border bg-background p-3 text-sm"
              disabled={carregando}
            />
          </div>

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
                ? "Criando..."
                : "Criar rascunho"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}