from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.auth import get_current_user
from app.services.mpesa_service import stk_push

router = APIRouter(prefix="/api/mpesa", tags=["mpesa"])


class STKPushRequest(BaseModel):
    phone: str   # format: 2547XXXXXXXX
    amount: int
    category: str = "Shopping"
    title: str = "M-Pesa Payment"


@router.post("/pay")
def initiate_payment(
    body: STKPushRequest,
    current_user: User = Depends(get_current_user),
):
    """Trigger STK Push to user's phone."""
    try:
        result = stk_push(phone=body.phone, amount=body.amount, account_ref="SmartSpend")
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """Safaricom calls this after payment. Saves transaction to DB."""
    data = await request.json()

    try:
        stk = data["Body"]["stkCallback"]
        result_code = stk["ResultCode"]

        if result_code != 0:
            # Payment failed or cancelled — just acknowledge
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        items = {i["Name"]: i.get("Value") for i in stk["CallbackMetadata"]["Item"]}
        amount = int(items.get("Amount", 0))
        mpesa_code = items.get("MpesaReceiptNumber", "UNKNOWN")
        phone = str(items.get("PhoneNumber", ""))

        # Save as an expense transaction
        # We can't tie to a specific user from callback alone without a session mapping,
        # so we store it against the first matching phone or as a standalone record.
        tx = Transaction(
            title=f"M-Pesa {mpesa_code}",
            amount=amount,
            type=TransactionType.expense,
            category="M-Pesa",
            description=f"Phone: {phone} | Code: {mpesa_code}",
            date=datetime.utcnow(),
            user_id=1,  # update this if you add phone→user mapping later
        )
        db.add(tx)
        db.commit()

    except Exception as e:
        print(f"[MPESA CALLBACK ERROR] {e}")

    return {"ResultCode": 0, "ResultDesc": "Accepted"}
