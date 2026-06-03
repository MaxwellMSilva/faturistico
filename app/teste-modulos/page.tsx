// app/assinaturas/page.tsx

import { prisma } from "@/lib/prisma";

export default async function Page() {
  const assinaturas =
    await prisma.assinatura.findMany({
      include: {
        usuario: true,
        modulos: {
          include: {
            modulo: true,
          },
        },
      },
    });

  return (
    <pre>
      {JSON.stringify(
        assinaturas,
        null,
        2
      )}
    </pre>
  );
}