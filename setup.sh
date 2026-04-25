#!/bin/bash
# AgroGlobal — Setup completo do ambiente de desenvolvimento
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓ $1${NC}"; }
msg() { echo -e "${YELLOW}→ $1${NC}"; }

echo ""
echo "═══════════════════════════════════════════════"
echo "   AgroGlobal B2B — Setup de Desenvolvimento   "
echo "═══════════════════════════════════════════════"
echo ""

# 1. Install frontend deps
msg "Instalando dependências do frontend..."
npm install --silent
ok "Frontend pronto"

# 2. Install backend deps
msg "Instalando dependências do backend..."
npm install --silent --prefix server
ok "Backend pronto"

# 3. Create server/.env if missing
if [ ! -f server/.env ]; then
  msg "Criando server/.env..."
  cp server/.env.example server/.env
  # Set a working JWT secret
  sed -i 's/change-me-in-production-use-32-char-min/agroglobal-dev-secret-2026-change-in-prod/' server/.env
  ok "server/.env criado"
else
  ok "server/.env já existe"
fi

# 4. Create frontend .env.local if missing
if [ ! -f .env.local ]; then
  msg "Criando .env.local..."
  cp .env.example .env.local
  ok ".env.local criado"
else
  ok ".env.local já existe"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "   Setup concluído!"
echo ""
echo "   Para iniciar tudo:"
echo ""
echo "   Terminal 1 (Backend API + WebSocket):"
echo "   $ npm run server:dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "   Terminal 3 (Price Service Python — opcional):"
echo "   $ pip install websockets"
echo "   $ python services/price-service/price_service.py"
echo ""
echo "   Frontend:      http://localhost:5173"
echo "   Backend API:   http://localhost:3001"
echo "   Health check:  http://localhost:3001/health"
echo "═══════════════════════════════════════════════"
echo ""
