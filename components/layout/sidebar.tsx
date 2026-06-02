"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  ChevronDown,
  FolderOpen,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { useSidebarStore } from "@/lib/sidebar-store";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebarStore();

  const [cadastrosOpen, setCadastrosOpen] = useState(true);
  const [fiscalOpen, setFiscalOpen] = useState(true);
  const [configuracoesOpen, setConfiguracoesOpen] =
    useState(true);

  return (
    <aside
      className={`
        border-r
        bg-background
        transition-all
        duration-300
        overflow-y-auto
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="border-b border-sidebar-border p-4">
        <h2 className="font-bold">
          {collapsed ? "F" : "Faturístico"}
        </h2>
      </div>

      <nav className="p-2">

        <MenuItem
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
          collapsed={collapsed}
        />

        {!collapsed && (
          <>
            {/* CADASTROS */}

            <button
              onClick={() =>
                setCadastrosOpen(!cadastrosOpen)
              }
              className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <FolderOpen size={16} />
                Cadastros
              </div>

              <ChevronDown
                size={16}
                className={`transition ${
                  cadastrosOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {cadastrosOpen && (
              <div className="ml-4 mt-1 space-y-1">

                <MenuItem
                  href="/clientes"
                  icon={<Users size={16} />}
                  label="Clientes"
                  active={
                    pathname === "/clientes"
                  }
                  collapsed={false}
                />

                <MenuItem
                  href="/produtos"
                  icon={<Package size={16} />}
                  label="Produtos"
                  active={
                    pathname === "/produtos"
                  }
                  collapsed={false}
                />

                <MenuItem
                  href="/naturezas-operacao"
                  icon={<FileText size={16} />}
                  label="Naturezas de Operação"
                  active={
                    pathname ===
                    "/naturezas-operacao"
                  }
                  collapsed={false}
                />
              </div>
            )}

            {/* FISCAL */}

            <button
              onClick={() =>
                setFiscalOpen(!fiscalOpen)
              }
              className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Fiscal
              </div>

              <ChevronDown
                size={16}
                className={`transition ${
                  fiscalOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {fiscalOpen && (
              <div className="ml-4 mt-1 space-y-1">

                <MenuItem
                  href="/nfe"
                  icon={<FileText size={16} />}
                  label="NF-e"
                  active={pathname === "/nfe"}
                  collapsed={false}
                />

              </div>
            )}

            {/* CONFIGURAÇÕES */}

            <button
              onClick={() =>
                setConfiguracoesOpen(
                  !configuracoesOpen
                )
              }
              className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} />
                Configurações
              </div>

              <ChevronDown
                size={16}
                className={`transition ${
                  configuracoesOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {configuracoesOpen && (
              <div className="ml-4 mt-1 space-y-1">

                <MenuItem
                  href="/configuracoes/empresa"
                  icon={<Building2 size={16} />}
                  label="Empresa"
                  active={
                    pathname ===
                    "/configuracoes/empresa"
                  }
                  collapsed={false}
                />

                <MenuItem
                  href="/configuracoes/certificado"
                  icon={
                    <ShieldCheck size={16} />
                  }
                  label="Certificado Digital"
                  active={
                    pathname ===
                    "/configuracoes/certificado"
                  }
                  collapsed={false}
                />

              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}

function MenuItem({
  href,
  icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2
        transition-colors
        ${
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        }
      `}
    >
      {icon}

      {!collapsed && (
        <span>{label}</span>
      )}
    </Link>
  );
}