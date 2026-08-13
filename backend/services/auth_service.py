from datetime import datetime, timedelta, timezone
import os

from dotenv import load_dotenv
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from models.db_models import User


load_dotenv()


password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire,}

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise ValueError

        return int(user_id)

    except (JWTError, ValueError):
        raise ValueError("Invalid or expired token")


def login_user(email: str, password: str, db: Session) -> str:

    user = (db.query(User).filter(User.email == email).first())

    if not user:
        raise ValueError("Invalid email or password")
    if not verify_password(password, user.hashed_password,):
        raise ValueError("Invalid email or password")

    return create_access_token(user.id)
