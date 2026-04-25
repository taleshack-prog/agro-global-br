#!/bin/bash
cd "$(dirname "$0")/alert-service"
if [ ! -d venv ]; then
  echo "→ Executando setup primeiro..."
  cd .. && bash setup-python.sh && cd alert-service
fi
echo "🔔 Iniciando Alert Service (conectando ao Price Service)..."
venv/bin/python3 alert_service.py
