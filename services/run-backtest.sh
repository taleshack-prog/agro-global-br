#!/bin/bash
cd "$(dirname "$0")/backtest-engine"
if [ ! -d venv ]; then
  echo "→ Executando setup primeiro..."
  cd .. && bash setup-python.sh && cd backtest-engine
fi
echo "📈 Executando Backtesting Engine (90 dias)..."
venv/bin/python3 backtest_engine.py
