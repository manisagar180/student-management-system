from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

from . import models, schemas
from .database import Base, engine, get_db

load_dotenv()

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "development-secret-change-before-submission"
)
ALGORITHM = "HS256"

security = HTTPBearer()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management Service",
    description="Student CRUD operations with JWT authentication",
    version="1.0.0"
)


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return user_id

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@app.get("/")
def home():
    return {"message": "Student Management Service is running"}


@app.post("/students", response_model=schemas.StudentResponse, status_code=201)
def create_student(
    data: schemas.StudentCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    existing = db.query(models.Student).filter(
        models.Student.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Student email already exists"
        )

    student = models.Student(**data.model_dump())

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


@app.get("/students", response_model=list[schemas.StudentResponse])
def get_students(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    return db.query(models.Student).all()


@app.get("/students/{student_id}", response_model=schemas.StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


@app.put("/students/{student_id}", response_model=schemas.StudentResponse)
def update_student(
    student_id: int,
    data: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    duplicate_email = db.query(models.Student).filter(
        models.Student.email == data.email,
        models.Student.id != student_id
    ).first()

    if duplicate_email:
        raise HTTPException(
            status_code=400,
            detail="Email already belongs to another student"
        )

    for key, value in data.model_dump().items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    return student


@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return {"message": "Student deleted successfully"}