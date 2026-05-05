from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from app.schemas.group import StudyGroupShort

UserRole = Literal["admin", "practice_supervisor", "viewer"]


class UserShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str | None
    role: UserRole
    is_active: bool


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole
    is_active: bool = True
    group_ids: list[int] = Field(default_factory=list)


class UserUpdate(BaseModel):
    password: str | None = Field(default=None, min_length=6, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None
    group_ids: list[int] | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    group_ids: list[int] = Field(default_factory=list)
    groups: list[StudyGroupShort] = Field(default_factory=list)
