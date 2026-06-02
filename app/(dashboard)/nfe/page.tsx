import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NfePage() {
  const notas =
    await prisma.notaFiscal.findMany({
      include: {
        cliente: true,
      },

      orderBy: {
        numero: "desc",
      },
    });

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            NF-e
          </h1>

          <p className="text-muted-foreground">
            Gerencie as notas fiscais.
          </p>
        </div>

        <Link href="/nfe/nova">
          <Button>
            Nova NF-e
          </Button>
        </Link>

      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Número
              </th>

              <th className="p-4 text-left">
                Cliente
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {notas.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center"
                >
                  Nenhuma NF-e encontrada
                </td>
              </tr>
            ) : (
              notas.map((nota) => (
                <tr
                  key={nota.id}
                  className="border-t"
                >
                  <td className="p-4">
                    <Link
                      href={`/nfe/${nota.id}`}
                      className="text-primary hover:underline"
                    >
                      {nota.numero}
                    </Link>
                  </td>

                  <td className="p-4">
                    {nota.cliente.nome}
                  </td>

                  <td className="p-4">
                    {nota.status}
                  </td>

                  <td className="p-4">
                    R$ {Number(nota.valorTotal).toFixed(2)}
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