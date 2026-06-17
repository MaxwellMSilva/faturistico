import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

import { EmpresaHeader } from "@/components/empresa-ambiente/empresa-header";
import { EmpresaSidebar } from "@/components/empresa-ambiente/empresa-sidebar";

export const dynamic =
  "force-dynamic";

type Props = {
  children: React.ReactNode;

  params: Promise<{
    empresaId: string;
  }>;
};

export default async function EmpresaLayout({
  children,
  params,
}: Props) {
  const { empresaId } =
    await params;

  const {
    empresa,
    acesso,
    session,
  } = await getContextoEmpresa(
    empresaId
  );

  const empresaNome =
    empresa.nomeFantasia ??
    empresa.razaoSocial;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <EmpresaSidebar
        empresaId={empresa.id}
        empresaNome={empresaNome}
        usuarioNome={
          session.user.name ??
          "Usuário"
        }
        usuarioEmail={
          session.user.email ??
          undefined
        }
        permissao={
          acesso.permissao
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <EmpresaHeader
          empresaNome={empresaNome}
          usuarioNome={
            session.user.name ??
            "Usuário"
          }
        />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}