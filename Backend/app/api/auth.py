from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.deps import get_current_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.clerk_id == data.clerk_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(clerk_id=data.clerk_id, email=data.email, full_name=data.full_name)
    db.add(user)
    await db.flush()
    token = create_access_token({"sub": user.id})
    return {**UserResponse.model_validate(user).model_dump(), "token": token}


@router.post("/login")
async def login(clerk_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = create_access_token({"sub": user.id})
    return {"token": token, "user": UserResponse.model_validate(user)}
