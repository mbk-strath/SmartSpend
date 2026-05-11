# SmartSpend 💸

A full-stack personal finance tracker built with **React + Tailwind CSS (Vite)** on the frontend and **FastAPI + PostgreSQL** on the backend.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router v6 |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Database | PostgreSQL |

---

## Project Structure

```
smartspend/
├── frontend/         # React + Tailwind CSS (Vite)
│   └── src/
│       ├── components/   # Header, SummaryCard, TransactionForm, Charts
│       ├── pages/        # Login, Dashboard, Analytics
│       └── services/     # Axios API layer
└── backend/          # FastAPI
    └── app/
        ├── api/          # auth, transactions, analytics routers
        ├── models/       # SQLAlchemy ORM models
        └── schemas/      # Pydantic request/response schemas
```

---

## Setup

### 1. Database

Create a PostgreSQL database:

```bash
createdb smartspend
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local
# Edit .env with your DATABASE_URL and a strong SECRET_KEY

# Run the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |

### Transactions (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions/` | List all (with filters) |
| POST | `/api/transactions/` | Create transaction |
| PATCH | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |

### Analytics (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Income/expense/balance totals |
| GET | `/api/analytics/by-category` | Grouped by category |
| GET | `/api/analytics/monthly-trend` | Month-by-month breakdown |
| GET | `/api/analytics/recent-transactions` | Latest N transactions |

---

## Features

- 🔐 JWT authentication (register / login)
- ➕ Add, edit, delete income & expense transactions
- 📊 Dashboard with monthly KPI cards
- 📈 Analytics page: area trend chart, bar/pie category charts
- 🔍 Search and filter transactions
- 💰 Savings rate calculation
- 🌑 Dark theme with obsidian palette
