from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from utils.db_utils import get_db
from utils.auth_utils import get_current_user
from models.db_models import User
from schemas.pydantic_schema import UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

# Password hashing setup using your existing pwdlib and Argon2
password_hash_context = PasswordHash((Argon2Hasher(),))

def get_password_hash(password: str) -> str:
    return password_hash_context.hash(password)

# Dependency Helper: Block normal members
def require_admin(user: User):
    if user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")

@router.get("/")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    return db.query(User).all()

@router.post("/")
def create_user(data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    # Rule: Only a Superadmin can create another Superadmin
    if data.role == "superadmin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only a superadmin can create another superadmin.")

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Rule: Admins cannot modify Superadmins
    if target_user.role == "superadmin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Admins cannot modify a superadmin account.")

    # Rule: Admins cannot promote someone to Superadmin
    if data.role == "superadmin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only a superadmin can assign the superadmin role.")

    if data.name:
        target_user.name = data.name
        
    if data.email:
        # Check if the new email is already taken by someone else
        existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        target_user.email = data.email
        
    if data.password:
        target_user.hashed_password = get_password_hash(data.password)
        
    if data.role:
        target_user.role = data.role
        
    db.commit()
    db.refresh(target_user)
    return target_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Rule: Admins cannot delete Superadmins
    if target_user.role == "superadmin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Admins cannot delete a superadmin account.")
        
    # Rule: Nobody can delete themselves
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
        
    db.delete(target_user)
    db.commit()
    return {"detail": "User deleted successfully"}
