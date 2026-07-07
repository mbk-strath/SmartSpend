# SmartSpend

SmartSpend is a personal finance tracking system that helps users record income
and expenses, categorize transactions, view dashboard summaries, and analyze
spending patterns.

The frontend uses React, Vite, Tailwind CSS, and Recharts. The backend uses
FastAPI, SQLAlchemy, and PostgreSQL.

## Design Notes

- The frontend uses Rubik as the site-wide font through `frontend/index.html`
  and `frontend/src/index.css`.
- Existing font sizes are preserved; only the font family was changed.

## Features

- User registration and login
- Income and expense tracking
- Add, edit, and delete transactions
- Dashboard summaries
- Analytics and charts
- Category-based spending analysis

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Authentication | JWT, python-jose, passlib, bcrypt |
| Database | PostgreSQL |

## Project Structure

```text
smartspend/
|-- frontend/
|   `-- src/
|       |-- components/
|       |-- pages/
|       `-- services/
`-- backend/
    `-- app/
        |-- api/
        |-- models/
        `-- schemas/
```

## Prerequisites

Install the following before running the project:

- Git
- Node.js 18 or newer and npm
- Python 3.10 or newer
- PostgreSQL

## First-Time Setup

### 1. Clone the Repository

Replace `<repository-url>` with the Git URL for this project:

```bash
git clone <repository-url>
cd smartspend
```

If the repository is already on your computer, skip this step and follow the
"Pull Latest Changes" section instead.

### 2. Create the PostgreSQL Database

```bash
createdb smartspend
```

You can also create a database named `smartspend` using pgAdmin or another
PostgreSQL client.

### 3. Configure and Install the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` with the following values. Replace the username, password,
and secret key with your own values:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/smartspend
SECRET_KEY=replace_with_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Return to the project root:

```bash
cd ..
```

### 4. Install the Frontend

```bash
cd frontend
npm install
cd ..
```

## Run the Project

The backend and frontend must run at the same time in separate terminals.

### Terminal 1: Start the Backend

From the project root:

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

Using `python -m uvicorn` ensures the server runs with the Python interpreter
from the active virtual environment.

### Terminal 2: Start the Frontend

From the project root:

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

The Vite development server forwards frontend `/api` requests to the backend
running on port `8000`.

## Pull Latest Changes

Before pulling, commit or temporarily store any local changes you want to keep.
Then run these commands from the project root:

```bash
git pull
```

Update dependencies after pulling:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install

cd ..
```

Restart both development servers after installing updated dependencies.

## Production Checks

Build the frontend:

```bash
cd frontend
npm run build
```

Check that the backend imports successfully while PostgreSQL is running:

```bash
cd backend
source venv/bin/activate
python -c "from app.main import app; print(app.title)"
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get the current user |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions/` | List transactions |
| POST | `/api/transactions/` | Create a transaction |
| PATCH | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Get income, expense, and balance totals |
| GET | `/api/analytics/by-category` | Get category totals |
| GET | `/api/analytics/monthly-trend` | Get the monthly trend |
| GET | `/api/analytics/recent-transactions` | Get recent transactions |
