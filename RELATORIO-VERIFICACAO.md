# Verificação do sistema — 13/09/2026

O sistema compila e os fluxos básicos testados funcionam, mas **não está integralmente correto nem pronto para uso fiscal em produção**. Foram reproduzidas falhas de autorização e validação. Esta revisão não alterou o código da aplicação; os testes de escrita usaram `.local-backups/auditoria.db`, uma cópia do banco local, em um servidor de produção temporário na porta 3100.

## Falhas prioritárias

### Alta — administrador altera status de usuário de outra empresa

Arquivo: `actions/usuarios/toggle-status-usuario.ts:85`.

Reprodução: criar administrador vinculado somente à empresa B; enviar `toggleStatusUsuario` com o ID de um usuário vinculado somente à empresa A e `ativo: false`. O servidor retornou sucesso e o banco confirmou `ativo = 0`.

A ação verifica o papel global do administrador e do usuário, mas não verifica vínculo com uma empresa administrada. A listagem filtrada da interface não impede chamadas diretas. Aplicar a mesma verificação de usuário gerenciável existente em `updateUsuario` antes de alterar o status.

### Alta — permissões de leitura dos módulos podem ser contornadas

Arquivos confirmados:

- `actions/clientes/get-clientes.ts:10`.
- `actions/naturezas-operacao/get-naturezas-operacao.ts:10`.
- `actions/nfe/get-notas-fiscais.ts:9`.
- `actions/configuracao-fiscal/get-configuracao-fiscal.ts:10`.

Reprodução: usuário PERSONALIZADO com somente `PRODUTOS_VISUALIZAR` chamou diretamente essas ações. Recebeu clientes, naturezas, notas e configuração fiscal da empresa, embora não tivesse os privilégios correspondentes. Não foram retornados os segredos criptografados da configuração fiscal.

Essas ações verificam acesso à empresa, mas não o privilégio de visualizar o módulo. Auditar também as demais ações de consulta que usam somente `validarAcessoEmpresa`. A tentativa de abrir a página de clientes com esse usuário foi bloqueada com HTTP 500, sem um redirecionamento amigável.

### Média — cadastro de cliente aceita documento inválido

**Corrigido após a auditoria:** criação e edição agora compartilham validação de dígitos verificadores de CPF/CNPJ, rejeitam sequências repetidas e verificam o tipo de pessoa. Testes unitários passaram; 12 tentativas inválidas via Server Actions foram rejeitadas sem alterar registros, e documentos válidos com máscara foram criados e editados. Build e lint dos arquivos alterados passaram. O relato abaixo registra o problema original.

Arquivo: `actions/clientes/create-cliente.ts:88`; revisar também `update-cliente.ts`.

Reprodução: cadastro de pessoa física com CPF `11111111111` retornou sucesso e persistiu o cliente. A criação verifica apenas 11 ou 14 caracteres numéricos, sem validar os dígitos verificadores ou a correspondência com o tipo de pessoa. Compartilhar validação entre criação e edição.

### Média — configuração de criptografia ausente

Arquivo: `lib/seguranca/criptografia.ts:7`.

O ambiente local não possui `ENCRYPTION_KEY`. Salvar configuração fiscal básica funcionou; salvar CSC retornou erro, e o log confirmou a ausência dessa variável. O upload de certificado usa a mesma função e também depende dela. O envio de um certificado A1 real não foi testado.

Configurar uma chave persistente de 32 bytes em hexadecimal e documentá-la no exemplo de ambiente. Preservar a chave ao atualizar a aplicação para manter os dados criptografados legíveis.

### Média — implantação Docker precisa de ajustes

Constatações por leitura dos arquivos, sem executar contêineres:

- `compose.yaml:19` persiste `/app/uploads`, mas o upload grava em `storage/certificados` (`actions/certificado/upload-certificado.ts:142`). Os certificados ficam fora do volume declarado e podem desaparecer ao recriar o contêiner.
- `RUN_SEED` é habilitado por padrão no Compose. O entrypoint executa o seed a cada inicialização; `prisma/seed.ts:83` atualiza nome, senha e status do administrador, além de sobrescrever registros de demonstração. Reiniciar pode desfazer alterações nesses dados.
- O `README-DOCKER.md` manda copiar `.env.docker.example`, mas esse arquivo não está no projeto. O Dockerfile executa `prisma generate` sem definir `DATABASE_URL`, e o `.dockerignore` exclui `.env`; a configuração Prisma exige essa variável. O build local bem-sucedido não comprova o build Docker.

