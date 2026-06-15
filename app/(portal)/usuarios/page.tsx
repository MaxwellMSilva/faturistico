import Link from "next/link";

import {
  CircleCheck,
  CircleX,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { getUsuarios } from "@/actions/usuarios/get-usuarios";
import { getDadosUsuario } from "@/actions/usuarios/get-dados-usuario";

import { NovoUsuarioDialog } from "@/components/usuarios/novo-usuario-dialog";
import { UsuarioEditDialog } from "@/components/usuarios/usuario-edit-dialog";
import { UsuarioStatusButton } from "@/components/usuarios/usuario-status-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

type Props = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

const nomesRoles: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USUARIO: "Usuário",
};

const nomesPermissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  FATURAMENTO: "Faturamento",
  OPERADOR: "Operador",
  VISUALIZADOR: "Visualizador",
};

function formatarData(
  valor: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
    }
  ).format(new Date(valor));
}

export default async function UsuariosPage({
  searchParams,
}: Props) {

  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const usuarioAtual =
    await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },

      select: {
        id: true,
        role: true,
        ativo: true,
      },
    });

  if (
    !usuarioAtual ||
    !usuarioAtual.ativo
  ) {
    redirect("/entrar");
  }

  if (
    usuarioAtual.role !== "OWNER" &&
    usuarioAtual.role !== "ADMIN"
  ) {
    redirect("/painel");
  }

  const { busca = "" } =
    await searchParams;

  const [
    usuariosRaw,
    dadosFormulario,
  ] = await Promise.all([
    getUsuarios(),
    getDadosUsuario(),
  ]);

  const termo =
    busca
      .trim()
      .toLowerCase();

  const usuarios = termo
    ? usuariosRaw.filter(
        (usuario) =>
          [
            usuario.nome,
            usuario.email,
            usuario.role,

            nomesRoles[
              usuario.role
            ],

            usuario.ativo
              ? "ativo"
              : "inativo",

            ...usuario.empresas.flatMap(
              (acesso) => [
                acesso.empresa
                  .razaoSocial,

                acesso.empresa
                  .nomeFantasia,

                acesso.permissao,

                nomesPermissoes[
                  acesso.permissao
                ],
              ]
            ),
          ].some((valor) =>
            String(valor ?? "")
              .toLowerCase()
              .includes(termo)
          )
      )
    : usuariosRaw;

  const totalAtivos =
    usuariosRaw.filter(
      (usuario) =>
        usuario.ativo
    ).length;

  const totalInativos =
    usuariosRaw.length -
    totalAtivos;

  const totalAdmins =
    usuariosRaw.filter(
      (usuario) =>
        usuario.role === "ADMIN"
    ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Cabeçalho */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Usuários
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie usuários, funções
              globais e acessos às empresas
              da plataforma.
            </p>
          </div>
        </div>

        <NovoUsuarioDialog
          empresas={
            dadosFormulario.empresas
          }
          rolesPermitidos={[
            ...dadosFormulario
              .rolesPermitidos,
          ]}
          gestorRole={
            dadosFormulario.gestor
              .role
          }
        />
      </div>

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Total de usuários"
          valor={usuariosRaw.length}
          icone={Users}
        />

        <Indicador
          titulo="Usuários ativos"
          valor={totalAtivos}
          icone={CircleCheck}
          variante="sucesso"
        />

        <Indicador
          titulo="Administradores"
          valor={totalAdmins}
          icone={ShieldCheck}
        />

        <Indicador
          titulo="Usuários inativos"
          valor={totalInativos}
          icone={CircleX}
          variante="erro"
        />
      </section>

      {/* Pesquisa */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              name="busca"
              defaultValue={busca}
              className="h-11 pl-10"
              placeholder="Buscar por nome, e-mail, função ou empresa..."
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11"
          >
            <Search size={17} />

            Buscar
          </Button>

          {busca && (
            <Button
              nativeButton={false}
              render={
                <Link href="/usuarios" />
              }
              variant="ghost"
              className="h-11"
            >
              Limpar
            </Button>
          )}
        </form>

        {busca && (
          <p className="mt-3 text-xs text-muted-foreground">
            {usuarios.length === 1
              ? "1 usuário encontrado."
              : `${usuarios.length} usuários encontrados.`}
          </p>
        )}
      </section>

      {/* Tabela */}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full min-w-[1300px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-medium">
                Usuário
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Função
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Empresas
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Cadastro
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Status
              </th>

              <th className="px-5 py-4 text-right text-sm font-medium">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhum usuário encontrado."
                    : "Nenhum usuário cadastrado."}
                </td>
              </tr>
            ) : (
              usuarios.map(
                (usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-t align-top transition-colors hover:bg-muted/20"
                  >
                    {/* Usuário */}

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted/30 font-semibold">
                          {usuario.nome
                            .trim()
                            .charAt(0)
                            .toUpperCase() ||
                            "U"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="max-w-64 truncate font-medium">
                              {usuario.nome}
                            </p>

                            {usuario.id ===
                              dadosFormulario
                                .gestor.id && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                                Você
                              </span>
                            )}
                          </div>

                          <p className="mt-1 max-w-72 truncate text-sm text-muted-foreground">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Função */}

                    <td className="px-5 py-4">
                      <RoleBadge
                        role={usuario.role}
                      />
                    </td>

                    {/* Empresas */}

                    <td className="px-5 py-4">
                      {usuario.empresas.length ===
                      0 ? (
                        <span className="text-sm text-muted-foreground">
                          Nenhuma empresa
                        </span>
                      ) : (
                        <div className="flex max-w-md flex-wrap gap-2">
                          {usuario.empresas.map(
                            (acesso) => (
                              <div
                                key={
                                  acesso.id
                                }
                                className={[
                                  "rounded-lg border px-2.5 py-1.5",
                                  acesso.ativo
                                    ? "bg-muted/20"
                                    : "bg-destructive/5 opacity-70",
                                ].join(
                                  " "
                                )}
                              >
                                <p className="max-w-52 truncate text-xs font-medium">
                                  {acesso
                                    .empresa
                                    .nomeFantasia ??
                                    acesso
                                      .empresa
                                      .razaoSocial}
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {nomesPermissoes[
                                    acesso
                                      .permissao
                                  ] ??
                                    acesso.permissao}

                                  {!acesso.ativo
                                    ? " · Acesso inativo"
                                    : ""}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </td>

                    {/* Cadastro */}

                    <td className="px-5 py-4 text-sm">
                      {formatarData(
                        usuario.createdAt
                      )}
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <StatusBadge
                        ativo={
                          usuario.ativo
                        }
                      />
                    </td>

                    {/* Ações */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {usuario.podeEditar && (
                          <UsuarioEditDialog
                            usuario={{
                              id:
                                usuario.id,

                              nome:
                                usuario.nome,

                              email:
                                usuario.email,

                              role:
                                usuario.role,

                              empresas:
                                usuario.empresas.map(
                                  (
                                    acesso
                                  ) => ({
                                    id:
                                      acesso.id,

                                    empresaId:
                                      acesso.empresaId,

                                    permissao:
                                      acesso.permissao,

                                    ativo:
                                      acesso.ativo,
                                  })
                                ),
                            }}
                            empresas={
                              dadosFormulario.empresas
                            }
                            gestorRole={
                              dadosFormulario
                                .gestor
                                .role
                            }
                            rolesPermitidos={[
                              ...dadosFormulario
                                .rolesPermitidos,
                            ]}
                          />
                        )}

                        {usuario.podeInativar && (
                          <UsuarioStatusButton
                            usuarioId={
                              usuario.id
                            }
                            usuarioNome={
                              usuario.nome
                            }
                            ativo={
                              usuario.ativo
                            }
                          />
                        )}

                        {!usuario.podeEditar &&
                          !usuario.podeInativar && (
                            <span className="inline-flex h-8 items-center text-sm text-muted-foreground">
                              Sem ações
                            </span>
                          )}
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

type IndicadorProps = {
  titulo: string;
  valor: number;

  icone: typeof Users;

  variante?:
    | "padrao"
    | "sucesso"
    | "erro";
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "erro"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {titulo}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight">
            {valor}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${classeIcone}`}
        >
          <Icone size={21} />
        </div>
      </div>
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const classe =
    role === "OWNER"
      ? "bg-violet-500/10 text-violet-700 dark:text-violet-400"
      : role === "ADMIN"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classe}`}
    >
      {role === "OWNER" ||
      role === "ADMIN" ? (
        <ShieldCheck size={13} />
      ) : (
        <UserRound size={13} />
      )}

      {nomesRoles[role] ?? role}
    </span>
  );
}

function StatusBadge({
  ativo,
}: {
  ativo: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        ativo
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive",
      ].join(" ")}
    >
      {ativo
        ? "Ativo"
        : "Inativo"}
    </span>
  );
}