import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

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
    title="Course Management Service",
    description="Course CRUD and student enrollment",
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
    return {"message": "Course Management Service is running"}


@app.post("/courses", response_model=schemas.CourseResponse, status_code=201)
def create_course(
    data: schemas.CourseCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    existing = db.query(models.Course).filter(
        models.Course.code == data.code
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Course code already exists"
        )

    course = models.Course(**data.model_dump())

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


@app.get("/courses", response_model=list[schemas.CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    return db.query(models.Course).all()


@app.get("/courses/{course_id}", response_model=schemas.CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@app.put("/courses/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    data: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    duplicate = db.query(models.Course).filter(
        models.Course.code == data.code,
        models.Course.id != course_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Course code already belongs to another course"
        )

    for key, value in data.model_dump().items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    return course


@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    ).delete()

    db.delete(course)
    db.commit()

    return {"message": "Course deleted successfully"}


@app.post(
    "/courses/{course_id}/students",
    response_model=schemas.EnrollmentResponse,
    status_code=201
)
def enroll_student(
    course_id: int,
    data: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.student_id == data.student_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Student is already enrolled"
        )

    enrollment = models.Enrollment(
        course_id=course_id,
        student_id=data.student_id
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment


@app.get(
    "/courses/{course_id}/students",
    response_model=list[schemas.EnrollmentResponse]
)
def get_enrolled_students(
    course_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    ).all()