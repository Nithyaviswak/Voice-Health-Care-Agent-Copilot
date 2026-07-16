import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.medical import ReportUpload, ReportResponse, SymptomAssessment, AssessmentResult
from app.services.llm import llm_service
from app.services.safety import safety_engine
from app.core.deps import get_current_user

router = APIRouter(prefix="/medical", tags=["medical"])


@router.post("/reports/upload", response_model=ReportResponse)
async def upload_report(
    data: ReportUpload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = Report(user_id=user.id, title=data.title, report_type=data.report_type)
    db.add(report)
    await db.flush()
    return report


@router.get("/reports", response_model=list[ReportResponse])
async def list_reports(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.user_id == user.id).order_by(Report.created_at.desc()))
    return result.scalars().all()


@router.post("/reports/{report_id}/analyze")
async def analyze_report(
    report_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id, Report.user_id == user.id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = await llm_service.analyze_report(report.raw_text or report.title)
    report.ai_summary = analysis.get("summary", "")
    report.anomalies = json.dumps(analysis.get("anomalies", []))
    await db.flush()
    return analysis


@router.post("/symptoms/assess", response_model=AssessmentResult)
async def assess_symptoms(
    data: SymptomAssessment,
    user: User = Depends(get_current_user),
):
    user_safety = safety_engine.check(" ".join(data.symptoms))
    if user_safety["is_emergency"]:
        return AssessmentResult(
            detected_symptoms=data.symptoms,
            possible_conditions=[],
            risk_score=1.0,
            recommendations=["Call 911 immediately"],
            home_care=[],
            doctor_recommended=True,
            emergency_alert=True,
        )

    context = {"severity": data.severity, "duration": data.duration, "notes": data.additional_notes}
    result = await llm_service.symptom_assessment(data.symptoms, context)
    return AssessmentResult(**result)
