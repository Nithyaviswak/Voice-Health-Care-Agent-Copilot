from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.medication import Medication, MedicationLog
from app.schemas.medical import (
    MedicationCreate, MedicationResponse,
    MedicationLogCreate, MedicationLogResponse,
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/medications", tags=["medications"])


@router.get("/", response_model=list[MedicationResponse])
async def list_medications(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Medication).where(Medication.user_id == user.id, Medication.is_active == True)
    )
    return result.scalars().all()


@router.post("/", response_model=MedicationResponse)
async def add_medication(
    data: MedicationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    med = Medication(user_id=user.id, **data.model_dump())
    db.add(med)
    await db.flush()
    return med


@router.delete("/{medication_id}")
async def deactivate_medication(
    medication_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Medication).where(Medication.id == medication_id, Medication.user_id == user.id)
    )
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.is_active = False
    await db.flush()
    return {"status": "deactivated"}


@router.post("/{medication_id}/log", response_model=MedicationLogResponse)
async def log_medication(
    medication_id: str,
    data: MedicationLogCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = MedicationLog(medication_id=medication_id, user_id=user.id, **data.model_dump())
    db.add(log)
    await db.flush()
    return log


@router.get("/{medication_id}/logs", response_model=list[MedicationLogResponse])
async def get_medication_logs(
    medication_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MedicationLog)
        .where(MedicationLog.medication_id == medication_id, MedicationLog.user_id == user.id)
        .order_by(MedicationLog.taken_at.desc())
    )
    return result.scalars().all()
