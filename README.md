# Dracarys Voice AI Platform

![Dracarys Logo](ui/public/dracarys-logo.svg)

Welcome to the **Dracarys Voice AI Platform**! Dracarys is an advanced, production-ready framework for building, deploying, and orchestrating conversational AI agents. It provides a seamless bridge between modern AI logic and real-world communication channels, fully supporting both traditional telephony (SIP/PSTN) and ultra-low latency WebRTC.

## 🚀 Key Features

- **Omnichannel Voice Agents**: Deploy agents that can be dialed via standard phone numbers (Telephony) or engaged instantly via web browsers (WebRTC).
- **Advanced Builder Workspace**: A modern, interactive drag-and-drop workspace to configure agent behaviors, customize AI models, and define workflow logic without writing code.
- **Enterprise-Grade Infrastructure**: Built to handle high concurrency with PostgreSQL for persistent state, Redis for caching/queues, and MinIO (S3) for secure audio object storage.
- **Pipecat Integration**: Deeply integrates with the Pipecat framework to handle complex real-time media streams, WebSockets, and voice chunking.
- **Live Call Analytics**: Monitor live transcripts in real-time, record calls, and analyze conversational metadata to improve your AI agents.

## 🏗 Architecture & Tech Stack

Dracarys is divided into two primary services:

### 1. The Backend (`/api`)
The brain of the platform, handling business logic, agent orchestration, and database operations.
- **Language**: Python 3.11+
- **Framework**: FastAPI (Asynchronous REST & WebSockets)
- **Database**: PostgreSQL (via SQLAlchemy async)
- **Queues & Caching**: Redis (with ARQ for background tasks)
- **Storage**: MinIO / S3-compatible storage (for call recordings and audio)

### 2. The Frontend (`/ui`)
A stunning, premium user interface designed for agent builders and administrators.
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion for micro-animations
- **State Management**: React Query

## 🛠 Local Development Setup

To run Dracarys locally for development, we use Docker Compose to instantly spin up the required databases and infrastructure.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shivam290204/Dracarys-VoiceAgent.git
   cd Dracarys-VoiceAgent
   ```

2. **Start the Infrastructure (Postgres, Redis, MinIO):**
   ```bash
   docker-compose -f docker-compose-local.yaml up -d
   ```

3. **Run the Backend:**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

4. **Run the Frontend:**
   ```bash
   cd ui
   npm install
   npm run dev
   ```

Once running, you can access the gorgeous Dracarys web interface at `http://localhost:3000`.

## 🤝 Contributing
Contributions are welcome! Please ensure you test your changes locally using the test environments before opening a pull request. 

*Dracarys - Breathe fire into your voice agents.*
