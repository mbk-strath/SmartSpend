from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    title: str
    amount: float
    type: TransactionType
    category: str
    description: Optional[str] = None
    date: datetime


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
