from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, date
from app.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def get_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if year:
        query = query.filter(extract("year", Transaction.date) == year)
    if month:
        query = query.filter(extract("month", Transaction.date) == month)

    transactions = query.all()
    total_income = sum(t.amount for t in transactions if t.type == TransactionType.income)
    total_expense = sum(t.amount for t in transactions if t.type == TransactionType.expense)

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_balance": round(total_income - total_expense, 2),
        "transaction_count": len(transactions),
    }


@router.get("/by-category")
def get_by_category(
    type: Optional[TransactionType] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        Transaction.category,
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count"),
    ).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if year:
        query = query.filter(extract("year", Transaction.date) == year)
    if month:
        query = query.filter(extract("month", Transaction.date) == month)

    results = query.group_by(Transaction.category, Transaction.type).all()
    return [
        {"category": r.category, "type": r.type, "total": round(r.total, 2), "count": r.count}
        for r in results
    ]


@router.get("/monthly-trend")
def get_monthly_trend(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        extract("year", Transaction.date).label("year"),
        extract("month", Transaction.date).label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
    ).filter(Transaction.user_id == current_user.id)

    if year:
        query = query.filter(extract("year", Transaction.date) == year)

    results = query.group_by("year", "month", Transaction.type).order_by("year", "month").all()

    trend = {}
    for r in results:
        key = f"{int(r.year)}-{int(r.month):02d}"
        if key not in trend:
            trend[key] = {"month": key, "income": 0, "expense": 0}
        trend[key][r.type.value] = round(r.total, 2)

    return list(trend.values())


@router.get("/recent-transactions")
def get_recent(
    limit: int = Query(default=5, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import desc
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(desc(Transaction.date))
        .limit(limit)
        .all()
    )
    return txs
