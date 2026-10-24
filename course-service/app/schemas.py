from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=30)
    description: str | None = None
    duration: str = Field(min_length=1, max_length=50)


class CourseUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=30)
    description: str | None = None
    duration: str = Field(min_length=1, max_length=50)


class CourseResponse(BaseModel):
    id: int
    name: str
    code: str
    description: str | None
    duration: str

    model_config = {"from_attributes": True}


class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)


class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int

    model_config = {"from_attributes": True}