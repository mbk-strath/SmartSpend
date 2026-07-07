from calendar import monthrange
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from typing import Optional
from app.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(year: Optional[int] = None, month: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if year:  q = q.filter(extract("year",  Transaction.date) == year)
    if month: q = q.filter(extract("month", Transaction.date) == month)
    txs     = q.all()
    income  = sum(t.amount for t in txs if t.type == TransactionType.income)
    expense = sum(t.amount for t in txs if t.type == TransactionType.expense)
    return {"total_income": round(income, 2), "total_expense": round(expense, 2), "net_balance": round(income - expense, 2), "transaction_count": len(txs)}

@router.get("/weekly-spending")
def get_weekly_spending(year: Optional[int] = None, month: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now()
    selected_year = year or now.year
    selected_month = month or now.month
    days_in_month = monthrange(selected_year, selected_month)[1]
    week_count = ((days_in_month - 1) // 7) + 1
    weeks = {
        week: {
            "week": f"W{week}",
            "expense": 0,
        }
        for week in range(1, week_count + 1)
    }

    txs = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.expense,
            extract("year", Transaction.date) == selected_year,
            extract("month", Transaction.date) == selected_month,
        )
        .all()
    )

    for tx in txs:
        week = ((tx.date.day - 1) // 7) + 1
        weeks[week]["expense"] += tx.amount

    return [
        {"week": row["week"], "expense": round(row["expense"], 2)}
        for row in weeks.values()
    ]

@router.get("/by-category")
def get_by_category(type: Optional[TransactionType] = None, year: Optional[int] = None, month: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Transaction.category, Transaction.type, func.sum(Transaction.amount).label("total"), func.count(Transaction.id).label("count")).filter(Transaction.user_id == current_user.id)
    if type:  q = q.filter(Transaction.type == type)
    if year:  q = q.filter(extract("year",  Transaction.date) == year)
    if month: q = q.filter(extract("month", Transaction.date) == month)
    results = q.group_by(Transaction.category, Transaction.type).all()
    return [{"category": r.category, "type": r.type, "total": round(r.total, 2), "count": r.count} for r in results]

@router.get("/monthly-trend")
def get_monthly_trend(year: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(extract("year", Transaction.date).label("year"), extract("month", Transaction.date).label("month"), Transaction.type, func.sum(Transaction.amount).label("total")).filter(Transaction.user_id == current_user.id)
    if year: q = q.filter(extract("year", Transaction.date) == year)
    results = q.group_by("year", "month", Transaction.type).order_by("year", "month").all()
    trend = {}
    for r in results:
        key = f"{int(r.year)}-{int(r.month):02d}"
        if key not in trend:
            trend[key] = {"month": key, "income": 0, "expense": 0}
        trend[key][r.type.value] = round(r.total, 2)
    return list(trend.values())

@router.get("/recent-transactions")
def get_recent(limit: int = Query(default=5, le=20), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).limit(limit).all()
