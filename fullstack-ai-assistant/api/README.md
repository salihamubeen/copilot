## Voice-Enabled AI Assistant

A full-stack, voice-enabled AI assistant with real-time voice conversations, text chat, photo and PDF understanding, and a local-first AI model strategy.

The application uses Ollama for local AI models whenever possible and can fall back to cloud providers such as Anthropic, OpenAI, Google Gemini, xAI Grok, and Meta Llama when required.

Voice conversations are powered by LiveKit, providing real-time speech-to-text, turn detection, text-to-speech, and noise cancellation.

## Features
## 💬 Text Chat
Streaming AI responses
Local Ollama models
Cloud AI fallback
Automatic model selection
Model picker with local and cloud models
Chat history stored in the browser
Voice transcripts are saved in the same conversation
Continue the conversation by typing or speaking
## 🎙️ Voice Assistant
Real-time voice conversations
Speech-to-text (STT)
Text-to-speech (TTS)
Automatic turn detection
Noise cancellation
Interrupt the assistant while it is speaking
Voice and text use the same selected AI model
Automatic fallback when the selected model fails
Configurable voice, language, greeting, and instructions
LiveKit-based WebRTC audio communication
## 🖼️ Photos and Documents
Upload images using the + button
Paste images from the clipboard
Drag and drop images
JPEG, PNG, WebP and GIF support
Vision-capable AI models
PDF/document context
Image understanding and question answering
Image metadata such as GPS information is removed in the browser
🔄 Automatic Model Fallback

## The assistant follows a local-first strategy:

Try the selected model.
If the selected model fails before responding, try a local Ollama model.
If no local model is available, try configured cloud providers.
The response indicates which model actually answered.
If a model fails after streaming has started, the request returns an error instead of switching models.
Architecture
                    ┌─────────────────────┐
                    │      Browser        │
                    │   Next.js / React   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │  FastAPI API   │          │    LiveKit     │
        │    :8000       │          │   WebRTC       │
        └───────┬────────┘          └───────┬────────┘
                │                           │
       ┌────────┴────────┐                  ▼
       │                 │          ┌────────────────┐
       ▼                 ▼          │ Voice Agent    │
   ┌────────┐      ┌────────────┐   │ STT → LLM → TTS│
   │ Ollama │      │ Cloud AI   │   └───────┬────────┘
   │ Local  │      │ Providers  │           │
   └────────┘      └────────────┘           │
                                            ▼
                                      FastAPI Chat API
Text Chat Flow
Browser
   │
   ▼
Next.js
   │
   ▼
FastAPI
   │
   ├──► Ollama (Local)
   │
   └──► Cloud Providers
          ├── Anthropic
          ├── OpenAI
          ├── Gemini
          ├── Grok
          └── Meta Llama
Voice Flow
Browser
   │
   │ Microphone / Speaker
   ▼
LiveKit WebRTC
   │
   ▼
LiveKit Voice Agent
   │
   ├── Speech-to-Text
   │
   ├── Turn Detection
   │
   ├── FastAPI / AI Model
   │       ├── Ollama
   │       └── Cloud Fallback
   │
   └── Text-to-Speech
   │
   ▼
LiveKit
   │
   ▼
Browser Speaker
Tech Stack
Component	Technology
Backend	Python 3.13, FastAPI
Frontend	Next.js 16, React 19
Language	TypeScript 7
Styling	Tailwind CSS 4
Local AI	Ollama
Cloud AI	Anthropic, OpenAI, Gemini, Grok, Meta Llama
Voice	LiveKit
Voice STT	LiveKit Inference
Voice TTS	LiveKit Inference
Turn Detection	LiveKit
Noise Cancellation	LiveKit
Package Manager	uv / npm
Testing	pytest
Linting	Ruff
Deployment	Docker / Docker Compose
Project Structure
Copilot/
│
├── api/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── providers/
│   │   ├── services/
│   │   └── core/
│   │
│   └── .env.example
│
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── .env.example
│
├── agent/
│   ├── voice_agent.py
│   ├── pyproject.toml
│   └── .env.example
│
├── docker-compose.yml
├── AGENTS.md
└── README.md
Prerequisites

