#!/bin/sh
set -e

echo "Applying Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting Node.js API..."
exec node dist/main.js
