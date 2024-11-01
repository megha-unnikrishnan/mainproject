#!/bin/sh

# Wait until PostgreSQL is ready
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 1
done

echo "Database is up - continuing"
exec "$@"
