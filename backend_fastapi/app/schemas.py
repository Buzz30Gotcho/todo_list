from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TodoBase(BaseModel):
    title: str
    description: str = ""
    completed: bool = False


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None


class TodoOut(TodoBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
