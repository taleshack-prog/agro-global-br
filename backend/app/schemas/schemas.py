from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, EmailStr, field_validator

# ─── Enums ───────────────────────────────────────────────────────────────────

class RiskLevelEnum(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class HedgeActionEnum(str, Enum):
    HEDGE_RECOMMENDED = "HEDGE_RECOMMENDED"
    MONITOR           = "MONITOR"

class OrderTypeEnum(str, Enum):
    BUY   = "buy"
    SELL  = "sell"
    HEDGE = "hedge"

class OrderStatusEnum(str, Enum):
    PENDING   = "pending"
    COMPLETED = "completed"
    FAILED    = "failed"

# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str

class UserResponse(BaseModel):
    id:         UUID
    email:      str
    full_name:  Optional[str]
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"

# ─── Commodity ────────────────────────────────────────────────────────────────

class CommodityResponse(BaseModel):
    id:            str
    name:          str
    category:      Optional[str]
    unit:          Optional[str]
    current_price: Optional[float]
    change_pct:    Optional[float]
    updated_at:    Optional[datetime]

    model_config = {"from_attributes": True}

# ─── Price ───────────────────────────────────────────────────────────────────

class PriceResponse(BaseModel):
    id:           UUID
    commodity_id: str
    price:        float
    change_pct:   Optional[float]
    sources:      Optional[List[str]]
    currency:     Optional[str]
    timestamp:    datetime

    model_config = {"from_attributes": True}

# ─── Risk ────────────────────────────────────────────────────────────────────

class RiskMetricResponse(BaseModel):
    id:           UUID
    commodity_id: str
    var_95:       Optional[float]
    volatility:   Optional[float]
    margin_pct:   Optional[float]
    risk_level:   Optional[RiskLevelEnum]
    timestamp:    datetime

    model_config = {"from_attributes": True}

# ─── Hedge ───────────────────────────────────────────────────────────────────

class HedgeRecommendationResponse(BaseModel):
    id:                 UUID
    commodity_id:       str
    action:             Optional[HedgeActionEnum]
    risk_level:         Optional[RiskLevelEnum]
    reason:             Optional[str]
    protection_level:   Optional[float]
    suggested_quantity: Optional[Any]
    current_price:      Optional[float]
    futures_contract:   Optional[str]
    created_at:         datetime

    model_config = {"from_attributes": True}

# ─── Alert ───────────────────────────────────────────────────────────────────

class AlertResponse(BaseModel):
    id:           UUID
    commodity_id: Optional[str]
    type:         Optional[str]
    message:      Optional[str]
    severity:     Optional[str]
    is_read:      bool
    created_at:   datetime

    model_config = {"from_attributes": True}

# ─── Order ───────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    commodity_id: str
    type:         OrderTypeEnum
    quantity:     float
    price:        float

class OrderResponse(BaseModel):
    id:           UUID
    commodity_id: str
    type:         Optional[str]
    quantity:     float
    price:        float
    total:        float
    status:       Optional[str]
    created_at:   datetime

    model_config = {"from_attributes": True}

# ─── Backtest ─────────────────────────────────────────────────────────────────

class BacktestResultResponse(BaseModel):
    id:           UUID
    commodity_id: Optional[str]
    roi:          Optional[float]
    savings:      Optional[float]
    net_benefit:  Optional[float]
    win_rate:     Optional[float]
    total_trades: Optional[int]
    avg_profit:   Optional[float]
    start_date:   Optional[datetime]
    end_date:     Optional[datetime]

    model_config = {"from_attributes": True}

# ─── Health ──────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status:    str
    timestamp: str
    version:   str = "1.0.0"
