from datetime import datetime
from typing import Optional
import uuid
import enum

from sqlalchemy import (
    Column, String, Float, DateTime, Boolean, Integer,
    Enum, ForeignKey, JSON, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, DeclarativeBase

# ─── Base ────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass

# ─── Enums ───────────────────────────────────────────────────────────────────

class RiskLevel(str, enum.Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class HedgeAction(str, enum.Enum):
    HEDGE_RECOMMENDED = "HEDGE_RECOMMENDED"
    MONITOR           = "MONITOR"

class AlertType(str, enum.Enum):
    PRICE_ALERT = "price_alert"
    HEDGE_ALERT = "hedge_alert"
    RISK_ALERT  = "risk_alert"

class OrderType(str, enum.Enum):
    BUY   = "buy"
    SELL  = "sell"
    HEDGE = "hedge"

class OrderStatus(str, enum.Enum):
    PENDING   = "pending"
    COMPLETED = "completed"
    FAILED    = "failed"

# ─── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name       = Column(String(255))
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    alerts = relationship("Alert", back_populates="user", lazy="dynamic")
    orders = relationship("Order", back_populates="user", lazy="dynamic")


class Commodity(Base):
    __tablename__ = "commodities"

    id            = Column(String(50), primary_key=True)
    name          = Column(String(255), nullable=False)
    category      = Column(String(100))
    unit          = Column(String(50))
    current_price = Column(Float)
    change_pct    = Column(Float)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    extra         = Column("metadata", JSON)

    hedge_recommendations = relationship("HedgeRecommendation", back_populates="commodity", lazy="dynamic")
    risk_metrics          = relationship("RiskMetric",          back_populates="commodity", lazy="dynamic")
    orders                = relationship("Order",               back_populates="commodity", lazy="dynamic")


class Price(Base):
    __tablename__ = "prices"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False, index=True)
    price        = Column(Float, nullable=False)
    change_pct   = Column(Float)
    sources      = Column(JSON)
    currency     = Column(String(10), default="BRL")
    timestamp    = Column(DateTime, default=datetime.utcnow, index=True)


class RiskMetric(Base):
    __tablename__ = "risk_metrics"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False, index=True)
    var_95       = Column(Float)
    volatility   = Column(Float)
    margin_pct   = Column(Float)
    risk_level   = Column(Enum(RiskLevel))
    timestamp    = Column(DateTime, default=datetime.utcnow, index=True)

    commodity = relationship("Commodity", back_populates="risk_metrics")


class HedgeRecommendation(Base):
    __tablename__ = "hedge_recommendations"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id       = Column(String(50), ForeignKey("commodities.id"), nullable=False, index=True)
    action             = Column(Enum(HedgeAction))
    risk_level         = Column(Enum(RiskLevel))
    reason             = Column(Text)
    protection_level   = Column(Float)
    suggested_quantity = Column(JSON)
    current_price      = Column(Float)
    futures_contract   = Column(String(100))
    created_at         = Column(DateTime, default=datetime.utcnow, index=True)

    commodity = relationship("Commodity", back_populates="hedge_recommendations")


class Alert(Base):
    __tablename__ = "alerts"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), index=True)
    type         = Column(Enum(AlertType))
    message      = Column(Text)
    severity     = Column(String(20))
    is_read      = Column(Boolean, default=False)
    created_at   = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="alerts")


class Order(Base):
    __tablename__ = "orders"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False, index=True)
    type         = Column(Enum(OrderType))
    quantity     = Column(Float, nullable=False)
    price        = Column(Float, nullable=False)
    total        = Column(Float, nullable=False)
    status       = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at   = Column(DateTime, default=datetime.utcnow, index=True)

    user      = relationship("User",      back_populates="orders")
    commodity = relationship("Commodity", back_populates="orders")


class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), index=True)
    roi          = Column(Float)
    savings      = Column(Float)
    net_benefit  = Column(Float)
    win_rate     = Column(Float)
    total_trades = Column(Integer)
    avg_profit   = Column(Float)
    start_date   = Column(DateTime)
    end_date     = Column(DateTime)
    created_at   = Column(DateTime, default=datetime.utcnow)
