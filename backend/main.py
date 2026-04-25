"""
Global Agro BR — FastAPI Application
REST API: Commodities · Prices · Risk · Hedge · Auth · Orders
"""

from __future__ import annotations

import os
import logging
from contextlib import asynccontextmanager
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─── Startup / shutdown ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Global Agro BR API starting...")
    try:
        from app.database import create_tables, init_timescaledb
        create_tables()
        init_timescaledb()
    except Exception as e:
        logger.warning(f"DB init warning (non-fatal): {e}")
    logger.info("✅ API ready")
    yield
    logger.info("API shutting down")

# ─── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Global Agro BR API",
    description="FastAPI backend — Hedge · Risk · Prices · TimescaleDB · Kafka",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth routes ──────────────────────────────────────────────────────────────

from app.database import get_db
from app.models   import User
from app.schemas  import Token, UserCreate, UserResponse
from app.auth     import create_access_token, hash_password, verify_password, get_current_user_id
import uuid as _uuid

@app.get("/", tags=["root"])
def root():
    return {"name": "Global Agro BR API", "version": "1.0.0", "docs": "/docs"}

@app.post("/auth/register", response_model=UserResponse, status_code=201, tags=["auth"])
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        id=_uuid.uuid4(),
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/token", response_model=Token, tags=["auth"])
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials",
                            headers={"WWW-Authenticate": "Bearer"})
    token = create_access_token({"sub": str(user.id)}, timedelta(hours=int(os.getenv("JWT_EXPIRATION_HOURS", "24"))))
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
def me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == _uuid.UUID(user_id)).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

# ─── API routes ───────────────────────────────────────────────────────────────

from app.routes import router as api_router
app.include_router(api_router)

# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info",
    )
