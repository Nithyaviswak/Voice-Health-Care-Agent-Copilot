import logging
from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.llm import llm_service
from app.services.whisper import whisper_service
from app.services.tts import tts_service
from app.services.safety import safety_engine
from app.services.rag import rag_service
from app.models.conversation import Conversation, Message

logger = logging.getLogger(__name__)


class VoicePipeline:
    def __init__(self, websocket: WebSocket, db: AsyncSession, user_id: str):
        self.ws = websocket
        self.db = db
        self.user_id = user_id
        self.conversation_id: str | None = None
        self.messages: list[dict] = []

    async def handle(self):
        await self.ws.accept()
        try:
            while True:
                data = await self.ws.receive_json()
                msg_type = data.get("type", "")

                if msg_type == "audio":
                    await self._handle_audio(data)
                elif msg_type == "text":
                    await self._handle_text(data)
                elif msg_type == "start_conversation":
                    await self._start_conversation(data)
                elif msg_type == "stop":
                    break
        except Exception as e:
            logger.error(f"VoicePipeline error: {e}")
        finally:
            try:
                await self.ws.close()
            except Exception:
                pass

    async def _send(self, msg: dict):
        try:
            await self.ws.send_json(msg)
        except Exception:
            pass

    async def _start_conversation(self, data: dict):
        conversation = Conversation(user_id=self.user_id, title=data.get("title", "Voice Session"))
        self.db.add(conversation)
        await self.db.flush()
        self.conversation_id = conversation.id
        await self._send({"type": "conversation_started", "conversation_id": conversation.id})

    async def _handle_audio(self, data: dict):
        audio_b64 = data.get("audio", "")
        if not audio_b64:
            return

        await self._send({"type": "state", "state": "listening"})

        try:
            transcript = await whisper_service.transcribe_audio(audio_b64)
        except Exception as e:
            logger.error(f"Whisper error: {e}")
            await self._send({"type": "error", "message": "Failed to transcribe audio"})
            return

        await self._send({"type": "transcript", "text": transcript, "is_final": True})

        user_safety = safety_engine.check(transcript)
        if user_safety["is_emergency"]:
            await self._send({
                "type": "emergency",
                "message": user_safety["override_response"],
                "flags": user_safety["flags"],
            })
            return

        await self._generate_response(transcript)

    async def _handle_text(self, data: dict):
        text = data.get("text", "")
        if not text:
            return

        user_safety = safety_engine.check(text)
        if user_safety["is_emergency"]:
            await self._send({
                "type": "emergency",
                "message": user_safety["override_response"],
                "flags": user_safety["flags"],
            })
            return

        await self._generate_response(text)

    async def _generate_response(self, user_input: str):
        await self._send({"type": "state", "state": "thinking"})

        self.messages.append({"role": "user", "content": user_input})
        if self.conversation_id:
            msg = Message(conversation_id=self.conversation_id, role="user", content=user_input)
            self.db.add(msg)

        context_results = rag_service.search(user_input, n_results=3)
        context_text = "\n".join([r["content"] for r in context_results]) if context_results else ""

        system = f"You are HealthOS AI. Previous context: {context_text}" if context_text else None

        await self._send({"type": "state", "state": "speaking"})

        full_response = ""
        try:
            async for chunk in llm_service.stream_chat(self.messages, system=system):
                safety_check = safety_engine.check(chunk)
                if safety_check["is_emergency"]:
                    await self._send({
                        "type": "emergency",
                        "message": safety_check["override_response"],
                    })
                    return

                cleaned = safety_engine.filter_output(chunk)
                full_response += cleaned
                await self._send({"type": "llm_chunk", "text": cleaned, "done": False})
        except Exception as e:
            logger.error(f"LLM stream error: {e}")
            await self._send({"type": "error", "message": "Failed to generate response"})
            return

        self.messages.append({"role": "assistant", "content": full_response})
        if self.conversation_id:
            msg = Message(conversation_id=self.conversation_id, role="assistant", content=full_response)
            self.db.add(msg)

        await self._send({"type": "llm_chunk", "text": "", "done": True})

        try:
            audio_b64 = await tts_service.synthesize(full_response)
            if audio_b64:
                await self._send({"type": "tts_audio", "audio": audio_b64})
            else:
                await self._send({"type": "tts_error", "message": "TTS unavailable"})
        except Exception as e:
            logger.error(f"TTS error: {e}")
            await self._send({"type": "tts_error", "message": "TTS synthesis failed"})

        await self._send({"type": "state", "state": "idle"})
