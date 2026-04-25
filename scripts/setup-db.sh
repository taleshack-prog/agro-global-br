#!/bin/bash
# Setup PostgreSQL database without Docker
# Tested on Ubuntu 22.04 / 24.04

set -e

DB_NAME="agroglobal"
DB_USER="postgres"

echo "==> Checking PostgreSQL..."

if ! command -v psql &> /dev/null; then
  echo "==> PostgreSQL not found. Installing..."
  sudo apt update -qq
  sudo apt install -y postgresql postgresql-contrib
fi

echo "==> Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "==> Creating database '$DB_NAME'..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "    Database already exists, skipping."

echo "==> Setting password for user 'postgres'..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

echo ""
echo "✓ PostgreSQL ready!"
echo "  Connection string: postgresql://postgres:password@localhost:5432/$DB_NAME"
echo ""
echo "Next steps:"
echo "  cp server/.env.example server/.env"
echo "  npm run db:push"
echo "  npm run dev:all"
