"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  LoaderCircle,
  Plus,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createUsuario } from "@/actions/usuarios/create-usuario";

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
  | "FATURAMENTO"
  | "OPERADOR"
  | "VISUALIZADOR";

type Empresa = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string | null;

  cnpj: string;
};

type Props = {
  empresas: Empresa[];

  rolesPermitidos:
    RoleUsuario[];

  gestorRole:
    | "OWNER"
    | "ADMIN";
};

const nomesPermissoes: Record<
  PermissaoEmpresa,
  string
> = {
  ADMIN: "Administrador",
  FATURAMENTO: "Faturamento",
  OPERADOR: "Operador",
  VISUALIZADOR: "Visualizador",
};

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

function formatarCnpj(
  valor: string
) {
  const numeros =
    somenteNumeros(valor);

  if (numeros.length !== 14) {
    return valor;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function obterRoleInicial(
  rolesPermitidos: RoleUsuario[]
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

  /*
   * Quando uma empresa está selecionada,
   * seu ID existe neste objeto.
   */

  const [acessos, setAcessos] =
    useState<
      Record<
        string,
        PermissaoEmpresa
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
        PermissaoEmpresa
      > = {};

      Object.keys(
        anteriores
      ).forEach((empresaId) => {
        novosAcessos[empresaId] =
          novaRole === "ADMIN"
            ? "ADMIN"
            : "OPERADOR";
      });

      return novosAcessos;
    });

    setErro("");
  }

  function alternarEmpresa(
    empresaId: string
  ) {
    setAcessos((anteriores) => {
      const selecionada =
        Boolean(
          anteriores[empresaId]
        );

      if (selecionada) {
        const novos = {
          ...anteriores,
        };

        delete novos[empresaId];

        return novos;
      }

      return {
        ...anteriores,

        [empresaId]:
          role === "ADMIN"
            ? "ADMIN"
            : "OPERADOR",
      };
    });

    setErro("");
  }

  function alterarPermissao(
    empresaId: string,
    permissao: PermissaoEmpresa
  ) {
    setAcessos((anteriores) => ({
      ...anteriores,
      [empresaId]: permissao,
    }));

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

    if (senha !== confirmarSenha) {
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
          permissao,
        ]) => ({
          empresaId,
          permissao,
        })
      );

    if (
      acessosSelecionados.length ===
      0
    ) {
      setErro(
        "Selecione pelo menos uma empresa para o usuário."
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

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Novo usuário
          </DialogTitle>

          <DialogDescription>
            Cadastre o usuário e defina
            quais empresas ele poderá
            acessar.
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
                  Informe o nome, e-mail e
                  senha inicial.
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
                  Selecione as empresas e a
                  permissão do usuário em
                  cada ambiente.
                </p>
              </div>
            </div>

            {empresas.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhuma empresa disponível
                para vincular ao usuário.
              </div>
            ) : (
              <div className="space-y-3">
                {empresas.map(
                  (empresa) => {
                    const permissao =
                      acessos[
                        empresa.id
                      ];

                    const selecionada =
                      Boolean(
                        permissao
                      );

                    return (
                      <div
                        key={empresa.id}
                        className={[
                          "rounded-xl border p-4 transition-colors",
                          selecionada
                            ? "border-primary/40 bg-primary/5"
                            : "bg-background",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                            <div className="w-full sm:w-56">
                              <select
                                value={
                                  permissao
                                }
                                onChange={(
                                  event
                                ) =>
                                  alterarPermissao(
                                    empresa.id,
                                    event
                                      .target
                                      .value as PermissaoEmpresa
                                  )
                                }
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                disabled={
                                  carregando ||
                                  usuarioAdministrador
                                }
                              >
                                {usuarioAdministrador ? (
                                  <option value="ADMIN">
                                    Administrador
                                  </option>
                                ) : (
                                  <>
                                    <option value="FATURAMENTO">
                                      Faturamento
                                    </option>

                                    <option value="OPERADOR">
                                      Operador
                                    </option>

                                    <option value="VISUALIZADOR">
                                      Visualizador
                                    </option>
                                  </>
                                )}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {usuarioAdministrador && (
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />

              <p className="text-sm text-muted-foreground">
                O administrador receberá
                permissão administrativa em
                todas as empresas
                selecionadas.
              </p>
            </div>
          )}

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