"use client";

import type {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  Eye,
  LoaderCircle,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { createUsuario } from "@/actions/usuarios/create-usuario";

import {
  PrivilegiosEmpresaTree,
  type GrupoPrivilegioProp,
} from "@/components/usuarios/privilegios-empresa-tree";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RoleUsuario =
  | "ADMIN"
  | "USUARIO";

type PermissaoEmpresa =
  | "ADMIN"
  | "PERSONALIZADO"
  | "VISUALIZADOR";

type Empresa = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string | null;

  cnpj: string;
};

type AcessoFormulario = {
  permissao:
    PermissaoEmpresa;

  privilegios:
    PrivilegioEmpresa[];
};

type Props = {
  empresas: Empresa[];

  rolesPermitidos:
    RoleUsuario[];

  gestorRole:
    | "OWNER"
    | "ADMIN";

  arvorePrivilegios:
    GrupoPrivilegioProp[];
};

function somenteNumeros(
  valor: string
) {
  return valor.replace(
    /\D/g,
    ""
  );
}

function formatarCnpj(
  valor: string
) {
  const numeros =
    somenteNumeros(valor);

  if (
    numeros.length !== 14
  ) {
    return valor;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function obterRoleInicial(
  rolesPermitidos:
    RoleUsuario[]
): RoleUsuario {
  if (
    rolesPermitidos.includes(
      "USUARIO"
    )
  ) {
    return "USUARIO";
  }

  return (
    rolesPermitidos[0] ??
    "USUARIO"
  );
}

export function NovoUsuarioDialog({
  empresas,
  rolesPermitidos,
  gestorRole,
  arvorePrivilegios,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [role, setRole] =
    useState<RoleUsuario>(
      obterRoleInicial(
        rolesPermitidos
      )
    );

  const [acessos, setAcessos] =
    useState<
      Record<
        string,
        AcessoFormulario
      >
    >({});

  function limparFormulario() {
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");

    setRole(
      obterRoleInicial(
        rolesPermitidos
      )
    );

    setAcessos({});
    setErro("");
  }

  function alterarRole(
    novaRole: RoleUsuario
  ) {
    setRole(novaRole);

    setAcessos((anteriores) => {
      const novosAcessos: Record<
        string,
        AcessoFormulario
      > = {};

      Object.keys(
        anteriores
      ).forEach((empresaId) => {
        novosAcessos[empresaId] = {
          permissao:
            novaRole === "ADMIN"
              ? "ADMIN"
              : "VISUALIZADOR",

          privilegios: [],
        };
      });

      return novosAcessos;
    });

    setErro("");
  }

  function alternarEmpresa(
    empresaId: string
  ) {
    setAcessos((anteriores) => {
      if (
        anteriores[empresaId]
      ) {
        const novos = {
          ...anteriores,
        };

        delete novos[empresaId];

        return novos;
      }

      return {
        ...anteriores,

        [empresaId]: {
          permissao:
            role === "ADMIN"
              ? "ADMIN"
              : "VISUALIZADOR",

          privilegios: [],
        },
      };
    });

    setErro("");
  }

  function alterarPermissao(
    empresaId: string,
    permissao:
      PermissaoEmpresa
  ) {
    setAcessos((anteriores) => ({
      ...anteriores,

      [empresaId]: {
        permissao,

        privilegios:
          permissao ===
          "PERSONALIZADO"
            ? anteriores[
                empresaId
              ]?.privilegios ??
              []
            : [],
      },
    }));

    setErro("");
  }

  function alterarPrivilegios(
    empresaId: string,
    privilegios:
      PrivilegioEmpresa[]
  ) {
    setAcessos((anteriores) => {
      const acesso =
        anteriores[empresaId];

      if (!acesso) {
        return anteriores;
      }

      return {
        ...anteriores,

        [empresaId]: {
          ...acesso,
          privilegios,
        },
      };
    });

    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const nomeNormalizado =
      nome.trim();

    const emailNormalizado =
      email
        .trim()
        .toLowerCase();

    if (!nomeNormalizado) {
      setErro(
        "Informe o nome do usuário."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailNormalizado
      )
    ) {
      setErro(
        "Informe um e-mail válido."
      );

      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (
      senha !==
      confirmarSenha
    ) {
      setErro(
        "As senhas não conferem."
      );

      return;
    }

    const acessosSelecionados =
      Object.entries(
        acessos
      ).map(
        ([
          empresaId,
          acesso,
        ]) => ({
          empresaId,

          permissao:
            acesso.permissao,

          privilegios:
            acesso.privilegios,
        })
      );

    if (
      acessosSelecionados.length ===
      0
    ) {
      setErro(
        "Selecione pelo menos uma empresa."
      );

      return;
    }

    const acessoPersonalizadoSemPrivilegios =
      acessosSelecionados.find(
        (acesso) =>
          acesso.permissao ===
            "PERSONALIZADO" &&
          acesso.privilegios.length ===
            0
      );

    if (
      acessoPersonalizadoSemPrivilegios
    ) {
      const empresa =
        empresas.find(
          (item) =>
            item.id ===
            acessoPersonalizadoSemPrivilegios.empresaId
        );

      setErro(
        `Selecione pelo menos um privilégio para a empresa "${
          empresa?.nomeFantasia ??
          empresa?.razaoSocial ??
          "selecionada"
        }".`
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await createUsuario({
          nome:
            nomeNormalizado,

          email:
            emailNormalizado,

          senha,

          role,

          acessos:
            acessosSelecionados,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);
      limparFormulario();

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao cadastrar usuário:",
        error
      );

      setErro(
        "Não foi possível cadastrar o usuário."
      );
    } finally {
      setCarregando(false);
    }
  }

  const usuarioAdministrador =
    role === "ADMIN";

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (!valor) {
          limparFormulario();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            className="h-11"
          />
        }
      >
        <Plus size={17} />

        Novo usuário
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Novo usuário
          </DialogTitle>

          <DialogDescription>
            Cadastre o usuário e defina
            seus acessos em cada empresa.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Dados do usuário
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Informe os dados de
                  acesso à plataforma.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="nomeUsuario"
                  className="text-sm font-medium"
                >
                  Nome completo
                </label>

                <Input
                  id="nomeUsuario"
                  className="h-11"
                  value={nome}
                  onChange={(event) => {
                    setNome(
                      event.target.value
                    );

                    setErro("");
                  }}
                  placeholder="Nome completo"
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="emailUsuario"
                  className="text-sm font-medium"
                >
                  E-mail
                </label>

                <Input
                  id="emailUsuario"
                  type="email"
                  className="h-11"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    setErro("");
                  }}
                  placeholder="usuario@empresa.com.br"
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="roleUsuario"
                  className="text-sm font-medium"
                >
                  Função na plataforma
                </label>

                <select
                  id="roleUsuario"
                  value={role}
                  onChange={(event) =>
                    alterarRole(
                      event.target
                        .value as RoleUsuario
                    )
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={
                    carregando ||
                    rolesPermitidos.length <=
                      1
                  }
                >
                  {rolesPermitidos.includes(
                    "ADMIN"
                  ) && (
                    <option value="ADMIN">
                      Administrador
                    </option>
                  )}

                  {rolesPermitidos.includes(
                    "USUARIO"
                  ) && (
                    <option value="USUARIO">
                      Usuário
                    </option>
                  )}
                </select>

                {gestorRole ===
                  "ADMIN" && (
                  <p className="text-xs text-muted-foreground">
                    Administradores podem
                    cadastrar apenas usuários
                    comuns.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="senhaUsuario"
                  className="text-sm font-medium"
                >
                  Senha inicial
                </label>

                <Input
                  id="senhaUsuario"
                  type="password"
                  className="h-11"
                  value={senha}
                  onChange={(event) => {
                    setSenha(
                      event.target.value
                    );

                    setErro("");
                  }}
                  placeholder="Mínimo de 6 caracteres"
                  disabled={carregando}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmarSenhaUsuario"
                  className="text-sm font-medium"
                >
                  Confirmar senha
                </label>

                <Input
                  id="confirmarSenhaUsuario"
                  type="password"
                  className="h-11"
                  value={confirmarSenha}
                  onChange={(event) => {
                    setConfirmarSenha(
                      event.target.value
                    );

                    setErro("");
                  }}
                  placeholder="Repita a senha"
                  disabled={carregando}
                  minLength={6}
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Acesso às empresas
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione as empresas e
                  configure o tipo de acesso.
                </p>
              </div>
            </div>

            {empresas.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhuma empresa ativa
                disponível.
              </div>
            ) : (
              <div className="space-y-4">
                {empresas.map(
                  (empresa) => {
                    const acesso =
                      acessos[
                        empresa.id
                      ];

                    const selecionada =
                      Boolean(acesso);

                    return (
                      <article
                        key={empresa.id}
                        className={[
                          "rounded-xl border transition-colors",
                          selecionada
                            ? "border-primary/40 bg-primary/5"
                            : "bg-background",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 accent-primary"
                              checked={
                                selecionada
                              }
                              onChange={() =>
                                alternarEmpresa(
                                  empresa.id
                                )
                              }
                              disabled={
                                carregando
                              }
                            />

                            <span>
                              <span className="block font-medium">
                                {empresa.nomeFantasia ??
                                  empresa.razaoSocial}
                              </span>

                              <span className="mt-1 block text-xs text-muted-foreground">
                                {
                                  empresa.razaoSocial
                                }
                                {" · "}
                                {formatarCnpj(
                                  empresa.cnpj
                                )}
                              </span>
                            </span>
                          </label>

                          {selecionada && (
                            <div className="w-full sm:w-64">
                              {usuarioAdministrador ? (
                                <div className="flex h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm">
                                  <ShieldCheck
                                    size={16}
                                    className="text-primary"
                                  />

                                  Administrador
                                </div>
                              ) : (
                                <select
                                  value={
                                    acesso.permissao
                                  }
                                  onChange={(event) =>
                                    alterarPermissao(
                                      empresa.id,
                                      event
                                        .target
                                        .value as PermissaoEmpresa
                                    )
                                  }
                                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                  disabled={
                                    carregando
                                  }
                                >
                                  <option value="VISUALIZADOR">
                                    Visualizador
                                  </option>

                                  <option value="PERSONALIZADO">
                                    Personalizado
                                  </option>
                                </select>
                              )}
                            </div>
                          )}
                        </div>

                        {selecionada &&
                          acesso.permissao ===
                            "VISUALIZADOR" && (
                            <div className="flex items-start gap-3 border-t px-4 py-3">
                              <Eye
                                size={17}
                                className="mt-0.5 shrink-0 text-muted-foreground"
                              />

                              <p className="text-xs leading-5 text-muted-foreground">
                                O visualizador pode
                                consultar os módulos,
                                mas não pode criar,
                                editar, excluir,
                                validar ou emitir
                                documentos.
                              </p>
                            </div>
                          )}

                        {selecionada &&
                          acesso.permissao ===
                            "PERSONALIZADO" && (
                            <div className="space-y-4 border-t p-4">
                              <div className="flex items-start gap-3">
                                <SlidersHorizontal
                                  size={18}
                                  className="mt-0.5 shrink-0 text-primary"
                                />

                                <div>
                                  <p className="text-sm font-medium">
                                    Configure os
                                    privilégios
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Escolha exatamente
                                    o que este usuário
                                    poderá fazer nesta
                                    empresa.
                                  </p>
                                </div>
                              </div>

                              <PrivilegiosEmpresaTree
                                grupos={
                                  arvorePrivilegios
                                }
                                selecionados={
                                  acesso.privilegios
                                }
                                onChange={(
                                  privilegios
                                ) =>
                                  alterarPrivilegios(
                                    empresa.id,
                                    privilegios
                                  )
                                }
                                disabled={
                                  carregando
                                }
                              />
                            </div>
                          )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {erro && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-11 sm:min-w-48"
              disabled={
                carregando ||
                empresas.length === 0
              }
            >
              {carregando ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Cadastrando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Cadastrar usuário
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}