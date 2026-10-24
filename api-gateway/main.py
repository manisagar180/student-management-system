import os

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

app = FastAPI(
    title="Student Management API Gateway",
    description="Central gateway for Authentication, Student and Course services",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv(
    "AUTH_SERVICE_URL", "http://127.0.0.1:8001"
)

STUDENT_SERVICE_URL = os.getenv(
    "STUDENT_SERVICE_URL", "http://127.0.0.1:8002"
)

COURSE_SERVICE_URL = os.getenv(
    "COURSE_SERVICE_URL", "http://127.0.0.1:8003"
)


async def forward_request(request: Request, service_url: str, path: str):
    target_url = f"{service_url}/{path}"

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {
            "host",
            "content-length",
            "connection"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                params=request.query_params,
                content=await request.body(),
                headers=headers
            )

        excluded_headers = {
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection"
        }

        response_headers = {
            key: value
            for key, value in response.headers.items()
            if key.lower() not in excluded_headers
        }

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("content-type")
        )

    except httpx.RequestError:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Backend service is unavailable",
                "service": service_url
            }
        )


@app.get("/")
def home():
    return {
        "message": "Student Management API Gateway is running",
        "services": {
            "auth": AUTH_SERVICE_URL,
            "students": STUDENT_SERVICE_URL,
            "courses": COURSE_SERVICE_URL
        }
    }


@app.api_route(
    "/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
)
async def auth_gateway(request: Request, path: str):
    return await forward_request(
        request, AUTH_SERVICE_URL, f"auth/{path}"
    )


@app.api_route(
    "/students",
    methods=["GET", "POST"]
)
async def students_gateway(request: Request):
    return await forward_request(
        request, STUDENT_SERVICE_URL, "students"
    )


@app.api_route(
    "/students/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
)
async def student_gateway(request: Request, path: str):
    return await forward_request(
        request, STUDENT_SERVICE_URL, f"students/{path}"
    )


@app.api_route(
    "/courses",
    methods=["GET", "POST"]
)
async def courses_gateway(request: Request):
    return await forward_request(
        request, COURSE_SERVICE_URL, "courses"
    )


@app.api_route(
    "/courses/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
)
async def course_gateway(request: Request, path: str):
    return await forward_request(
        request, COURSE_SERVICE_URL, f"courses/{path}"
    )