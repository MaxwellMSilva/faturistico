"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  Settings,
  ChevronDown,
  FolderOpen,
} from "lucide-react";

import { useSidebarStore } from "@/lib/sidebar-store";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebarStore();

  const [cadastrosOpen, setCadastrosOpen] = useState(true);
  const [fiscalOpen, setFiscalOpen] = useState(true);

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
      <div className="border-r border-sidebar-border p-4">
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
            <button
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
              className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <FolderOpen size={16} />
                Cadastros
              </div>

              <ChevronDown
                size={16}
                className={`transition ${
                  cadastrosOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {cadastrosOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <MenuItem
                  href="/empresas"
                  icon={<Building2 size={16} />}
                  label="Empresas"
                  active={pathname === "/empresas"}
                  collapsed={false}
                />

                <MenuItem
                  href="/clientes"
                  icon={<Users size={16} />}
                  label="Clientes"
                  active={pathname === "/clientes"}
                  collapsed={false}
                />

                <MenuItem
                  href="/produtos"
                  icon={<Package size={16} />}
                  label="Produtos"
                  active={pathname === "/produtos"}
                  collapsed={false}
                />
              </div>
            )}

            <button
              onClick={() => setFiscalOpen(!fiscalOpen)}
              className="mt-4 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Fiscal
              </div>

              <ChevronDown
                size={16}
                className={`transition ${
                  fiscalOpen ? "rotate-180" : ""
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

            <div className="mt-4">
              <MenuItem
                href="/configuracoes"
                icon={<Settings size={18} />}
                label="Configurações"
                active={pathname === "/configuracoes"}
                collapsed={false}
              />
            </div>
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

      {!collapsed && <span>{label}</span>}
    </Link>
  );
}