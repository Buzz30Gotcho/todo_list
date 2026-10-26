import time

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from fastapi import APIRouter

def init_db() -> None:
    """Attend que PostgreSQL soit prêt puis crée les tables."""
    for attempt in range(15):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            print(f"DB pas encore prête, tentative {attempt + 1}/15...")
            time.sleep(2)
    raise RuntimeError("Impossible de se connecter à la base de données")


init_db()

app = FastAPI(title="Todo List API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/todos", response_model=list[schemas.TodoOut])
def list_todos(db: Session = Depends(get_db)):
    return (
        db.query(models.Todo)
        .order_by(models.Todo.completed, models.Todo.created_at.desc())
        .all()
    )


@router.post("/todos", response_model=schemas.TodoOut, status_code=201)
def create_todo(payload: schemas.TodoCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Le titre est obligatoire")
    todo = models.Todo(**payload.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.get("/todos/{todo_id}", response_model=schemas.TodoOut)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.get(models.Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return todo


@router.put("/todos/{todo_id}", response_model=schemas.TodoOut)
def update_todo(
    todo_id: int, payload: schemas.TodoUpdate, db: Session = Depends(get_db)
):
    todo = db.get(models.Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(todo, key, value)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.get(models.Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    db.delete(todo)
    db.commit()

app.include_router(router, prefix="/api")