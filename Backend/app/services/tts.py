import base64
import httpx
from app.config import get_settings

settings = get_settings()


class TTSService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.model = settings.ELEVENLABS_MODEL
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"

    async def synthesize(self, text: str) -> str:
        if not self.api_key:
            return ""
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        headers = {"xi-api-key": self.api_key, "Content-Type": "application/json"}
        payload = {"text": text, "model_id": self.model, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code == 200:
                return base64.b64encode(response.content).decode("utf-8")
        return ""

    async def synthesize_stream(self, text: str):
        if not self.api_key:
            yield b""
            return
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}/stream"
        headers = {"xi-api-key": self.api_key, "Content-Type": "application/json"}
        payload = {"text": text, "model_id": self.model, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=payload, headers=headers, timeout=30) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk


tts_service = TTSService()
