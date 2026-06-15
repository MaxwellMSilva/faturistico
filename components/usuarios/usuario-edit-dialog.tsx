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
  KeyRound,
  LoaderCircle,
  Pencil,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { updateUsuario } from "@/actions/usuarios/update-usuario";

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
  | "OWNER"
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

type AcessoUsuario = {
  id: string;
  empresaId: string;

  permissao:
    PermissaoEmpresa;

  ativo: boolean;

  privilegios:
    PrivilegioEmpresa[];
};

type Usuario = {
  id: string;

  nome: string;
  email: string;

  role: RoleUsuario;

  empresas:
    AcessoUsuario[];
};

type AcessoFormulario = {
  permissao:
    PermissaoEmpresa;

  privilegios:
    PrivilegioEmpresa[];
};

type Props = {
  usuario: Usuario;

  empresas: Empresa[];

  gestorRole:
    | "OWNER"
    | "ADMIN";

  rolesPermitidos: Array<
    "ADMIN" | "USUARIO"
  >;

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

export function UsuarioEditDialog({
  usuario,
  empresas,
  gestorRole,
  rolesPermitidos,
  arvorePrivilegios,
}: Props) {
  const router = useRouter();

  const editandoOwner =
    usuario.role === "OWNER";

  function criarEstadoInicial() {
    const acessos: Record<
      string,
      AcessoFormulario
    > = {};

    /*
     * Somente empresas ativas recebidas
     * pelo formulário podem ser editadas.
     *
     * Vínculos de empresas inativas não
     * são enviados e serão preservados
     * pelo backend.
     */

    const empresasDisponiveis =
      new Set(
        empresas.map(
          (empresa) =>
            empresa.id
        )
      );

    usuario.empresas.forEach(
      (acesso) => {
        if (
          !acesso.ativo ||
          !empresasDisponiveis.has(
            acesso.empresaId
          )
        ) {
          return;
        }

        if (
          usuario.role === "ADMIN"
        ) {
          acessos[
            acesso.empresaId
          ] = {
            permissao: "ADMIN",
            privilegios: [],
          };

          return;
        }

        acessos[
          acesso.empresaId
        ] = {
          permissao:
            acesso.permissao ===
            "PERSONALIZADO"
              ? "PERSONALIZADO"
              : "VISUALIZADOR",

          privilegios:
            acesso.permissao ===
            "PERSONALIZADO"
              ? acesso.privilegios
              : [],
        };
      }
    );

    return {
      nome:
        usuario.nome,

      email:
        usuario.email,

      role:
        usuario.role,

      novaSenha: "",
      confirmarSenha: "",

      acessos,
    };
  }

  type EstadoFormulario =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [form, setForm] =
    useState<EstadoFormulario>(
      criarEstadoInicial
    );

  function atualizarCampo<
    Campo extends keyof EstadoFormulario,
  >(
    campo: Campo,
    valor: EstadoFormulario[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErro("");
  }

  function alterarRole(
    novaRole:
      | "ADMIN"
      | "USUARIO"
  ) {
    setForm((anterior) => {
      const novosAcessos: Record<
        string,
        AcessoFormulario
      > = {};

      Object.keys(
        anterior.acessos
      ).forEach((empresaId) => {
        novosAcessos[empresaId] = {
          permissao:
            novaRole === "ADMIN"
              ? "ADMIN"
              : "VISUALIZADOR",

          privilegios: [],
        };
      });

      return {
        ...anterior,

        role:
          novaRole,

        acessos:
          novosAcessos,
      };
    });

    setErro("");
  }

  function alternarEmpresa(
    empresaId: string
  ) {
    setForm((anterior) => {
      const novosAcessos = {
        ...anterior.acessos,
      };

      if (
        novosAcessos[empresaId]
      ) {
        delete novosAcessos[
          empresaId
        ];
      } else {
        novosAcessos[empresaId] = {
          permissao:
            anterior.role ===
            "ADMIN"
              ? "ADMIN"
              : "VISUALIZADOR",

          privilegios: [],
        };
      }

      return {
        ...anterior,

        acessos:
          novosAcessos,
      };
    });

    setErro("");
  }

  function alterarPermissao(
    empresaId: string,
    permissao:
      PermissaoEmpresa
  ) {
    setForm((anterior) => {
      const acessoAnterior =
        anterior.acessos[
          empresaId
        ];

      if (!acessoAnterior) {
        return anterior;
      }

      return {
        ...anterior,

        acessos: {
          ...anterior.acessos,

          [empresaId]: {
            permissao,

            privilegios:
              permissao ===
              "PERSONALIZADO"
                ? acessoAnterior
                    .privilegios
                : [],
          },
        },
      };
    });

    setErro("");
  }

  function alterarPrivilegios(
    empresaId: string,
    privilegios:
      PrivilegioEmpresa[]
  ) {
    setForm((anterior) => {
      const acesso =
        anterior.acessos[
          empresaId
        ];

      if (!acesso) {
        return anterior;
      }

      return {
        ...anterior,

        acessos: {
          ...anterior.acessos,

          [empresaId]: {
            ...acesso,

            privilegios,
          },
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

    const nome =
      form.nome.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (!nome) {
      setErro(
        "Informe o nome do usuário."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setErro(
        "Informe um e-mail válido."
      );

      return;
    }

    if (
      form.novaSenha &&
      form.novaSenha.length < 6
    ) {
      setErro(
        "A nova senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (
      form.novaSenha !==
      form.confirmarSenha
    ) {
      setErro(
        "A confirmação da nova senha não confere."
      );

      return;
    }

    const acessos =
      Object.entries(
        form.acessos
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
      !editandoOwner &&
      acessos.length === 0
    ) {
      setErro(
        "Selecione pelo menos uma empresa para o usuário."
      );

      return;
    }

    const acessoPersonalizadoSemPrivilegios =
      acessos.find(
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
            acessoPersonalizadoSemPrivilegios
              .empresaId
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
        await updateUsuario({
          usuarioId:
            usuario.id,

          nome,
          email,

          role:
            form.role,

          novaSenha:
            form.novaSenha ||
            undefined,

          acessos:
            editandoOwner
              ? []
              : acessos,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar usuário:",
        error
      );

      setErro(
        "Não foi possível atualizar o usuário."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          setErro("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
          />
        }
      >
        <Pencil size={16} />

        Editar
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Editar usuário
          </DialogTitle>

          <DialogDescription>
            Atualize os dados, a senha e
            os acessos do usuário.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Dados pessoais */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Dados pessoais
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Nome, e-mail e função
                  global do usuário.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`nome-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Nome completo
                </label>

                <Input
                  id={`nome-${usuario.id}`}
                  className="h-11"
                  value={form.nome}
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`email-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  E-mail
                </label>

                <Input
                  id={`email-${usuario.id}`}
                  type="email"
                  className="h-11"
                  value={form.email}
                  onChange={(event) =>
                    atualizarCampo(
                      "email",
                      event.target.value
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`role-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Função na plataforma
                </label>

                {editandoOwner ? (
                  <div className="flex h-11 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm">
                    <ShieldCheck
                      size={17}
                      className="text-violet-600"
                    />

                    Proprietário
                  </div>
                ) : (
                  <select
                    id={`role-${usuario.id}`}
                    value={form.role}
                    onChange={(event) =>
                      alterarRole(
                        event.target
                          .value as
                          | "ADMIN"
                          | "USUARIO"
                      )
                    }
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                    disabled={
                      carregando ||
                      gestorRole ===
                        "ADMIN"
                    }
                  >
                    {rolesPermitidos.includes(
                      "ADMIN"
                    ) && (
                      <option value="ADMIN">
                        Administrador
                      </option>
                    )}

                    <option value="USUARIO">
                      Usuário
                    </option>
                  </select>
                )}
              </div>
            </div>
          </section>

          {/* Senha */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Alterar senha
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Deixe os campos vazios
                  para manter a senha atual.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`senha-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Nova senha
                </label>

                <Input
                  id={`senha-${usuario.id}`}
                  type="password"
                  className="h-11"
                  value={
                    form.novaSenha
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "novaSenha",
                      event.target.value
                    )
                  }
                  placeholder="Mínimo de 6 caracteres"
                  disabled={carregando}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`confirmar-senha-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Confirmar nova senha
                </label>

                <Input
                  id={`confirmar-senha-${usuario.id}`}
                  type="password"
                  className="h-11"
                  value={
                    form.confirmarSenha
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "confirmarSenha",
                      event.target.value
                    )
                  }
                  placeholder="Repita a nova senha"
                  disabled={carregando}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </section>

          {/* Empresas */}

          {!editandoOwner && (
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
                    Selecione as empresas
                    e configure os privilégios.
                  </p>
                </div>
              </div>

              {empresas.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhuma empresa ativa
                  disponível para alteração.
                </div>
              ) : (
                <div className="space-y-4">
                  {empresas.map(
                    (empresa) => {
                      const acesso =
                        form.acessos[
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
                                {form.role ===
                                "ADMIN" ? (
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
                                      Privilégios
                                      personalizados
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

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Vínculos com empresas
                inativas não aparecem neste
                formulário e serão mantidos
                sem alteração.
              </p>
            </section>
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
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Salvando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}