from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from models.db_models import Task
from schemas.pydantic_schema import TaskCreate, TaskResponse, TaskUpdate
from utils.db_utils import get_db
from utils.auth_utils import get_current_user


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
    current_user=Depends(get_current_user),
):
    query = db.query(Task)

    # Filters
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
            query = query.filter(Task.assigned_to == int(assignee))

    # Sorting
    sort_columns = {
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
        "due_date": Task.due_date,
        "title": Task.title,
        "priority": Task.priority,
        "status": Task.status,
    }

    column = sort_columns.get(sort_by, Task.created_at)

    if sort_order == "asc":
        query = query.order_by(column.asc())
    else:
        query = query.order_by(column.desc())

    # Pagination
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


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = Task(**data.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = db.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task
