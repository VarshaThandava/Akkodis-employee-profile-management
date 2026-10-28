# HRMS Lite

Lightweight HRMS (Human Resource Management System) with a **FastAPI** backend and **React** frontend. Backend uses **SQLAlchemy 2** and **Pydantic**; supports **PostgreSQL** (e.g. Supabase) with **SQLite** fallback for local development. Frontend is built with **Vite** and **Bootstrap 5**.

## Features

- **Employees**: CRUD with unique `employee_id` and `email`, validation, conflict handling
- **Attendance**: Record attendance (Present/Absent) per employee per date, with filters and `total_present_days`
- **Dashboard**: Summary stats (total employees, today’s attendance, present/absent)
- **Production-ready**: CORS, structured logging, graceful error responses, .env configuration

## Requirements

- **Backend**: Python 3.10+; PostgreSQL (optional; SQLite for local dev)
- **Frontend**: Node.js 18+ and npm

---

## Quick start

### 1. Clone and enter the project

```bash
cd HRMS_Lite
```

### 2. Backend

Create a virtual environment (recommended):

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

Install dependencies and configure environment:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` if needed. Default SQLite is fine for local dev.

Run the API server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API base**: http://127.0.0.1:8000  
- **Interactive docs**: http://127.0.0.1:8000/docs  
- **Health check**: http://127.0.0.1:8000/health  

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**. API requests are proxied to `http://127.0.0.1:8000` (see `frontend/vite.config.js`).

---

## Backend

### Environment variables

| Variable         | Description                                      | Default |
|------------------|--------------------------------------------------|---------|
| `DATABASE_URL`   | PostgreSQL or SQLite connection string           | `sqlite:///./hrms_lite.db` |
| `ECHO_SQL`       | Log SQL statements (debug)                       | `false` |
| `ENVIRONMENT`    | `development` / `staging` / `production`         | `development` |
| `LOG_LEVEL`      | Logging level: DEBUG, INFO, WARNING, ERROR       | `INFO` |
| `CORS_ORIGINS`   | Comma-separated allowed origins                  | localhost:3000, localhost:5173 |

### API overview

| Method | Endpoint                         | Description                |
|--------|----------------------------------|----------------------------|
| GET    | `/health`                        | Health check               |
| POST   | `/api/employees`                 | Create employee            |
| GET    | `/api/employees`                | List employees             |
| GET    | `/api/employees/{id}`           | Get employee by id         |
| PATCH  | `/api/employees/{id}`           | Update employee            |
| DELETE | `/api/employees/{id}`           | Delete employee            |
| POST   | `/api/attendance`                | Create attendance record   |
| GET    | `/api/attendance/{employee_id}` | Attendance for employee (+ date filter, total_present_days) |
| GET    | `/api/attendance`                | List attendance (filters)  |
| GET    | `/api/attendance/record/{id}`    | Get one attendance record  |
| PATCH  | `/api/attendance/record/{id}`   | Update attendance          |
| DELETE | `/api/attendance/record/{id}`   | Delete attendance          |

### Backend structure

```
app/
├── main.py              # FastAPI app, CORS, lifespan, exception handlers
├── core/
│   ├── config.py        # Settings from .env (pydantic-settings)
│   ├── database.py      # SQLAlchemy engine and session
│   └── logging_config.py
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic request/response schemas
├── crud/                # Database operations
├── routes/              # API route modules
└── utils/               # Exceptions, error schemas
```

---

## Frontend

### Commands

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start dev server (Vite)    |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |

**API URL:** In development, the app uses the Vite proxy to talk to `http://127.0.0.1:8000`. For production, set `VITE_API_URL` in `frontend/.env.production` (e.g. `https://hrsm-project-11zr.onrender.com`). The build then uses that backend.

### Frontend structure

- `src/components/` – Reusable UI (Button, Input, Card, Table, EmptyState, LoadingSpinner)
- `src/contexts/` – React context (e.g. Toast)
- `src/hooks/` – Custom hooks (useEmployees, useAttendance, useDashboardStats)
- `src/layouts/` – Main layout (sidebar + content)
- `src/pages/` – Dashboard, Employees, Attendance
- `src/services/` – Axios API client
- `src/styles/` – Global CSS (design system)

---

## CORS

Backend CORS defaults include `http://localhost:3000` and `http://localhost:5173`. Set `CORS_ORIGINS` in `.env` to add or override (comma-separated).

## Error responses

API errors return a consistent JSON shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found",
    "detail": "Employee with id '42' not found"
  }
}
```

- **404**: Resource not found  
- **409**: Conflict (duplicate or constraint violation)  
- **422**: Validation error  
- **500**: Unhandled error (details logged server-side)

## License

MIT
