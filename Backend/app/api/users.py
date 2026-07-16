from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.health_profile import HealthProfile
from app.models.medical_history import MedicalHistory
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.health import (
    HealthProfileCreate, HealthProfileResponse,
    MedicalHistoryCreate, MedicalHistoryResponse,
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    return user


@router.get("/me/health-profile", response_model=HealthProfileResponse | None)
async def get_health_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(HealthProfile).where(HealthProfile.user_id == user.id))
    return result.scalar_one_or_none()


@router.post("/me/health-profile", response_model=HealthProfileResponse)
async def create_health_profile(
    data: HealthProfileCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = HealthProfile(user_id=user.id, **data.model_dump())
    db.add(profile)
    await db.flush()
    return profile


@router.get("/me/medical-history", response_model=list[MedicalHistoryResponse])
async def get_medical_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MedicalHistory).where(MedicalHistory.user_id == user.id))
    return result.scalars().all()


@router.post("/me/medical-history", response_model=MedicalHistoryResponse)
async def add_medical_history(
    data: MedicalHistoryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = MedicalHistory(user_id=user.id, **data.model_dump())
    db.add(entry)
    await db.flush()
    return entry
