from pydantic import BaseModel
from datetime import datetime


class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    time_of_day: str = ""
    start_date: str
    end_date: str = ""
    notes: str = ""


class MedicationResponse(BaseModel):
    id: str
    user_id: str
    name: str
    dosage: str
    frequency: str
    time_of_day: str
    start_date: str
    end_date: str
    notes: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MedicationLogCreate(BaseModel):
    medication_id: str
    dosage_taken: str
    missed: bool = False
    notes: str = ""


class MedicationLogResponse(BaseModel):
    id: str
    medication_id: str
    user_id: str
    taken_at: datetime
    dosage_taken: str
    missed: bool
    notes: str

    model_config = {"from_attributes": True}


class ReportUpload(BaseModel):
    title: str
    report_type: str


class ReportResponse(BaseModel):
    id: str
    user_id: str
    title: str
    report_type: str
    file_url: str
    ai_summary: str
    anomalies: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SymptomAssessment(BaseModel):
    symptoms: list[str]
    severity: str = "moderate"
    duration: str = ""
    additional_notes: str = ""


class AssessmentResult(BaseModel):
    detected_symptoms: list[str]
    possible_conditions: list[dict]
    risk_score: float
    recommendations: list[str]
    home_care: list[str]
    doctor_recommended: bool
    emergency_alert: bool
