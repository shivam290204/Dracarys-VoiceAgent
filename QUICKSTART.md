# 🐉 Dracarys — Quick Start Guide

Get the full voice AI platform running locally in minutes.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 20+ (see `.nvmrc`) |
| Docker Desktop | Latest |
| PowerShell | 7+ (Windows) |

---

## Step 1 — Start Infrastructure (Docker)

```powershell
docker compose -f docker-compose-local.yaml up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **MinIO** on ports `9000` / `9001`

---

## Step 2 — Set Up the Backend

```powershell
# Create a virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r api/requirements.txt
pip install -r api/requirements.dev.txt

# Set up environment file
Copy-Item api/.env.example api/.env
# Edit api/.env with your values if needed
```

---

## Step 3 — Run Database Migrations

```powershell
.\scripts\migrate.ps1
```

---

## Step 4 — Start Backend Services

```powershell
.\scripts\start_services_dev.ps1
```

This starts:
- **uvicorn** API server on `http://localhost:8000` (with auto-reload)
- **arq** background worker

View logs:
```powershell
Get-Content logs/latest/uvicorn.log -Wait
```

---

## Step 5 — Start the Frontend

```powershell
cd ui
npm install     # Only needed the first time
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Step 6 — Create Your Account

1. Open http://localhost:3000
2. You'll be redirected to sign up
3. Create a local account (no external auth needed in OSS mode)
4. You're in! 🎉

---

## Available Pages

| URL | Feature |
|-----|---------|
| `/overview` | Dashboard overview |
| `/live-chat` | 🆕 Voice-to-Voice live chat (WebRTC) |
| `/chat` | 🆕 AI text chat with agents |
| `/workflow` | Voice agent builder |
| `/model-configurations` | LLM/STT/TTS model setup |
| `/telephony-configurations` | Twilio / Vonage telephony |
| `/recordings` | Call recordings |
| `/analytics` | 🆕 Call analytics dashboard |
| `/prompts` | 🆕 Prompt library |
| `/settings` | Platform settings |

---

## Stopping Services

```powershell
# Stop backend services
.\scripts\stop_services.ps1

# Stop Docker
docker compose -f docker-compose-local.yaml down
```

---

## Environment Variables

| File | Purpose |
|------|---------|
| `api/.env` | Backend config (DB, Redis, MinIO, AI providers) |
| `ui/.env` | Frontend config (backend URL, analytics toggles) |

---

## AI Provider Setup

Go to **Settings → Models → Add Configuration** in the UI to add:
- OpenAI (GPT-4o, Whisper)
- Anthropic (Claude)
- ElevenLabs (TTS)
- Deepgram (STT)
- Any OpenAI-compatible endpoint

---

## Telephony Setup

Go to **Telephony** to configure:
- **Twilio** (inbound/outbound calling)
- **Vonage** (inbound/outbound calling)
- Local TURN server (included via COTURN for WebRTC)

---

## Need Help?

- [GitHub Issues](https://github.com/dograh-hq/dograh/issues)
- [Contributing Guide](./CONTRIBUTING.md)
