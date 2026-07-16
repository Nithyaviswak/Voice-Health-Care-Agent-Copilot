from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    clerk_id: str
    email: str
    full_name: str = ""


class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    full_name: str
    phone: str
    avatar_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
