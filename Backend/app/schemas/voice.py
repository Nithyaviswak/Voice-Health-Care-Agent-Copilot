from pydantic import BaseModel
from datetime import datetime


class VoiceMessage(BaseModel):
    audio_base64: str = ""
    text: str = ""
    conversation_id: str | None = None


class VoiceResponse(BaseModel):
    transcript: str = ""
    response_text: str = ""
    audio_base64: str = ""
    state: str = "idle"
    is_streaming: bool = False


class TranscriptChunk(BaseModel):
    text: str
    is_final: bool = False


class LLMChunk(BaseModel):
    text: str
    done: bool = False
    safety_flag: bool = False
