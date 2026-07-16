import base64
import tempfile
import os
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()


class WhisperService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.WHISPER_API_KEY or settings.OPENAI_API_KEY)
        self.model = settings.WHISPER_MODEL

    async def transcribe_audio(self, audio_base64: str, format: str = "wav") -> str:
        audio_bytes = base64.b64decode(audio_base64)
        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            with open(tmp_path, "rb") as audio_file:
                response = await self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="en",
                )
            return response.text
        finally:
            os.unlink(tmp_path)

    async def transcribe_stream(self, audio_chunk: bytes) -> str:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_chunk)
            tmp_path = tmp.name
        try:
            with open(tmp_path, "rb") as audio_file:
                response = await self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="en",
                )
            return response.text
        finally:
            os.unlink(tmp_path)


whisper_service = WhisperService()