### Menor — erros de duplicidade pouco informativos

Transportadores, veículos e motoristas rejeitaram duplicatas corretamente, mas exibiram erro genérico. Os handlers esperam `error.meta.target`; no erro observado com o adaptador SQLite instalado, os metadados vieram em outro formato. Ajustar o tratamento para informar qual documento/placa/CNH já existe.

## Funcionalidades ainda incompletas

- NF-e: existem rascunho, itens, transporte, totais e validação interna. Não foi localizado fluxo implementado de geração/assinatura/transmissão do XML, autorização, cancelamento ou DANFE. A interface informa que assinatura e transmissão ocorrerão posteriormente (`components/nfe/validar-nfe-button.tsx`).
- MDF-e está desabilitado como “Em breve” no menu.
- A validação local informa que a compatibilidade CST IBS/CBS–cClassTrib ainda depende da tabela oficial. Não foi feita auditoria normativa dos cálculos tributários.
- O produto de demonstração usado no teste gerou diagnóstico de ausência de CST IBS/CBS e cClassTrib. O seed fornece dados para experimentar os cadastros, mas não garante uma nota válida.

## Verificações executadas

| Área | Resultado e alcance |
| --- | --- |
| Build de produção | `npm run build` passou, incluindo TypeScript e geração de páginas. |
| Migrations | `prisma migrate status` confirmou estrutura atualizada. |
| Lint | Falhou: 10 erros e 4 avisos. Nove erros são `react-hooks/set-state-in-effect`; um é `no-explicit-any` no seed. |
| Autenticação | Login de owner e visualizador, sessão, senha incorreta, usuário inativo e bloqueio do painel sem sessão testados. |
| Cadastro público | Recusou novo cadastro após existir owner. |
| Páginas | 14 páginas de portal/empresa retornaram HTTP 200 com owner; detalhes de NF-e também abriram. Isso não testa cliques ou layout no navegador. |
| Clientes, produtos, naturezas, transportadores, veículos e motoristas | Criação, edição, inativação, exclusão e rejeição de duplicidade testadas por chamadas HTTP às Server Actions. Documento inválido em clientes falhou conforme descrito acima. |
| Empresas | Criação, edição com formulário completo, inativação e bloqueio de escrita em empresa inativa testados. |
| Usuários | Criação de administrador, visualizador e usuário personalizado; edição, inativação, reativação e perda de acesso após inativação testadas. Falhas de autorização descritas acima. |
| NF-e | Criação de rascunho, inclusão/edição/exclusão de item, despesas, transporte e exclusão de rascunho testados. |
| Totais NF-e | Caso simples: produtos 30, desconto 2, frete 5, outras despesas 2, IPI 0 → total 35, confirmado no banco. Não representa cobertura de todos os regimes ou tributos. |
| Validação NF-e | Retornou lista de erros/avisos usando a assinatura correta da ação. |
| Proteção de nota autorizada | Status alterado somente na cópia de teste; edição de item e exclusão de rascunho foram recusadas. Não houve autorização real na SEFAZ. |
| IBGE | A API local retornou 502 porque a rede do sandbox bloqueou a conexão (`EACCES`). Consulta direta fora do sandbox retornou HTTP 200. A integração completa no navegador ficou sem validação. |

Os erros iniciais de teste em edição de empresa, modalidade de frete e validação de NF-e decorreram de parâmetros incompletos/incorretos no executor de auditoria. Foram repetidos com o contrato correto e não são apresentados como defeitos do sistema.

## Limites e próximos passos

Não foram executados testes visuais de navegador, todos os filtros/paginações, certificado A1 real, integração fiscal externa, carga, concorrência, recuperação de desastre ou todos os caminhos de permissões personalizadas. Não há script de testes automatizados configurado em `package.json`.

A prioridade é corrigir as duas falhas de autorização e criar testes de regressão para elas. Em seguida, corrigir validação de documentos, configurar criptografia, ajustar Docker e lint. A emissão fiscal exige implementação e homologação próprias antes de poder ser declarada funcional.

Executores e saídas brutas desta auditoria estão em `.local-backups/audit*.cjs` e `.local-backups/audit*-results.json`, ignorados pelo Git. Os arquivos da aplicação e as alterações anteriores do usuário foram preservados.
