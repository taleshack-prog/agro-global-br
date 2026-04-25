#!/bin/bash
# Global Agro BR — Setup de serviços Python com venv
# Ubuntu 22/24: usa python3 + venv (sem modificar o sistema)

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓ $1${NC}"; }
msg() { echo -e "${YELLOW}→ $1${NC}"; }

cd "$(dirname "$0")"

# ── Verificar python3 ────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  msg "Instalando python3..."
  sudo apt update -qq && sudo apt install -y python3 python3-venv python3-full
fi
ok "python3 $(python3 --version)"

# ── Price Service ────────────────────────────────────────────────────
msg "Configurando Price Service..."
cd price-service
if [ ! -d venv ]; then
  python3 -m venv venv
fi
venv/bin/pip install -q --upgrade pip
venv/bin/pip install -q websockets
ok "Price Service pronto"
cd ..

# ── Alert Service ────────────────────────────────────────────────────
msg "Configurando Alert Service..."
cd alert-service
if [ ! -d venv ]; then
  python3 -m venv venv
fi
venv/bin/pip install -q --upgrade pip
venv/bin/pip install -q websockets python-dotenv
ok "Alert Service pronto (Twilio opcional)"
cd ..

# ── Backtesting Engine ───────────────────────────────────────────────
msg "Configurando Backtesting Engine..."
cd backtest-engine
if [ ! -d venv ]; then
  python3 -m venv venv
fi
venv/bin/pip install -q --upgrade pip
venv/bin/pip install -q numpy python-dotenv
ok "Backtesting Engine pronto"
cd ..

echo ""
echo "════════════════════════════════════════════════"
echo "  Setup concluído! Para iniciar os serviços:"
echo ""
echo "  Terminal 1 — Price Service (WebSocket):"
echo "  cd services && ./run-price-service.sh"
echo ""
echo "  Terminal 2 — Backtesting:"
echo "  cd services && ./run-backtest.sh"
echo ""
echo "  Terminal 3 — Alert Service:"
echo "  cd services && ./run-alerts.sh"
echo "════════════════════════════════════════════════"
