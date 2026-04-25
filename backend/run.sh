#!/bin/bash
cd "$(dirname "$0")"
if [ ! -d venv ]; then
  echo "→ Running setup first..."
  bash setup.sh
fi
echo "🌾 Starting Global Agro BR FastAPI on http://localhost:8000"
venv/bin/python main.py
