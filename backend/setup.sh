#!/bin/bash
# Global Agro BR — Backend Python setup (Ubuntu 22/24)
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()  { echo -e "${GREEN}✓ $1${NC}"; }
msg() { echo -e "${YELLOW}→ $1${NC}"; }

cd "$(dirname "$0")"

msg "Checking Python 3..."
if ! command -v python3 &>/dev/null; then
  sudo apt update -qq && sudo apt install -y python3 python3-venv python3-full
fi
ok "$(python3 --version)"

msg "Creating virtual environment..."
if [ ! -d venv ]; then
  python3 -m venv venv
fi

msg "Installing dependencies..."
venv/bin/pip install -q --upgrade pip
venv/bin/pip install -q -r requirements.txt
ok "Dependencies installed"

if [ ! -f .env ]; then
  msg "Creating .env from template..."
  cp .env.example .env
  ok ".env created — edit with your credentials"
fi

echo ""
echo "════════════════════════════════════════"
echo "  Backend setup done!"
echo ""
echo "  Start PostgreSQL + TimescaleDB + Kafka:"
echo "  docker compose up -d"
echo ""
echo "  Start FastAPI:"
echo "  bash run.sh"
echo ""
echo "  API docs: http://localhost:8000/docs"
echo "════════════════════════════════════════"
