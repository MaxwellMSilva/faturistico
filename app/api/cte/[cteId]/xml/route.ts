import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      cteId: string;
    }>;
  }
) {
  const { cteId } =
    await context.params;

  const cte =
    await prisma.conhecimentoTransporte.findUnique({
      where: { id: cteId },
      select: {
        empresaId: true,
        numero: true,
        serie: true,
        xmlAutorizado: true,
        xmlAssinado: true,
        xmlGerado: true,
      },
    });

  if (!cte) {
    return new Response(
      "CT-e não encontrado.",
      { status: 404 }
    );
  }

  try {
    await validarPrivilegioEmpresa(
      cte.empresaId,
      PrivilegioEmpresa.CTE_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );
  } catch {
    return new Response(
      "Acesso não autorizado.",
      { status: 403 }
    );
  }

  const xml =
    cte.xmlAutorizado ??
    cte.xmlAssinado ??
    cte.xmlGerado;

  if (!xml) {
    return new Response(
      "O XML do CT-e ainda não foi gerado.",
      { status: 404 }
    );
  }

  const nome =
    `cte-${String(cte.numero).padStart(9, "0")}-serie-${cte.serie}.xml`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type":
        "application/xml; charset=utf-8",
      "Content-Disposition":
        `attachment; filename="${nome}"`,
      "Cache-Control":
        "private, no-store, max-age=0",
    },
  });
}
