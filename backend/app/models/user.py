from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class UserRole(str, Enum):
    CONTRACTOR = "contractor"
    CONSULTANT = "consultant"
    QUANTITY_SURVEYOR = "quantity_surveyor"
    CLIENT = "client"
    PROJECT_MANAGER = "project_manager"
    ADMIN = "admin"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: str
    hashed_password: str
    role: UserRole = Field(default=UserRole.CONTRACTOR)
    organization: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
