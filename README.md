# Student Management System – Microservices Architecture

## 1. Project Overview

The Student Management System is a full-stack application developed using a Microservices Architecture.

It allows users to register and log in securely, manage student records, manage courses, and enroll students into courses.

The application uses separate backend services connected through a centralized API Gateway.

## 2. Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- React Router DOM
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- HTTPX

### Database
- SQLite

### API Testing
- Postman
- Swagger UI

## 3. System Architecture

The project consists of four backend services:

1. Authentication Service – Handles user registration, login, password hashing, and JWT authentication.
2. Student Service – Handles student creation, retrieval, updating, and deletion.
3. Course Service – Handles course management and student enrollment.
4. API Gateway – Provides a centralized entry point and forwards requests to the appropriate microservice.

### Architecture Flow

React Frontend
       |
       v
API Gateway (Port 8000)
       |
       |---- Authentication Service (Port 8001)
       |
       |---- Student Service (Port 8002)
       |
       |---- Course Service (Port 8003)

Each backend service maintains its own SQLite database.

## 4. Main Features

### Authentication
- User registration
- User login
- Secure password hashing
- JWT-based authentication
- Protected routes

### Student Management
- Add students
- View all students
- View individual student details
- Update student details
- Delete students

### Course Management
- Add courses
- View available courses
- Update courses
- Delete courses

### Student Enrollment
- Enroll students into courses
- View enrolled students

### Dashboard
- Display student count
- Display course count
- Display logged-in user information

## 5. Project Structure

student-management/
|
|-- frontend/
|   |-- src/
|       |-- components/
|       |-- pages/
|       |-- services/
|       |-- App.jsx
|       |-- main.jsx
|       |-- index.css
|
|-- auth-service/
|   |-- app/
|       |-- main.py
|       |-- models.py
|       |-- schemas.py
|       |-- database.py
|
|-- student-service/
|   |-- app/
|       |-- main.py
|       |-- models.py
|       |-- schemas.py
|       |-- database.py
|
|-- course-service/
|   |-- app/
|       |-- main.py
|       |-- models.py
|       |-- schemas.py
|       |-- database.py
|
|-- api-gateway/
|   |-- main.py
|
|-- postman/
|   |-- collection.json
|
|-- README.md
|-- .gitignore
|-- .env.example

## 6. Installation and Setup

### Prerequisites
- Python 3.10 or higher
- Node.js and npm
- VS Code
- Postman

### Backend Setup

Navigate to the project root:

```bash
cd student-management
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install fastapi "uvicorn[standard]" sqlalchemy "pydantic[email]" "python-jose[cryptography]" "pwdlib[argon2]" httpx python-dotenv python-multipart
```

### Start Backend Services

Run each service in a separate terminal.

Authentication Service:

```bash
cd auth-service
uvicorn app.main:app --reload --port 8001
```

Student Service:

```bash
cd student-service
uvicorn app.main:app --reload --port 8002
```

Course Service:

```bash
cd course-service
uvicorn app.main:app --reload --port 8003
```

API Gateway:

```bash
cd api-gateway
uvicorn main:app --reload --port 8000
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application:

http://localhost:5173/

## 7. Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://127.0.0.1:8000 |
| Authentication | http://127.0.0.1:8001 |
| Student | http://127.0.0.1:8002 |
| Course | http://127.0.0.1:8003 |

Swagger documentation:

- Authentication: http://127.0.0.1:8001/docs
- Student: http://127.0.0.1:8002/docs
- Course: http://127.0.0.1:8003/docs
- Gateway: http://127.0.0.1:8000/docs

## 8. API Endpoints

### Authentication Service
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Student Service
- POST /students
- GET /students
- GET /students/{student_id}
- PUT /students/{student_id}
- DELETE /students/{student_id}

### Course Service
- POST /courses
- GET /courses
- GET /courses/{course_id}
- PUT /courses/{course_id}
- DELETE /courses/{course_id}
- POST /courses/{course_id}/students
- GET /courses/{course_id}/students

## 9. Security

- Passwords are stored using secure password hashing.
- JWT tokens are used for authentication.
- Protected APIs require valid authentication.
- Environment variables should be used for application secrets.
- Development secrets must be replaced before production deployment.

## 10. API Testing

The project includes a Postman collection:

postman/collection.json

It contains requests for:
- User registration and login
- User profile
- Student CRUD operations
- Course CRUD operations
- Student enrollment

## 11. Database

The project uses separate SQLite databases for each microservice.

- Authentication database
- Student database
- Course database

## 12. Future Enhancements

- Role-based access control
- Student and course search
- Pagination and filtering
- Deployment using Docker
- Cloud database integration
- Automated testing

## 13. Conclusion

The Student Management System demonstrates the implementation of a full-stack application using Microservices Architecture.

It provides independent backend services, centralized API routing, JWT authentication, database integration, and a React-based user interface.