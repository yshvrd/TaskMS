from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.db_models import Comment, Task, User
from schemas.pydantic_schema import (
    CommentCreate,
    CommentResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from utils.auth_utils import get_current_user
from utils.db_utils import get_db
from utils.task_utils import get_user_task


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/")
def get_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    assignee: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    query = db.query(Task)

    # Regular users only see their own tasks.
    # Admins see all tasks.
    if current_user.role != "admin":
        query = query.filter(Task.assigned_to == current_user.id)

    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    if status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    if assignee:
        if assignee == "me":
            query = query.filter(Task.assigned_to == current_user.id)
        else:
            try:
                assignee_id = int(assignee)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid assignee")

            query = query.filter(Task.assigned_to == assignee_id)

    sort_columns = {
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
        "due_date": Task.due_date,
        "title": Task.title,
        "priority": Task.priority,
        "status": Task.status,
    }

    column = sort_columns.get(sort_by)

    if not column:
        raise HTTPException(status_code=400, detail="Invalid sort field")

    if sort_order == "asc":
        query = query.order_by(column.asc())
    elif sort_order == "desc":
        query = query.order_by(column.desc())
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort order",
        )
    
    total = query.count()
    offset = (page - 1) * limit
    tasks = (query.offset(offset).limit(limit).all())

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/stats")
def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_query = db.query(Task)

    # Regular users only see their own stats.
    # Admins see team-wide stats.
    if current_user.role != "admin":
        base_query = base_query.filter(Task.assigned_to == current_user.id)

    now = datetime.now(timezone.utc)

    total = base_query.with_entities(func.count(Task.id)).scalar()
    pending = base_query.filter(Task.status == "pending").count()
    in_progress = base_query.filter(Task.status == "in_progress").count()
    completed = base_query.filter(Task.status == "completed").count()
    overdue = base_query.filter(
        Task.due_date.isnot(None),
        Task.due_date < now,
        Task.status != "completed").count()

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "overdue": overdue,
    }


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    return get_user_task(task_id, current_user, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    task = get_user_task(task_id, current_user, db)
    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}",status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    task = get_user_task(task_id, current_user, db)

    db.delete(task)
    db.commit()


@router.get("/{task_id}/comments", response_model=list[CommentResponse])
def get_comments(task_id: int, db: Session = Depends(get_db)):

    return (
        db.query(Comment)
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=201)
def create_comment(task_id: int,data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    comment = Comment(task_id=task_id, user_id=current_user.id, comment=data.comment)

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment
