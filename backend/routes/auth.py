from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.db_models import User
from schemas.pydantic_schema import LoginRequest, TokenResponse
from services.auth_service import login_user
from utils.db_utils import get_db
from utils.auth_utils import get_current_user
from utils.logger import logger


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email {data.email}")

    try:
        token = login_user(email=data.email, password=data.password, db=db)
        
    except ValueError:
        logger.warning(f"Failed login attempt for email {data.email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )
    
    logger.info(f"Login successful for email {data.email}")

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching user info for user: {current_user.email}")
    return current_user
