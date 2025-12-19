#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U admin -d urls_db; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is ready!"