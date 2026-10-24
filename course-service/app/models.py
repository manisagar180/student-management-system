from sqlalchemy import Column, Integer, String, Text, UniqueConstraint
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(30), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(50), nullable=False)


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint(
            "course_id",
            "student_id",
            name="unique_course_student"
        ),
    )