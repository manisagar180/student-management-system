import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

load_dotenv()

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "development-secret-change-before-submission"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()
security = HTTPBearer()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management - Authentication Service",
    description="Registration, login and JWT authentication",
    version="1.0.0"
)


def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = int(payload.get("sub"))

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User not found or inactive"
        )

    return user


@app.get("/")
def home():
    return {"message": "Authentication Service is running"}


@app.post(
    "/auth/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: schemas.RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = models.User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=password_hash.hash(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(
    data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user or not password_hash.verify(
        data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive"
        )

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer"
    }


@app.get("/auth/me", response_model=schemas.UserResponse)
def get_profile(
    current_user: models.User = Depends(get_current_user)
):
    return current_user