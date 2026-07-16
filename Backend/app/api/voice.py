from fastapi import APIRouter, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.websocket.voice import VoicePipeline

router = APIRouter(prefix="/voice", tags=["voice"])


@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    from app.core.security import decode_token
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    async with async_session() as db:
        try:
            pipeline = VoicePipeline(websocket, db, user_id)
            await pipeline.handle()
            await db.commit()
        except Exception:
            await db.rollback()
