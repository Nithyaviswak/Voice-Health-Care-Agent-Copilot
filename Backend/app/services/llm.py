import json
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are HealthOS AI, a calm, intelligent medical assistant. You help users understand symptoms, medications, and health reports. You are NOT a doctor — you provide informational guidance and always recommend consulting a healthcare professional for medical decisions.

Rules:
- Be concise and clear
- Use plain language, not medical jargon
- Always include disclaimers when giving health advice
- If symptoms suggest emergency, immediately advise calling emergency services
- Structure responses with clear sections when appropriate
- Never prescribe medication or dosages
- Track conversation context and patient history"""


class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.DEFAULT_LLM_MODEL

    async def chat(self, messages: list[dict], system: str | None = None) -> str:
        full_messages = [{"role": "system", "content": system or SYSTEM_PROMPT}] + messages
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""

    async def stream_chat(self, messages: list[dict], system: str | None = None):
        full_messages = [{"role": "system", "content": system or SYSTEM_PROMPT}] + messages
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    async def symptom_assessment(self, symptoms: list[str], context: dict | None = None) -> dict:
        prompt = f"""Analyze these symptoms and provide a structured assessment:
Symptoms: {', '.join(symptoms)}
Context: {json.dumps(context or {})}

Respond in this exact JSON format:
{{
    "detected_symptoms": ["list of symptoms"],
    "possible_conditions": [{{"name": "...", "probability": "low|medium|high", "description": "..."}}],
    "risk_score": 0.0-1.0,
    "recommendations": ["recommendation 1", "recommendation 2"],
    "home_care": ["care tip 1"],
    "doctor_recommended": true/false,
    "emergency_alert": true/false
}}"""
        response = await self.chat([{"role": "user", "content": prompt}])
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "detected_symptoms": symptoms,
                "possible_conditions": [],
                "risk_score": 0.3,
                "recommendations": ["Please consult a healthcare professional"],
                "home_care": ["Rest and stay hydrated"],
                "doctor_recommended": True,
                "emergency_alert": False,
            }

    async def analyze_report(self, report_text: str) -> dict:
        prompt = f"""Analyze this medical report and provide a structured summary:

Report content:
{report_text}

Respond in JSON format:
{{
    "summary": "plain language summary",
    "key_findings": ["finding 1", "finding 2"],
    "anomalies": [{{"title": "...", "description": "...", "severity": "low|medium|high"}}],
    "recommendations": ["recommendation 1"]
}}"""
        response = await self.chat([{"role": "user", "content": prompt}])
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"summary": report_text[:500], "key_findings": [], "anomalies": [], "recommendations": []}


llm_service = LLMService()