Install the following before running the application:

Python 3.13
uv
Node.js 20.9+
npm
Ollama
Docker Desktop (optional)
LiveKit Cloud account for voice mode
API keys for cloud providers if cloud fallback is required

Ollama is optional, but recommended because the application is designed to use local models first.

Quick Start
1. Clone the repository
git clone https://github.com/raeesgul488/Copilot.git

cd Copilot
2. Start Ollama

Install Ollama and pull a local model:

ollama pull llama3.2

For vision capabilities:

ollama pull gemma3

Other vision-capable models can also be used, such as:

ollama pull llava
ollama pull qwen2.5vl
Backend Setup

Open a terminal:

cd api

uv sync

Create the environment file:

cp .env.example .env

Configure your Ollama and optional cloud provider settings.

Start FastAPI:

uv run fastapi dev app/main.py

API documentation:

http://localhost:8000/docs
Frontend Setup

Open another terminal:

cd web

npm install

Create the environment file:

cp .env.example .env.local

Start Next.js:

npm run dev

Open:

http://localhost:3000
Voice Mode

Voice mode uses LiveKit for real-time audio communication.

The voice pipeline is:

Microphone
    ↓
LiveKit
    ↓
Speech-to-Text
    ↓
Turn Detection
    ↓
AI Model
    ↓
Text-to-Speech
    ↓
LiveKit
    ↓
Speaker

The voice agent uses the same model routing and fallback system as normal text chat.

LiveKit Setup

Create a LiveKit Cloud project and obtain:

LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET

Add these values to:

api/.env

and:

agent/.env

Example:

LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
Voice Agent Setup

Open a new terminal:

cd agent

uv sync

Configure:

agent/.env

Then start the voice agent:

uv run python voice_agent.py dev

The API should already be running before starting the voice agent.

Voice Configuration

The following settings can be configured in agent/.env:

Variable	Purpose
LIVEKIT_URL	LiveKit server URL
LIVEKIT_API_KEY	LiveKit API key
LIVEKIT_API_SECRET	LiveKit API secret
VOICE_STT_MODEL	Speech-to-text model
VOICE_STT_LANGUAGE	Spoken language
VOICE_TTS_MODEL	Text-to-speech model
VOICE_TTS_VOICE	Assistant voice
VOICE_GREETING	Initial greeting
VOICE_INSTRUCTIONS	Voice assistant instructions
VOICE_NOISE_CANCELLATION	Enable/disable noise cancellation
VOICE_LLM	AI model routing mode
VOICE_AGENT_TOKEN	Authentication token for API communication
Voice Model Routing

Voice mode follows the same model selected in the text interface.

For example:

User selects Ollama
       ↓
Voice Agent
       ↓
Ollama Model
       ↓
Response
       ↓
TTS
       ↓
User hears response

If the selected model fails before producing a response:

Selected Model
      ↓
     FAIL
      ↓
Local Ollama Model
      ↓
     FAIL
      ↓
Cloud Provider
      ↓
Response

This keeps voice and text conversations consistent.

Voice API Endpoints
Method	Endpoint	Purpose
GET	/api/health	API health check
GET	/api/models	List available AI models
POST	/api/chat	Streaming text chat
POST	/api/voice/session	Create a LiveKit voice session
POST	/api/voice/chat	Process voice-agent chat requests
Example Voice Session

The web application requests a voice session:

Browser
   │
   ▼
POST /api/voice/session
   │
   ▼
FastAPI
   │
   ├── Creates LiveKit room
   ├── Creates access token
   └── Dispatches voice agent
   │
   ▼
Browser connects through WebRTC
   │
   ▼
Voice conversation starts
Photos and Documents

The assistant supports visual context in conversations.

