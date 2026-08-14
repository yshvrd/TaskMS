from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.db_models import User
from utils.auth_utils import get_current_user
from utils.db_utils import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    if current_user.role == 'admin':
        return (
            db.query(User)
            .order_by(User.name.asc())
            .all()
        )
    else:
        raise HTTPException(status_code=400, detail="You do not have permission to fetch all users.")
        
