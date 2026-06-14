import {
  FileText,
  Search,
} from "lucide-react";

import { getNotasFiscais } from "@/actions/nfe/get-notas-fiscais";
import { getDadosNovaNfe } from "@/actions/nfe/get-dados-nova-nfe";

import { NovaNfeDialog } from "@/components/nfe/nova-nfe-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
  }>;
};

const statusLabel: Record<
  string,
  string
> = {
  RASCUNHO: "Rascunho",
  VALIDANDO: "Validando",
  AUTORIZADA: "Autorizada",
  REJEITADA: "Rejeitada",
  CANCELADA: "Cancelada",
};

function formatarValor(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function formatarData(
  valor: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(valor));
}

export default async function NfePage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const [
    notasRaw,
    dadosNovaNfe,
  ] = await Promise.all([
    getNotasFiscais(
      empresaId
    ),

    getDadosNovaNfe(
      empresaId
    ),
  ]);

  const termo =
    busca.trim().toLowerCase();

  const notas = termo
    ? notasRaw.filter((nota) =>
        [
          String(nota.numero),
          String(nota.serie),
          nota.clienteNome,
          nota.clienteDocumento,
          nota.status,
        ].some((valor) =>
          valor
            .toLowerCase()
            .includes(termo)
        )
      )
    : notasRaw;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            NF-e
          </h1>

          <p className="text-muted-foreground">
            Gerencie as notas fiscais eletrônicas desta empresa.
          </p>
        </div>

        <NovaNfeDialog
          empresaId={empresaId}
          clientes={
            dadosNovaNfe.clientes
          }
          naturezas={
            dadosNovaNfe.naturezas
          }
          serieNfe={
            dadosNovaNfe.serieNfe
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de NF-e
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {notasRaw.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={22} />
            </div>
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="flex max-w-xl gap-2"
      >
        <Input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por número, cliente, documento ou status..."
        />

        <Button
          type="submit"
          variant="outline"
        >
          <Search size={17} />
          Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Número
              </th>

              <th className="p-4 text-left">
                Cliente
              </th>

              <th className="p-4 text-left">
                Emissão
              </th>

              <th className="p-4 text-left">
                Itens
              </th>

              <th className="p-4 text-left">
                Valor
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {notas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhuma NF-e encontrada."
                    : "Nenhuma NF-e cadastrada nesta empresa."}
                </td>
              </tr>
            ) : (
              notas.map((nota) => (
                <tr
                  key={nota.id}
                  className="border-t transition-colors hover:bg-muted/20"
                >
                  <td className="p-4 font-medium">
                    {nota.numero}/
                    {nota.serie}
                  </td>

                  <td className="p-4">
                    <p className="font-medium">
                      {nota.clienteNome}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {nota.clienteDocumento}
                    </p>
                  </td>

                  <td className="p-4">
                    {formatarData(
                      nota.dataEmissao
                    )}
                  </td>

                  <td className="p-4">
                    {nota.quantidadeItens}
                  </td>

                  <td className="p-4">
                    {formatarValor(
                      nota.valorTotal
                    )}
                  </td>

                  <td className="p-4">
                    {statusLabel[
                      nota.status
                    ] ?? nota.status}
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/empresa/${empresaId}/nfe/${nota.id}`}
                        />
                      }
                    >
                      Abrir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}