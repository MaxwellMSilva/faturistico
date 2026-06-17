#!/bin/sh
set -eu

echo "Aplicando migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Executando seed..."
  npx prisma db seed
fi

echo "Iniciando Faturístico..."
exec npm run start
