# Voxa —Voice-Enabled AI Assistant

> An interactive AI assistant with **real-time voice conversation**, **photo understanding**, and a **local-first model strategy**: it runs models on your own machine through Ollama and falls back to cloud providers (Anthropic, OpenAI, Google Gemini, xAI Grok, Meta Llama) only when needed.

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![LiveKit](https://img.shields.io/badge/Voice-LiveKit-black)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Prerequisites](#prerequisites)
7. [Quick Start](#quick-start)
8. [Running with Docker](#running-with-docker)
9. [Voice Mode (LiveKit)](#voice-mode-livekit)
10. [Photo Context](#photo-context)
11. [How Model Selection Works](#how-model-selection-works)
12. [Configuration Reference](#configuration-reference)
13. [Quality Checks](#quality-checks)
14. [Production Checklist](#production-checklist)
15. [Security and Privacy Notes](#security-and-privacy-notes)
16. [Troubleshooting](#troubleshooting)
17. [Roadmap](#roadmap)
18. [Contributing](#contributing)


---

## Overview

**Copilot** is a full-stack AI chat application built around three ideas:

- **Talk to it.** A voice mode gives you a hands-free, real-time conversation with live speech-to-text, turn detection, text-to-speech, and noise cancellation.
- **Show it things.** Attach photos so the assistant can summarize, extract information, and answer questions about what you provide.
- **Keep it local when you can.** The app prefers models running on your own machine via [Ollama](https://ollama.com), so your data stays with you. If no local model is available, or one fails mid-request, it automatically falls back to a cloud provider.

Voice conversations and typed conversations share the same chat history, so you can start by speaking and continue by typing (or vice versa).

---

## Features

### Conversation
- Streaming chat responses from local or cloud models.
- Chat history stored in the browser, with spoken transcripts saved into the same thread (tagged *Spoken*).
- Model picker with **Auto**, **Local (Ollama)**, and **Cloud (fallback)** groups.

### Voice mode
- Real-time speech-to-text, turn detection, text-to-speech, and noise cancellation via **LiveKit Inference**.
- Interrupt the assistant by simply talking over it, or press **Stop** / **Esc**.
- Voice replies use the *same model* you selected for text chat, with the same fallback behavior.
- Configurable voice, language, greeting, and instructions.

### Photos
- Add images with the **+** button, paste, or drag-and-drop (up to 5 per message; JPEG, PNG, WebP, GIF; 10 MB each).
- Images are scaled to 2048 px on the long edge and re-encoded in the browser, which also **strips metadata such as GPS location**.
- Vision-capable models are clearly marked **"Sees images"** in the model menu; Auto selects one whenever a chat contains photos.

### Reliability
- Automatic fallback to the next available model when a model fails before replying (Ollama stopped, model deleted, API key out of quota).
- The reply includes a small note showing which model actually answered.
- Model lists are fetched live from each provider, so new models appear without code changes.

---

## Architecture

```
fullstack-ai-assistant/
├── api/     FastAPI backend (chat, model routing, voice sessions)
├── web/     Next.js frontend (chat UI, voice UI, photo handling)
├── agent/   LiveKit voice agent (STT → turn detection → reply → TTS)
└── docker-compose.yml
```

### Text chat flow

```
Browser ──► Next.js (web, :3000) ──► FastAPI (api, :8000)
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                  Ollama (local, :11434)      Cloud providers (fallback)
                                              Anthropic · OpenAI · Gemini · Grok · Llama
```

### Voice session flow

```
Browser ──POST /api/voice/session──► API: creates room + token that dispatches the agent
   │                                     (remembers chosen model and earlier chat)
   └──WebRTC (mic + speaker)──► LiveKit ◄── Voice agent: STT → turn detection → reply → TTS
                                                │
                                   POST /api/voice/chat   (same model dropdown,
                                   Ollama first, cloud fallback — same as text chat)
```

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Python 3.13, FastAPI, [uv](https://docs.astral.sh/uv/), Ruff, pytest, Ollama SDK, Anthropic and OpenAI SDKs |
| **Frontend** | Next.js 16, React 19, TypeScript 7, Tailwind CSS 4, shadcn/ui |
| **Voice** | LiveKit Cloud + LiveKit Inference (STT, TTS, turn detection, noise cancellation) |
| **Local AI** | Ollama (default local model: `gemma3:1b`) |
| **Cloud AI** | Anthropic, OpenAI, Google Gemini, xAI Grok, Meta Llama |
| **Infra** | Docker and Docker Compose |

---

## Project Structure

| Path | Purpose |
| --- | --- |
| `api/` | FastAPI service: chat endpoints, model discovery and fallback logic, voice session/token endpoints |
| `web/` | Next.js app: chat interface, model dropdown, voice button, photo attachments, IndexedDB storage |
| `agent/` | LiveKit voice agent (`voice_agent.py`) that bridges LiveKit audio to the API's chat endpoint |
| `docker-compose.yml` | Orchestrates `api`, `web`, and optional `agent` and `ollama` services |
| `AGENTS.md` | Conventions and commands for AI coding agents working in this repo |

---

## Prerequisites

- **Python 3.13** with [uv](https://docs.astral.sh/uv/)
- **Node.js 20.9+**
- **[Ollama](https://ollama.com)** (optional but recommended, for local models)
- **A LiveKit Cloud project** (only if you want voice mode): <https://cloud.livekit.io>
- **Cloud API keys** (optional): Anthropic, OpenAI, Gemini, xAI, or Meta, for fallback or cloud-only use

---

## Quick Start

```bash
# 1. Clone
git clone <your-repo-url>
cd fullstack-ai-assistant

# 2. Pull a local model (optional but recommended)
ollama pull gemma3

# 3. Start the API  →  http://localhost:8000/docs
cd api
uv sync
cp .env.example .env            # add cloud API keys here if you have them
uv run fastapi dev

# 4. Start the web app  →  http://localhost:3000   (open a new terminal)
cd web
npm install
cp .env.example .env.local
npm run dev

# 5. Start the Voice Agent (optional, open a new terminal)
cd agent
uv sync
uv run python voice_agent.py
```

Open <http://localhost:3000> and start chatting.

---

## Running with Docker

```bash
cp api/.env.example api/.env
docker compose up --build
```

| Service | Port | Notes |
| --- | --- | --- |
| `web` | 3000 | Next.js frontend |
| `api` | 8000 | FastAPI backend; reaches Ollama on the host via `host.docker.internal:11434` |
| `agent` | — | Voice agent; only starts with the `voice` profile |
| `ollama` | 11434 | Optional Ollama container; only starts with the `ollama` profile |

**Enable voice mode:**

```bash
# fill in agent/.env first
docker compose --profile voice up --build
```

---

## Voice Mode (LiveKit)

Voice mode appears as a **sound-wave button** in the empty message box once the API has LiveKit credentials. It requires a [LiveKit Cloud](https://cloud.livekit.io) project.

### Setup

Add the same three values from your LiveKit project to **both** `api/.env` and `agent/.env`:

```env
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

### Voice settings (`agent/.env`)

| Variable | Description |
| --- | --- |
| `VOICE_STT_MODEL` | Speech-to-text model |
| `VOICE_STT_LANGUAGE` | Spoken language for transcription |
| `VOICE_TTS_MODEL` | Text-to-speech model |
| `VOICE_TTS_VOICE` | Voice used for replies |
| `VOICE_GREETING` | What the assistant says when a session starts |
| `VOICE_INSTRUCTIONS` | System instructions for voice conversations |
| `VOICE_LLM` | `app` (use this app's model routing) or a LiveKit Inference model ID to bypass the app |

---

## Photo Context

Attach context to any message:

- **How:** the **+** button, paste from clipboard, or drag-and-drop onto the page.
- **Limits:** up to 5 images per message, 10 MB each (JPEG, PNG, WebP, GIF).
- **Processing:** scaled to 2048 px and re-encoded in the browser; metadata (including GPS) is removed.
- **Storage:** photos are kept in the browser (IndexedDB) next to chat history.
- **Privacy indicator:** the line under the input says whether photos stay on your computer or which provider receives them.

**Models that can see images:**

```bash
ollama pull gemma3        # or: llava, qwen2.5vl
```

The model menu marks these **"Sees images"**. If you pick a text-only model for a chat with photos, a notice offers a one-click switch.

---

## How Model Selection Works

| Option | Behavior |
| --- | --- |
| **Auto** (default) | Uses the first installed Ollama model; if none, uses the first cloud provider that has an API key |
| **Local · Ollama** | Lists every chat model you have pulled, with size and parameter count |
| **Cloud (fallback)** | One sub-menu per provider whose API key is set, listing its live models |

**Automatic fallback:** if the chosen model fails before replying, the API tries the next option and the reply notes which model answered. Disable with `ALLOW_CLOUD_FALLBACK=false` in `api/.env`.

---

## Configuration Reference

Copy `.env.example` to `.env` (API, agent) atau `.env.local` (web) and adjust.

### `api/.env`

| Variable | Purpose |
| --- | --- |
| `OLLAMA_HOST` | Ollama address (default `http://localhost:11434`) |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc. | Cloud provider keys |
| `CLOUD_PRIORITY` | Order in which cloud providers are tried |
| `ALLOW_CLOUD_FALLBACK` | `true`/`false`: allow automatic fallback |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Enables voice mode |
| `VOICE_AGENT_TOKEN` | Shared secret protecting `/api/voice/chat` |

---

## Quality Checks

```bash
# Backend: lint, format check, tests
cd api && uv run ruff check . && uv run ruff format --check . && uv run pytest

# Frontend: type-check and production build
cd web && npm run typecheck && npm run build
```


## Security and Privacy Notes

- **Local-first by default:** with Ollama running, prompts and images do not leave your machine.
- **Cloud fallback sends data to a provider:** the UI shows which provider receives your photos.
- **Metadata is stripped** from images in the browser before upload.
- **Secrets** belong in environment variables only.

---

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| No local models in the dropdown | Ollama isn't running or no model is pulled. Run `ollama pull gemma3`. |
| Voice button doesn't appear | LiveKit credentials are missing from `api/.env`. |
| "Voice agent not running" | Start it: `cd agent && uv run python voice_agent.py`. |
| Photos rejected | Check format (no HEIC), size (≤ 10 MB), and count (≤ 5). |

---

## Roadmap

- HEIC image support
- User accounts with server-side chat history
- Built-in authentication and rate limiting

---

## Contributing

Contributions are welcome. Please follow the project conventions in [`AGENTS.md`](AGENTS.md):

- Use `uv` for Python dependencies and `npm` for frontend dependencies.
- Use Ruff for Python linting and formatting.
- Run relevant tests after every change.
- Never commit `.env` files.
