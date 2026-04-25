#!/usr/bin/env python3
"""
Global Agro BR — Price Service
WebSocket server para streaming de preços em tempo real
Mock feeds: B3, CBOT, CEAGESP, CEPEA, ICE
Porta: ws://localhost:8765
"""

import asyncio
import json
import random
from datetime import datetime
from typing import Set, Dict
import websockets
from websockets.server import WebSocketServerProtocol
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─── Commodity feeds config ──────────────────────────────────────────────────

COMMODITY_FEEDS: Dict[str, dict] = {
    "soja": {
        "name": "Soja",
        "base_price": 142.50,
        "volatility": 0.004,
        "sources": ["B3", "CBOT"],
        "currency": "BRL",
        "unit": "saca 60kg",
    },
    "milho": {
        "name": "Milho",
        "base_price": 68.40,
        "volatility": 0.003,
        "sources": ["B3", "CBOT"],
        "currency": "BRL",
        "unit": "saca 60kg",
    },
    "cafe": {
        "name": "Café",
        "base_price": 1250.00,
        "volatility": 0.005,
        "sources": ["B3", "ICE"],
        "currency": "BRL",
        "unit": "saca 60kg",
    },
    "algodao": {
        "name": "Algodão",
        "base_price": 135.80,
        "volatility": 0.004,
        "sources": ["B3", "ICE"],
        "currency": "BRL",
        "unit": "arroba",
    },
    "gado": {
        "name": "Boi Gordo",
        "base_price": 285.50,
        "volatility": 0.002,
        "sources": ["B3", "CEPEA"],
        "currency": "BRL",
        "unit": "arroba",
    },
    "leite": {
        "name": "Leite",
        "base_price": 2.85,
        "volatility": 0.003,
        "sources": ["CEPEA"],
        "currency": "BRL",
        "unit": "litro",
    },
    "usd_brl": {
        "name": "USD/BRL",
        "base_price": 5.234,
        "volatility": 0.002,
        "sources": ["B3"],
        "currency": "BRL",
        "unit": "R$",
    },
    "soja_cbot": {
        "name": "Soja CBOT",
        "base_price": 1048.25,
        "volatility": 0.003,
        "sources": ["CBOT"],
        "currency": "USD",
        "unit": "US¢/bu",
    },
    "milho_cbot": {
        "name": "Milho CBOT",
        "base_price": 462.75,
        "volatility": 0.003,
        "sources": ["CBOT"],
        "currency": "USD",
        "unit": "US¢/bu",
    },
}

# ─── Price Simulator ─────────────────────────────────────────────────────────

class PriceSimulator:
    def __init__(self):
        self.prices: Dict[str, float] = {k: v["base_price"] for k, v in COMMODITY_FEEDS.items()}
        self.history: Dict[str, list] = {k: [] for k in COMMODITY_FEEDS}

    def tick(self, commodity: str) -> dict:
        cfg = COMMODITY_FEEDS[commodity]
        prev = self.prices[commodity]
        delta = random.gauss(0, cfg["volatility"] * prev)
        new_price = max(prev + delta, prev * 0.8)
        self.prices[commodity] = new_price

        change_pct = ((new_price - prev) / prev) * 100

        point = {
            "timestamp": datetime.now().isoformat(),
            "price": round(new_price, 4),
            "change_pct": round(change_pct, 4),
        }
        self.history[commodity].append(point)
        if len(self.history[commodity]) > 120:
            self.history[commodity].pop(0)

        return {
            "id": commodity,
            "name": cfg["name"],
            "price": round(new_price, 4),
            "change_pct": round(change_pct, 4),
            "prev_price": round(prev, 4),
            "timestamp": point["timestamp"],
            "sources": cfg["sources"],
            "currency": cfg["currency"],
            "unit": cfg["unit"],
            "history": self.history[commodity][-30:],
        }

# ─── WebSocket Server ─────────────────────────────────────────────────────────

class PriceServer:
    def __init__(self):
        self.simulator = PriceSimulator()
        self.subscriptions: Dict[str, Set] = {k: set() for k in COMMODITY_FEEDS}
        self.all_subscribers: Set = set()

    async def handle(self, ws: WebSocketServerProtocol, path: str):
        self.all_subscribers.add(ws)
        logger.info(f"Client connected — total: {len(self.all_subscribers)}")
        try:
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError:
                    continue

                if msg.get("type") == "subscribe":
                    commodity = msg.get("commodity", "")
                    if commodity in self.subscriptions:
                        self.subscriptions[commodity].add(ws)
                        # Send current snapshot immediately
                        data = self.simulator.tick(commodity)
                        await ws.send(json.dumps({"type": "price_update", "data": data}))

                elif msg.get("type") == "unsubscribe":
                    commodity = msg.get("commodity", "")
                    self.subscriptions.get(commodity, set()).discard(ws)

                elif msg.get("type") == "get_all":
                    all_data = {k: self.simulator.tick(k) for k in COMMODITY_FEEDS}
                    await ws.send(json.dumps({"type": "all_prices", "data": all_data}))

                elif msg.get("type") == "ping":
                    await ws.send(json.dumps({"type": "pong"}))

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.all_subscribers.discard(ws)
            for subs in self.subscriptions.values():
                subs.discard(ws)
            logger.info(f"Client disconnected — total: {len(self.all_subscribers)}")

    async def broadcast_loop(self):
        """Update all commodities every 2 seconds and push to subscribers."""
        while True:
            for commodity, subscribers in self.subscriptions.items():
                if not subscribers:
                    continue
                data = self.simulator.tick(commodity)
                payload = json.dumps({"type": "price_update", "data": data})
                dead = set()
                for ws in subscribers:
                    try:
                        await ws.send(payload)
                    except websockets.exceptions.ConnectionClosed:
                        dead.add(ws)
                subscribers -= dead
            await asyncio.sleep(2)

async def main():
    server = PriceServer()
    async with websockets.serve(server.handle, "0.0.0.0", 8765, ping_interval=20, ping_timeout=10):
        logger.info("🌾 Price Service running on ws://0.0.0.0:8765")
        await server.broadcast_loop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Price Service stopped")
