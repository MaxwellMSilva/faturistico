import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

import { EmpresaHeader } from "@/components/empresa-ambiente/empresa-header";
import { EmpresaSidebar } from "@/components/empresa-ambiente/empresa-sidebar";
import { EmpresaMobileSidebar } from "@/components/empresa-ambiente/empresa-mobile-sidebar";

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

  const usuarioNome =
    session.user?.name ??
    "Usuário";

  const usuarioEmail =
    session.user?.email ??
    undefined;

  const propriedadesSidebar = {
    empresaId:
      empresa.id,

    empresaNome,

    usuarioNome,

    usuarioEmail,

    permissao:
      acesso.permissao,
  };

  return (
    <div className="empresa-shell flex h-screen overflow-hidden">
      {/* Sidebar desktop */}

      <EmpresaSidebar
        {...propriedadesSidebar}
        variante="desktop"
      />

      <div className="empresa-main flex min-w-0 flex-1 flex-col">
        {/* Sidebar mobile */}

        <EmpresaMobileSidebar
          {...propriedadesSidebar}
        />

        <EmpresaHeader
          empresaNome={
            empresaNome
          }
          usuarioNome={
            usuarioNome
          }
          usuarioEmail={
            usuarioEmail
          }
          permissao={
            acesso.permissao
          }
        />

        <main className="w-full flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
