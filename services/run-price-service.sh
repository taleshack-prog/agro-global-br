#!/bin/bash
cd "$(dirname "$0")/price-service"
if [ ! -d venv ]; then
  echo "→ Executando setup primeiro..."
  cd .. && bash setup-python.sh && cd price-service
fi
echo "🌾 Iniciando Price Service em ws://localhost:8765"
venv/bin/python3 price_service.py
