import { getNaturezasOperacao } from "@/actions/naturezas-operacao/get-natureza-operacao";
import { NaturezaOperacaoDeleteButton } from "@/components/naturezas-operacao/natureza-operacao-delete-button";
import { NaturezaOperacaoEditButton } from "@/components/naturezas-operacao/natureza-operacao-edit-button";
import { NovaNaturezaOperacaoDialog } from "@/components/naturezas-operacao/nova-natureza-operacao-dialog";

import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function NaturezasOperacaoPage() {
  const naturezas = await getNaturezasOperacao();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Naturezas de Operação
        </h1>

        <p className="text-muted-foreground">
          Configure as operações fiscais utilizadas na emissão de NF-e.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de Naturezas
          </p>

          <h2 className="text-3xl font-bold">
            {naturezas.length}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar natureza..."
          className="max-w-sm"
        />

        <NovaNaturezaOperacaoDialog />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full">
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
                Consumidor Final
              </th>

              <th className="p-4 text-left">
                Contribuinte ICMS
              </th>

              <th className="p-4 text-left">
                Ativo
              </th>

              <th className="p-4 text-left">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {naturezas.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nenhuma natureza cadastrada
                </td>
              </tr>
            ) : (
              naturezas.map((natureza) => (
                <tr
                  key={natureza.id}
                  className="border-t hover:bg-muted/20"
                >
                  <td className="p-4">
                    {natureza.descricao}
                  </td>

                  <td className="p-4">
                    {natureza.cfop}
                  </td>

                  <td className="p-4">
                    {natureza.ativo ? "Sim" : "Não"}
                  </td>

                  <td className="p-4">
                    {natureza.finalidadeNfe}
                  </td>

                  <td className="p-4">
                    {natureza.consumidorFinal ? "Sim" : "Não"}
                  </td>

                  <td className="p-4">
                    {natureza.contribuinteIcms ? "Sim" : "Não"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">

                      <NaturezaOperacaoEditButton
                        id={natureza.id}
                        descricao={natureza.descricao}
                        cfop={natureza.cfop}
                        finalidadeNfe={natureza.finalidadeNfe}
                        consumidorFinal={natureza.consumidorFinal}
                        contribuinteIcms={natureza.contribuinteIcms}
                      />

                      <NaturezaOperacaoDeleteButton
                        id={natureza.id}
                        descricao={natureza.descricao}
                      />

                    </div>
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