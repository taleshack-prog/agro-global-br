#!/usr/bin/env python3
"""
Global Agro BR — Alert Service
Consumes hedge-recommendations from the Price Service WebSocket
and dispatches Email (SMTP/SendGrid) + SMS (Twilio) alerts.

Without Kafka in dev: connects directly to the Price Service WS
and watches for recommendations with risk_level=high or action=HEDGE_RECOMMENDED.
"""

import asyncio
import json
import logging
import os
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict

import websockets
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────

PRICE_WS_URL   = os.getenv("PRICE_WS_URL", "ws://localhost:8765")

SMTP_SERVER    = os.getenv("SMTP_SERVER",   "smtp.gmail.com")
SMTP_PORT      = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL     = os.getenv("SMTP_EMAIL",    "")
SMTP_PASSWORD  = os.getenv("SMTP_PASSWORD", "")

TWILIO_SID     = os.getenv("TWILIO_ACCOUNT_SID",  "")
TWILIO_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN",   "")
TWILIO_FROM    = os.getenv("TWILIO_PHONE_NUMBER", "")

# Commodity-to-contact mapping (extend as needed)
USER_CONTACTS: Dict[str, Dict] = {
    "soja":    {"email": os.getenv("ALERT_EMAIL_SOJA",    ""), "phone": os.getenv("ALERT_PHONE_SOJA",    ""), "threshold": "medium"},
    "milho":   {"email": os.getenv("ALERT_EMAIL_MILHO",   ""), "phone": os.getenv("ALERT_PHONE_MILHO",   ""), "threshold": "medium"},
    "cafe":    {"email": os.getenv("ALERT_EMAIL_CAFE",    ""), "phone": os.getenv("ALERT_PHONE_CAFE",    ""), "threshold": "low"},
    "algodao": {"email": os.getenv("ALERT_EMAIL_ALGODAO", ""), "phone": os.getenv("ALERT_PHONE_ALGODAO", ""), "threshold": "medium"},
}

# ─── Email ────────────────────────────────────────────────────────────────────

def send_email(to: str, subject: str, html: str) -> bool:
    if not SMTP_EMAIL or not SMTP_PASSWORD or not to:
        logger.info(f"[EMAIL-MOCK] → {to} | {subject}")
        return True
    try:
        msg = MIMEMultipart("alternative")
        msg["From"]    = SMTP_EMAIL
        msg["To"]      = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.send_message(msg)
        logger.info(f"📧 Email sent → {to}")
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False


# ─── SMS ─────────────────────────────────────────────────────────────────────

def send_sms(to: str, body: str) -> bool:
    if not TWILIO_SID or not TWILIO_TOKEN or not to:
        logger.info(f"[SMS-MOCK] → {to} | {body[:80]}")
        return True
    try:
        from twilio.rest import Client
        Client(TWILIO_SID, TWILIO_TOKEN).messages.create(body=body, from_=TWILIO_FROM, to=to)
        logger.info(f"📱 SMS sent → {to}")
        return True
    except Exception as e:
        logger.error(f"SMS error: {e}")
        return False


# ─── Templates ────────────────────────────────────────────────────────────────

def email_body(rec: dict) -> str:
    c     = rec.get("name",    rec.get("commodity", "")).upper()
    price = rec.get("current_price", 0)
    risk  = rec.get("riskLevel",    rec.get("risk_level", ""))
    action = rec.get("action", "")
    reason = rec.get("reason", "")
    pct   = rec.get("suggestedQty", {}).get("protectionPct", rec.get("protection_level", 0))

    if action == "HEDGE_RECOMMENDED":
        color, icon, msg = "#d32f2f", "🛡️", f"Proteja <strong>{pct}%</strong> da safra"
    else:
        color, icon, msg = "#2e7d32", "👁️", "Dentro dos limites — continue monitorando"

    return f"""
<html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto">
  <h2 style="color:{color}">{icon} Alerta: {c}</h2>
  <p><strong>Ação:</strong> {action}</p>
  <p><strong>Preço atual:</strong> R$ {price:.2f}</p>
  <p><strong>Risco:</strong> {risk}</p>
  <div style="background:#fff3cd;padding:12px;border-radius:6px;margin:12px 0">
    <strong>Motivo:</strong> {reason}
  </div>
  <p>{msg}</p>
  <p style="font-size:11px;color:#888">Global Agro BR · {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
</body></html>"""


