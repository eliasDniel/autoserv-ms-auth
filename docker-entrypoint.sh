#!/bin/sh
set -e

echo "Esperando a que PostgreSQL esté listo..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL está listo."

echo "Creando el esquema identity..."
echo "CREATE SCHEMA IF NOT EXISTS identity;" | npx prisma db execute --stdin

echo "Ejecutando Prisma generate..."
npx prisma generate

echo "Aplicando el esquema (db push)..."
npx prisma db push --accept-data-loss

echo "Ejecutando el seed..."
npx prisma db seed

echo "Iniciando la aplicación..."
exec "$@"