Supported images:

JPEG
PNG
WebP
GIF

Images can be provided through:

Upload button
Clipboard paste
Drag and drop

Recommended local vision models:

ollama pull gemma3

or:

ollama pull llava

or:

ollama pull qwen2.5vl

Vision-capable models are automatically identified and can be selected when images are included in a conversation.

Model Selection

The application provides three main model modes:

Mode	Description
Auto	Selects the best available local/cloud model
Local / Ollama	Uses models installed locally
Cloud	Uses configured cloud providers
Auto Mode

The default behavior is:

Installed Ollama Model
        ↓
If unavailable
        ↓
Configured Cloud Provider
Cloud Providers

Supported providers include:

Anthropic
OpenAI
Google Gemini
xAI Grok
Meta Llama
Fallback Behavior

Automatic fallback can be enabled or disabled.

Enable:

ALLOW_CLOUD_FALLBACK=true

Disable:

ALLOW_CLOUD_FALLBACK=false

When fallback occurs, the application identifies the model that actually generated the response.

This prevents the user from unknowingly receiving a response from a different model.

Environment Configuration
API .env

Important settings include:

OLLAMA_HOST=http://localhost:11434

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
XAI_API_KEY=

CLOUD_PRIORITY=
ALLOW_CLOUD_FALLBACK=true

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

VOICE_AGENT_TOKEN=
VOICE_VOICES=
Agent .env

Configure:

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

VOICE_AGENT_TOKEN=

VOICE_STT_MODEL=
VOICE_STT_LANGUAGE=
VOICE_TTS_MODEL=
VOICE_TTS_VOICE=

VOICE_GREETING=
VOICE_INSTRUCTIONS=

VOICE_NOISE_CANCELLATION=true
VOICE_LLM=app
Docker

The complete application can also be started with Docker Compose.

Create the API environment file:

cp api/.env.example api/.env

Build and start:

docker compose up --build

Services:

Service	Port	Purpose
web	3000	Next.js frontend
api	8000	FastAPI backend
agent	—	LiveKit voice agent
ollama	11434	Optional Ollama service
Start Voice Agent with Docker
docker compose --profile voice up --build
Run Ollama in Docker
docker compose --profile ollama up

Then configure:

OLLAMA_HOST=http://ollama:11434
Quality Checks
Backend
cd api

uv run ruff check .
uv run ruff format --check .
uv run pytest
Frontend
cd web

npm run typecheck
npm run build
Agent
cd agent

uv run ruff check .
uv run ruff format --check .
Troubleshooting
Problem	Solution
Ollama models do not appear	Make sure Ollama is running and pull a model with ollama pull llama3.2
Voice button does not appear	Check LiveKit credentials in api/.env
Voice mode cannot start	Make sure the LiveKit voice agent is running
Voice agent is not running	Run cd agent && uv run python voice_agent.py dev
Voice agent cannot reach API	Check VOICE_AGENT_TOKEN in both API and agent environments
Selected model fails	Check Ollama status and cloud API keys
Photos are rejected	Check image format, size, and number of images
Docker API cannot connect to Ollama	Check OLLAMA_HOST and Docker networking
Voice connection times out	Check LiveKit URL, API key, secret, and agent connection
No speech response	Check STT/TTS LiveKit configuration
Replies do not stream	Disable proxy buffering for streaming API responses
Security and Privacy

The application follows a local-first architecture.

When Ollama is available:

User
 ↓
Local Application
 ↓
Ollama
 ↓
Response

The prompt and images can remain on the local machine.

If cloud fallback is enabled:

User
 ↓
Application
 ↓
Cloud Provider
 ↓
Response

Data may then be sent to the configured cloud provider.

For a fully local setup:

ALLOW_CLOUD_FALLBACK=false

Never commit:

.env
.env.local
API keys
LiveKit secrets
Cloud credentials

Voice endpoints should also be protected before deploying the application publicly because voice sessions can incur usage charges.