def sms_body(rec: dict) -> str:
    c      = rec.get("name", rec.get("commodity", "")).upper()
    action = rec.get("action", "")
    pct    = rec.get("suggestedQty", {}).get("protectionPct", rec.get("protection_level", 0))
    if action == "HEDGE_RECOMMENDED":
        return f"🛡️ ALERTA {c}: Hedge recomendado! Proteja {pct}% da safra. Acesse o app."
    return f"👁️ {c}: Monitorando — dentro dos limites operacionais."


# ─── Alert dispatcher ─────────────────────────────────────────────────────────

class AlertService:
    def __init__(self):
        self.sent: Dict[str, int] = {"email": 0, "sms": 0}
        self.last_alert: Dict[str, str] = {}

    def should_alert(self, commodity: str, action: str) -> bool:
        contact   = USER_CONTACTS.get(commodity, {})
        threshold = contact.get("threshold", "medium")
        if action == "HEDGE_RECOMMENDED":
            return True
        return threshold == "low"

    def dispatch(self, rec: dict):
        commodity = rec.get("commodity", "")
        action    = rec.get("action", "")

        if not self.should_alert(commodity, action):
            return

        # Debounce: skip if same action was alerted < 5 min ago
        key = f"{commodity}:{action}"
        now = datetime.now().isoformat()
        if key in self.last_alert:
            last = datetime.fromisoformat(self.last_alert[key])
            if (datetime.now() - last).seconds < 300:
                return
        self.last_alert[key] = now

        contact = USER_CONTACTS.get(commodity, {})
        subject = f"🛡️ Global Agro BR: {rec.get('name', commodity).upper()} — {action}"

        if contact.get("email"):
            if send_email(contact["email"], subject, email_body(rec)):
                self.sent["email"] += 1

        if contact.get("phone"):
            if send_sms(contact["phone"], sms_body(rec)):
                self.sent["sms"] += 1

    # ─── WebSocket consumer ───────────────────────────────────────────────────

    async def run(self):
        logger.info(f"Alert Service connecting to {PRICE_WS_URL}...")
        async with websockets.connect(PRICE_WS_URL) as ws:
            # Subscribe to all commodities
            for commodity in USER_CONTACTS:
                await ws.send(json.dumps({"type": "subscribe", "commodity": commodity}))

            logger.info("Alert Service listening for price updates...")
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                    if msg.get("type") == "price_update":
                        data = msg.get("data", {})
                        # Build a synthetic recommendation from price data
                        change_pct = abs(data.get("change_pct", 0))
                        rec = {
                            "commodity": data.get("id"),
                            "name":      data.get("name", data.get("id", "")),
                            "current_price": data.get("price", 0),
                            "riskLevel": "high" if change_pct > 1 else "medium" if change_pct > 0.5 else "low",
                            "action": "HEDGE_RECOMMENDED" if change_pct > 1 else "MONITOR",
                            "reason": f"Variação de {data.get('change_pct', 0):+.3f}% detectada",
                        }
                        self.dispatch(rec)
                except Exception as e:
                    logger.debug(f"Parse error: {e}")


def main():
    service = AlertService()
    try:
        asyncio.run(service.run())
    except KeyboardInterrupt:
        logger.info(f"Alert Service stopped | emails: {service.sent['email']} | sms: {service.sent['sms']}")


if __name__ == "__main__":
    main()
