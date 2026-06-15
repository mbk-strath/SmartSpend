from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class TransactionType(str, enum.Enum):
    income  = "income"
    expense = "expense"

class Transaction(Base):
    __tablename__ = "transactions"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    amount      = Column(Float, nullable=False)
    type        = Column(Enum(TransactionType), nullable=False)
    category    = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date        = Column(DateTime(timezone=True), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner       = relationship("User", back_populates="transactions")
