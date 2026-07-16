# Healthcare AI OS

A real-time voice-powered healthcare assistant with AI symptom assessment, medical report analysis, and medication management.

## Tech Stack

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, GSAP

**Backend** — FastAPI (Python 3.12), PostgreSQL + pgvector, Redis, ChromaDB

**AI** — OpenAI (GPT-4o, Whisper), ElevenLabs TTS, RAG pipeline

## Project Structure

```
├── frontend/          Next.js app (App Router)
│   └── src/
│       ├── app/       Pages and layouts
│       ├── components/ UI, AI visualization, variants
│       ├── hooks/     Voice OS, auth, emergency
│       └── lib/       Utilities, GSAP config
├── Backend/           FastAPI server
│   └── app/
│       ├── api/       Route handlers
│       ├── models/    SQLAlchemy models
│       ├── schemas/   Pydantic schemas
│       ├── services/  LLM, Whisper, TTS, RAG, Safety
│       ├── core/      Auth, deps, exceptions
│       └── websocket/ Voice pipeline
└── docker-compose.yml PostgreSQL, Redis, ChromaDB
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
cd Backend
docker compose up -d
```

### 2. Backend

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # fill in your API keys
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create manually
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL | `ws://localhost:8000` |

### Backend (`Backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key (GPT + Whisper) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS key |
| `JWT_SECRET` | JWT signing secret |
| `CHROMA_HOST` / `CHROMA_PORT` | ChromaDB host and port |

See `Backend/.env.example` for the full list.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register user |
| `POST` | `/api/v1/auth/login` | Login, get JWT |
| `GET` | `/api/v1/users/me` | Get current user |
| `PATCH` | `/api/v1/users/me` | Update profile |
| `GET` | `/api/v1/users/me/health-profile` | Get health profile |
| `POST` | `/api/v1/users/me/health-profile` | Create health profile |
| `WS` | `/api/v1/voice/ws?token=` | Voice WebSocket |
| `GET` | `/api/v1/conversations/` | List conversations |
| `POST` | `/api/v1/conversations/` | Create conversation |
| `POST` | `/api/v1/medical/symptoms/assess` | Symptom assessment |
| `POST` | `/api/v1/medical/reports/upload` | Upload report |
| `GET` | `/api/v1/medications/` | List medications |
| `POST` | `/api/v1/medications/` | Add medication |

## Voice Pipeline

```
Microphone → WebSocket → FastAPI → Whisper STT → Safety Check
    → LLM (streaming) → Safety Filter → TTS → Speaker
```

The voice hook (`use-voice-os.ts`) handles:
- Real-time mic capture via `getUserMedia`
- WebSocket connection with auto-reconnect
- Streaming transcript and response display
- TTS audio playback
- Emergency detection and overlay trigger

## Design System

Dark healthcare theme with glass morphism. Three UI variants:

- **Command Center** — Dashboard with timeline, vitals, medications
- **Conversational** — Split-panel chat with AI orb
- **Health Hub** — Bento grid with magnetic widgets

Colors: `accent #4FD1C5`, `secondary #7AA6FF`, `canvas #07111A`

## License

MIT
