from __future__ import annotations

import os
import logging
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ─── PostgreSQL ───────────────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://agro:agro123@localhost:5432/global_agro_br")

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=os.getenv("SQLALCHEMY_ECHO", "False").lower() == "true",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — injects a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all tables defined in models (idempotent)."""
    from app.models import Base
    Base.metadata.create_all(bind=engine)
    logger.info("PostgreSQL tables created/verified")


# ─── TimescaleDB ─────────────────────────────────────────────────────────────

TIMESCALEDB_URL = os.getenv(
    "TIMESCALEDB_URL",
    "postgresql://agro:agro123@localhost:5433/global_agro_br_ts",
)

try:
    ts_engine = create_engine(TIMESCALEDB_URL, poolclass=NullPool)
    TSSession  = sessionmaker(autocommit=False, autoflush=False, bind=ts_engine)
    _ts_available = True
except Exception:
    ts_engine     = None  # type: ignore[assignment]
    TSSession     = None  # type: ignore[assignment]
    _ts_available = False


def init_timescaledb() -> None:
    """Create TimescaleDB schema, hypertables and continuous aggregates."""
    if not _ts_available or ts_engine is None:
        logger.warning("TimescaleDB URL not reachable — skipping init")
        return

    ddl = """
        CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

        CREATE TABLE IF NOT EXISTS prices_ts (
            time         TIMESTAMPTZ   NOT NULL,
            commodity_id TEXT          NOT NULL,
            price        DOUBLE PRECISION NOT NULL,
            change_pct   DOUBLE PRECISION,
            sources      TEXT[],
            currency     TEXT DEFAULT 'BRL'
        );

        CREATE TABLE IF NOT EXISTS risk_metrics_ts (
            time         TIMESTAMPTZ   NOT NULL,
            commodity_id TEXT          NOT NULL,
            var_95       DOUBLE PRECISION,
            volatility   DOUBLE PRECISION,
            margin_pct   DOUBLE PRECISION,
            risk_level   TEXT
        );

        CREATE TABLE IF NOT EXISTS hedge_recommendations_ts (
            time             TIMESTAMPTZ NOT NULL,
            commodity_id     TEXT        NOT NULL,
            action           TEXT,
            protection_level DOUBLE PRECISION,
            reason           TEXT,
            risk_level       TEXT
        );
    """

    hypertables = [
        "SELECT create_hypertable('prices_ts',               'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');",
        "SELECT create_hypertable('risk_metrics_ts',         'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');",
        "SELECT create_hypertable('hedge_recommendations_ts','time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');",
    ]

    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_prices_ts_c_t ON prices_ts (commodity_id, time DESC);",
        "CREATE INDEX IF NOT EXISTS idx_risk_ts_c_t   ON risk_metrics_ts (commodity_id, time DESC);",
    ]

    retention = [
        "SELECT add_retention_policy('prices_ts',               INTERVAL '1 year',  if_not_exists => TRUE);",
        "SELECT add_retention_policy('risk_metrics_ts',         INTERVAL '2 years', if_not_exists => TRUE);",
        "SELECT add_retention_policy('hedge_recommendations_ts',INTERVAL '3 years', if_not_exists => TRUE);",
    ]

    with ts_engine.connect() as conn:
        conn.execute(text(ddl))
        for stmt in hypertables + indexes:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                logger.debug(f"TimescaleDB stmt skipped: {e}")
        for stmt in retention:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                logger.debug(f"Retention policy skipped: {e}")
        conn.commit()

    logger.info("TimescaleDB schema ready")
