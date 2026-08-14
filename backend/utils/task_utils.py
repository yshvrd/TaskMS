from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.db_models import Task, User

def get_user_task(task_id: int, current_user: User, db: Session) -> Task:
    query = db.query(Task).filter(Task.id == task_id)

    if current_user.role != "admin":
        query = query.filter(Task.assigned_to == current_user.id)

    task = query.first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found",)

    return task
