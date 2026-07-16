from pydantic import BaseModel


class HealthProfileCreate(BaseModel):
    date_of_birth: str = ""
    gender: str = ""
    height_cm: float | None = None
    weight_kg: float | None = None
    blood_group: str = ""
    allergies: str = ""
    chronic_diseases: str = ""
    emergency_contact_name: str = ""
    emergency_contact_phone: str = ""


class HealthProfileResponse(BaseModel):
    id: str
    user_id: str
    date_of_birth: str
    gender: str
    height_cm: float | None
    weight_kg: float | None
    blood_group: str
    allergies: str
    chronic_diseases: str
    emergency_contact_name: str
    emergency_contact_phone: str

    model_config = {"from_attributes": True}


class MedicalHistoryCreate(BaseModel):
    condition: str
    diagnosis_date: str = ""
    notes: str = ""
    status: str = "active"


class MedicalHistoryResponse(BaseModel):
    id: str
    user_id: str
    condition: str
    diagnosis_date: str
    notes: str
    status: str

    model_config = {"from_attributes": True}
