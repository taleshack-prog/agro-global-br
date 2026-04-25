-- =============================================================================
-- Global Agro BR — TimescaleDB Schema + Queries
-- Requires: TimescaleDB extension on PostgreSQL 15+
-- =============================================================================

-- Enable extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- =============================================================================
-- TABLES + HYPERTABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS prices (
  time        TIMESTAMPTZ  NOT NULL,
  commodity   TEXT         NOT NULL,
  price       NUMERIC(14,4) NOT NULL,
  change_pct  NUMERIC(8,4),
  source      TEXT,
  currency    TEXT DEFAULT 'BRL'
);
SELECT create_hypertable('prices', 'time', if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day');
CREATE INDEX IF NOT EXISTS idx_prices_commodity_time ON prices (commodity, time DESC);

CREATE TABLE IF NOT EXISTS risk_metrics (
  time         TIMESTAMPTZ  NOT NULL,
  commodity    TEXT         NOT NULL,
  var_95       NUMERIC(10,4),
  volatility   NUMERIC(8,4),
  margin       NUMERIC(14,2),
  margin_pct   NUMERIC(8,4),
  risk_level   TEXT CHECK (risk_level IN ('low','medium','high'))
);
SELECT create_hypertable('risk_metrics', 'time', if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day');
CREATE INDEX IF NOT EXISTS idx_risk_commodity_time ON risk_metrics (commodity, time DESC);

CREATE TABLE IF NOT EXISTS hedge_recommendations (
  time             TIMESTAMPTZ NOT NULL,
  commodity        TEXT        NOT NULL,
  action           TEXT        CHECK (action IN ('HEDGE_RECOMMENDED','MONITOR')),
  protection_level NUMERIC(5,2),
  futures_contract TEXT,
  reason           TEXT,
  risk_level       TEXT
);
SELECT create_hypertable('hedge_recommendations', 'time', if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day');

-- =============================================================================
-- CONTINUOUS AGGREGATES (materialised views refreshed automatically)
-- =============================================================================

-- Hourly OHLCV per commodity
CREATE MATERIALIZED VIEW IF NOT EXISTS prices_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  commodity,
  FIRST(price, time)     AS open,
  MAX(price)             AS high,
  MIN(price)             AS low,
  LAST(price, time)      AS close,
  COUNT(*)               AS ticks,
  STDDEV(change_pct)     AS volatility_1h
FROM prices
GROUP BY bucket, commodity
WITH NO DATA;

SELECT add_continuous_aggregate_policy('prices_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset   => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists => TRUE);

-- Daily summary
CREATE MATERIALIZED VIEW IF NOT EXISTS prices_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', time) AS bucket,
  commodity,
  FIRST(price, time)         AS open,
  MAX(price)                 AS high,
  MIN(price)                 AS low,
  LAST(price, time)          AS close,
  AVG(price)                 AS avg_price,
  STDDEV(change_pct)         AS volatility_1d,
  COUNT(*)                   AS ticks
FROM prices
GROUP BY bucket, commodity
WITH NO DATA;

SELECT add_continuous_aggregate_policy('prices_daily',
  start_offset => INTERVAL '2 days',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE);

-- =============================================================================
-- QUERY LIBRARY
-- =============================================================================

-- 1. Cotação mais recente por commodity
SELECT DISTINCT ON (commodity)
  commodity, price, change_pct, source, currency, time
FROM prices
ORDER BY commodity, time DESC;

-- 2. Candles horários (últimas 24h)
SELECT bucket, commodity, open, high, low, close, volatility_1h
FROM prices_hourly
WHERE bucket > NOW() - INTERVAL '24 hours'
ORDER BY commodity, bucket DESC;

-- 3. Volatilidade histórica 30d
SELECT
  commodity,
  STDDEV(change_pct)  AS vol_30d,
  AVG(change_pct)     AS mean_return,
  MAX(change_pct)     AS max_up,
  MIN(change_pct)     AS max_down,
  COUNT(*)            AS observations
FROM prices
WHERE time > NOW() - INTERVAL '30 days'
GROUP BY commodity
ORDER BY vol_30d DESC;

-- 4. Margem por período (daily)
SELECT
  time_bucket('1 day', time) AS day,
  commodity,
  AVG(margin_pct)  AS avg_margin,
  MIN(margin_pct)  AS min_margin,
  AVG(volatility)  AS avg_vol
FROM risk_metrics
WHERE time > NOW() - INTERVAL '90 days'
GROUP BY day, commodity
ORDER BY day DESC;

-- 5. Recomendações de hedge últimos 7 dias
SELECT
  commodity,
  action,
  COUNT(*)                  AS total,
  AVG(protection_level)     AS avg_protection,
  MAX(time)                 AS last_at
FROM hedge_recommendations
WHERE time > NOW() - INTERVAL '7 days'
GROUP BY commodity, action
ORDER BY total DESC;

-- 6. Períodos de alto risco (vol > 20%)
SELECT
  time_bucket('1 day', time) AS day,
  commodity,
  AVG(volatility)            AS avg_vol,
  MAX(volatility)            AS max_vol,
  COUNT(*)                   AS high_risk_ticks
FROM risk_metrics
WHERE volatility > 20
  AND time > NOW() - INTERVAL '90 days'
GROUP BY day, commodity
ORDER BY day DESC;

-- 7. Backtesting: rendimento após recomendação (próximos 7 dias)
SELECT
  hr.commodity,
  hr.action,
  ROUND(AVG(hr.protection_level), 1)   AS avg_protection_pct,
  ROUND(AVG(p.change_pct), 4)          AS avg_price_change_7d,
  COUNT(DISTINCT hr.time)              AS recommendations
FROM hedge_recommendations hr
LEFT JOIN prices p ON
  hr.commodity = p.commodity
  AND p.time BETWEEN hr.time AND hr.time + INTERVAL '7 days'
WHERE hr.time > NOW() - INTERVAL '90 days'
GROUP BY hr.commodity, hr.action
ORDER BY hr.commodity;

-- 8. Alertas de movimento rápido (> 5% em 1h)
SELECT time, commodity, price, change_pct,
  CASE
    WHEN ABS(change_pct) > 10 THEN 'CRÍTICO'
    WHEN ABS(change_pct) > 5  THEN 'ALTO'
    ELSE 'NORMAL'
  END AS severity
FROM prices
WHERE ABS(change_pct) > 5
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;

-- 9. Dashboard executivo — snapshot atual
SELECT
  p.commodity,
  p.price             AS current_price,
  p.change_pct,
  rm.volatility,
  rm.margin_pct,
  rm.risk_level,
  hr.action           AS hedge_action,
  hr.protection_level
FROM prices p
LEFT JOIN LATERAL (
  SELECT * FROM risk_metrics r
  WHERE r.commodity = p.commodity
  ORDER BY r.time DESC LIMIT 1
) rm ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM hedge_recommendations h
  WHERE h.commodity = p.commodity
  ORDER BY h.time DESC LIMIT 1
) hr ON TRUE
WHERE p.time = (SELECT MAX(time) FROM prices)
ORDER BY p.commodity;

-- =============================================================================
-- FUNCTION: Parametric VaR
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_var(
  p_commodity TEXT,
  p_days      INT     DEFAULT 30,
  p_confidence NUMERIC DEFAULT 0.95
) RETURNS TABLE (
  commodity    TEXT,
  var_95       NUMERIC,
  volatility   NUMERIC,
  mean_return  NUMERIC,
  observations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_commodity,
    ROUND((AVG(change_pct) - 1.645 * STDDEV(change_pct))::NUMERIC, 4),
    ROUND(STDDEV(change_pct)::NUMERIC, 4),
    ROUND(AVG(change_pct)::NUMERIC, 4),
    COUNT(*)
  FROM prices
  WHERE commodity = p_commodity
    AND time > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql STABLE;
-- Usage: SELECT * FROM calculate_var('soja', 30);

-- =============================================================================
-- VIEW: High-risk commodities
-- =============================================================================
CREATE OR REPLACE VIEW high_risk_commodities AS
SELECT
  commodity,
  volatility,
  margin_pct,
  risk_level,
  time,
  CASE
    WHEN volatility > 20 AND margin_pct < 8  THEN 'CRÍTICO'
    WHEN volatility > 15 AND margin_pct < 10 THEN 'ALTO'
    WHEN volatility > 10 AND margin_pct < 12 THEN 'MÉDIO'
    ELSE 'BAIXO'
  END AS combined_risk
FROM risk_metrics
WHERE time = (SELECT MAX(time) FROM risk_metrics)
ORDER BY volatility DESC;

-- =============================================================================
-- RETENTION POLICIES (auto-delete old raw data, keep aggregates)
-- =============================================================================
SELECT add_retention_policy('prices',        INTERVAL '1 year',  if_not_exists => TRUE);
SELECT add_retention_policy('risk_metrics',  INTERVAL '2 years', if_not_exists => TRUE);
SELECT add_retention_policy('hedge_recommendations', INTERVAL '3 years', if_not_exists => TRUE);
