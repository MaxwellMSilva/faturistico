# Docker + seed do Faturístico

Este pacote mantém o banco atual em SQLite e persiste o arquivo no volume
`faturistico_data`.

## Instalação

1. Copie todos os arquivos para a raiz do projeto.
2. Instale o executor TypeScript:

```powershell
npm install -D tsx
```

3. Crie o arquivo de variáveis:

```powershell
Copy-Item .env.docker.example .env.docker
```

4. Troque `NEXTAUTH_SECRET`, `SEED_OWNER_EMAIL` e `SEED_OWNER_PASSWORD`.

5. Suba o projeto:

```powershell
docker compose up --build
```

Acesse `http://localhost:3000`.

## Seed manual

```powershell
npx prisma db seed
```

Dentro do contêiner:

```powershell
docker compose exec faturistico npx prisma db seed
```

## Reiniciar sem apagar dados

```powershell
docker compose down
docker compose up --build
```

## Apagar também o banco

Atenção: este comando remove o volume e todos os dados.

```powershell
docker compose down -v
docker compose up --build
```

## Dados criados

O seed principal cria ou atualiza:

- usuário OWNER;
- empresa de demonstração;
- vínculo OWNER com a empresa.

Quando `SEED_DEMO=true`, ele também tenta criar:

- módulos NF-e, MDF-e, CT-e e NFS-e;
- configuração fiscal;
- natureza de operação;
- cliente;
- produto de teste.

Os blocos de demonstração são opcionais porque alguns models podem possuir
campos obrigatórios adicionais no schema atual.
