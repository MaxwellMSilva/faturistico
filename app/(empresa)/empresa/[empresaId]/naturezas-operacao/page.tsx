import {
  ClipboardList,
  Search,
} from "lucide-react";

import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-naturezas-operacao";

import { NaturezaOperacaoDialog } from "@/components/naturezas-operacao/natureza-operacao-dialog";
import { NaturezaDeleteButton } from "@/components/naturezas-operacao/natureza-delete-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const finalidades: Record<
  string,
  string
> = {
  NORMAL: "Normal",
  COMPLEMENTAR: "Complementar",
  AJUSTE: "Ajuste",
  DEVOLUCAO: "Devolução",
};

export default async function NaturezasOperacaoPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const naturezasRaw =
    await getNaturezasOperacao(
      empresaId
    );

  const termo =
    busca.trim().toLowerCase();

  const naturezas = termo
    ? naturezasRaw.filter(
        (natureza) =>
          [
            natureza.descricao,
            natureza.cfop,
            natureza.finalidadeNfe,
          ].some((valor) =>
            valor
              .toLowerCase()
              .includes(termo)
          )
      )
    : naturezasRaw;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Naturezas de Operação
          </h1>

          <p className="text-muted-foreground">
            Gerencie as operações fiscais desta empresa.
          </p>
        </div>

        <NaturezaOperacaoDialog
          empresaId={empresaId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de Naturezas
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {naturezasRaw.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList
                size={22}
              />
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
          placeholder="Buscar por descrição, CFOP ou finalidade..."
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
        <table className="w-full min-w-[1050px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Descrição
              </th>

              <th className="p-4 text-left">
                CFOP
              </th>

              <th className="p-4 text-left">
                Finalidade
              </th>

              <th className="p-4 text-left">
                Consumidor final
              </th>

              <th className="p-4 text-left">
                Contribuinte ICMS
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
            {naturezas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhuma natureza encontrada."
                    : "Nenhuma natureza de operação cadastrada nesta empresa."}
                </td>
              </tr>
            ) : (
              naturezas.map(
                (natureza) => (
                  <tr
                    key={natureza.id}
                    className="border-t transition-colors hover:bg-muted/20"
                  >
                    <td className="p-4 font-medium">
                      {natureza.descricao}
                    </td>

                    <td className="p-4">
                      {natureza.cfop}
                    </td>

                    <td className="p-4">
                      {finalidades[
                        natureza.finalidadeNfe
                      ] ??
                        natureza.finalidadeNfe}
                    </td>

                    <td className="p-4">
                      {natureza.consumidorFinal
                        ? "Sim"
                        : "Não"}
                    </td>

                    <td className="p-4">
                      {natureza.contribuinteIcms
                        ? "Sim"
                        : "Não"}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          natureza.ativo
                            ? "inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {natureza.ativo
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <NaturezaOperacaoDialog
                          empresaId={
                            empresaId
                          }
                          natureza={{
                            id:
                              natureza.id,

                            descricao:
                              natureza.descricao,

                            cfop:
                              natureza.cfop,

                            finalidadeNfe:
                              natureza.finalidadeNfe,

                            consumidorFinal:
                              natureza.consumidorFinal,

                            contribuinteIcms:
                              natureza.contribuinteIcms,

                            ativo:
                              natureza.ativo,
                          }}
                        />

                        <NaturezaDeleteButton
                          empresaId={
                            empresaId
                          }
                          naturezaId={
                            natureza.id
                          }
                          descricao={
                            natureza.descricao
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}