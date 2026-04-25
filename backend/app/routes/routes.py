from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth    import get_current_user_id
from app.models  import (
    Commodity, Price, RiskMetric, HedgeRecommendation,
    Alert, Order, BacktestResult, OrderStatus,
)
from app.schemas import (
    CommodityResponse, PriceResponse, RiskMetricResponse,
    HedgeRecommendationResponse, AlertResponse,
    OrderCreate, OrderResponse, BacktestResultResponse, HealthResponse,
)

router = APIRouter(prefix="/api", tags=["api"])

# ─── Health ──────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", timestamp=datetime.utcnow().isoformat())

# ─── Commodities ─────────────────────────────────────────────────────────────

@router.get("/commodities", response_model=List[CommodityResponse])
def list_commodities(db: Session = Depends(get_db)):
    return db.query(Commodity).all()

@router.get("/commodities/{commodity_id}", response_model=CommodityResponse)
def get_commodity(commodity_id: str, db: Session = Depends(get_db)):
    obj = db.query(Commodity).filter(Commodity.id == commodity_id).first()
    if not obj:
        raise HTTPException(404, "Commodity not found")
    return obj

# ─── Prices ──────────────────────────────────────────────────────────────────

@router.get("/prices", response_model=List[PriceResponse])
def list_prices(limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    return db.query(Price).order_by(desc(Price.timestamp)).limit(limit).all()

@router.get("/prices/{commodity_id}/history", response_model=List[PriceResponse])
def price_history(
    commodity_id: str,
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(Price)
        .filter(Price.commodity_id == commodity_id, Price.timestamp >= since)
        .order_by(desc(Price.timestamp))
        .all()
    )

# ─── Risk metrics ─────────────────────────────────────────────────────────────

@router.get("/risk-metrics", response_model=List[RiskMetricResponse])
def list_risk_metrics(db: Session = Depends(get_db)):
    return db.query(RiskMetric).order_by(desc(RiskMetric.timestamp)).all()

@router.get("/risk-metrics/{commodity_id}", response_model=RiskMetricResponse)
def get_risk_metric(commodity_id: str, db: Session = Depends(get_db)):
    obj = (
        db.query(RiskMetric)
        .filter(RiskMetric.commodity_id == commodity_id)
        .order_by(desc(RiskMetric.timestamp))
        .first()
    )
    if not obj:
        raise HTTPException(404, "Risk metrics not found")
    return obj

# ─── Hedge recommendations ────────────────────────────────────────────────────

@router.get("/hedge-recommendations", response_model=List[HedgeRecommendationResponse])
def list_hedge_recommendations(db: Session = Depends(get_db)):
    return db.query(HedgeRecommendation).order_by(desc(HedgeRecommendation.created_at)).all()

@router.get("/hedge-recommendations/{commodity_id}", response_model=HedgeRecommendationResponse)
def get_hedge_recommendation(commodity_id: str, db: Session = Depends(get_db)):
    obj = (
        db.query(HedgeRecommendation)
        .filter(HedgeRecommendation.commodity_id == commodity_id)
        .order_by(desc(HedgeRecommendation.created_at))
        .first()
    )
    if not obj:
        raise HTTPException(404, "Hedge recommendation not found")
    return obj

# ─── Alerts ──────────────────────────────────────────────────────────────────

@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(Alert)
        .filter(Alert.user_id == uuid.UUID(user_id))
        .order_by(desc(Alert.created_at))
        .all()
    )

@router.post("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    obj = db.query(Alert).filter(
        Alert.id == uuid.UUID(alert_id),
        Alert.user_id == uuid.UUID(user_id),
    ).first()
    if not obj:
        raise HTTPException(404, "Alert not found")
    obj.is_read = True
    db.commit()
    return {"status": "ok", "id": alert_id}

# ─── Orders ──────────────────────────────────────────────────────────────────

@router.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(
    body: OrderCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    commodity = db.query(Commodity).filter(Commodity.id == body.commodity_id).first()
    if not commodity:
        raise HTTPException(404, "Commodity not found")

    order = Order(
        id=uuid.uuid4(),
        user_id=uuid.UUID(user_id),
        commodity_id=body.commodity_id,
        type=body.type.value,
        quantity=body.quantity,
        price=body.price,
        total=round(body.quantity * body.price, 2),
        status=OrderStatus.PENDING,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("/orders", response_model=List[OrderResponse])
def list_orders(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.user_id == uuid.UUID(user_id))
        .order_by(desc(Order.created_at))
        .all()
    )

# ─── Backtest ─────────────────────────────────────────────────────────────────

@router.get("/backtest-results", response_model=List[BacktestResultResponse])
def list_backtest_results(db: Session = Depends(get_db)):
    return db.query(BacktestResult).order_by(desc(BacktestResult.created_at)).all()
