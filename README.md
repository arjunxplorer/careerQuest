# CareerQuest

**The Temple Run for discovering your future career.**

CareerQuest is an AI-powered adventure game that helps students explore careers through immersive gameplay—not personality quizzes. Students run through a Temple Run–inspired Discovery Run, complete challenges across five career worlds, and receive personalized guidance from a Tavus-powered AI mentor who coaches them based on how they actually play.

> Instead of asking students what they think they'll enjoy, CareerQuest watches what genuinely excites them.

---

## The Problem

Students make life-changing career decisions with almost no exposure to what different paths actually feel like. Schools teach subjects, but rarely help students discover direction early—the advantage that separates students who land internships and build portfolios from those who spend years guessing.

## Our Solution

CareerQuest transforms career exploration into an adventure:

1. **Create your explorer profile** — name, grade level, and optional academic context
2. **Meet your AI guide** — a Tavus-powered mentor welcomes you and sets the mission
3. **Run the Discovery Run** — sprint through a runner-style world with five career portals
4. **Complete world challenges** — short, engaging scenarios in Business, Engineering, Technology, Medicine, and Creative fields
5. **Unlock your Career Compass** — AI recommendations based on behavioral signals from gameplay
6. **Dive deeper** — continue in the world that resonates most (Business Kingdom is the polished MVP pathway)

---

## Career Worlds

| World | Focus areas |
|-------|-------------|
| 🏢 **Business Kingdom** | Marketing, entrepreneurship, finance, sales |
| ⚙️ **Engineering City** | Mechanical, civil, electrical, aerospace engineering |
| 💻 **Technology Lab** | Software, AI, cybersecurity, product design |
| 🩺 **Medical Academy** | Medicine, psychology, research, patient care |
| 🎨 **Creative Universe** | Design, animation, film, writing, music |

After the Discovery Run, students unlock a **Career Compass** with ranked world recommendations and suggested career paths—powered by how they played, not what they guessed on a survey.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite, TanStack Start/Router, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express (stateless REST API) |
| **AI Mentor** | [Tavus](https://www.tavus.io/) CVI via Daily JS SDK (`@daily-co/daily-js`) |
| **Behavioral analysis** | Server-side simulation + trait extraction from challenge decisions |

The backend owns all Tavus credentials and returns ready-to-join `conversationUrl`s—no API keys in the frontend.

---

## Project Structure

```
CareerQuest/
├── backend/                 # Express API, challenge logic, Tavus integration
│   ├── routes/              # REST endpoints (business, worlds, run, play, intro)
│   ├── lib/                 # Tavus client, question bank, world fields
│   ├── prompts/             # Mentor conversation seed prompts
│   └── questions/           # Challenge content (JSON)
├── frontend/                # Production React app (TanStack Start + Vite)
│   └── src/
│       ├── routes/          # Main game flow & UI
│       ├── components/      # Mentor video, shared UI
│       └── lib/             # Typed API client
├── challenge.md             # Product vision & game design spec
└── integration.md           # Frontend ↔ backend API contract
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A [Tavus](https://platform.tavus.io/) account with API key and PAL/face ID (for live mentor video)

### 1. Clone and install

```bash
git clone <repository-url>
cd CareerQuest

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

**Backend** — copy the example and add your Tavus credentials:

```bash
cp backend/.env.example backend/.env
```

```env
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_PAL_ID=your_pal_id_here
# or TAVUS_FACE_ID / TAVUS_REPLICA_ID
PORT=3001
```

**Frontend** — point at the backend:

```env
VITE_API_BASE=http://localhost:3001
```

### 3. Run locally

In one terminal:

```bash
cd backend
npm run dev
```

In another:

```bash
cd frontend
npm run dev
```

Open the frontend URL shown in the terminal (Vite assigns a local port automatically). The backend runs at `http://localhost:3001`.

Verify the backend is healthy:

```bash
curl http://localhost:3001/health
# → {"status":"ok"}
```

> **Video note:** Tavus live video requires a secure context. `http://localhost` works for local development; use **HTTPS** in production for camera/microphone access.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/intro/session` | Start intro session with AI guide (Ruby) |
| `GET` | `/:world/challenge` | Load a world challenge (`business`, `engineering`, etc.) |
| `POST` | `/:world/feedback` | Submit answers → simulation, traits, text feedback, Tavus video |
| `GET` | `/play/portal-question/:world` | Grade-level portal question during the Discovery Run |
| `POST` | `/run/complete` | Aggregate per-world scores into recommendations |
| `POST` | `/run/debrief` | Career Compass debrief + mentor video |

See [`integration.md`](integration.md) for full request/response schemas and the Business Kingdom Lemonade Stand MVP flow.

---

## Demo Flow (Hackathon MVP)

The polished demo path follows **Business Kingdom → Lemonade Stand**:

1. Student creates a profile and meets the AI guide
2. They complete the **Discovery Run** across all five worlds
3. The **Career Compass** recommends where to explore next
4. In Business Kingdom, they run a **Lemonade Stand** simulation—pricing, inventory, marketing—and see profit/customer impact
5. **Tavus mentor** (Sam Park) debriefs their decisions with personalized coaching

Example feedback: *"You increased profits by raising prices, but you also lost customers. Great entrepreneurs balance growth with customer satisfaction."*

---

## Why We're Different

| Traditional career platforms | CareerQuest |
|------------------------------|-------------|
| Personality quizzes | Behavioral gameplay |
| "What do you think you'll like?" | "What did you actually enjoy?" |
| Static results | AI mentor that remembers and coaches |
| Isolated assessments | Progressive adventure with badges and depth |

CareerQuest measures signals like curiosity, strategic thinking, persistence, and problem-solving—observed through which challenges students replay, how they solve problems, and where they naturally improve.

---

## Roadmap

- **Phase 1 (built):** Discovery Run + Career Compass + Business Kingdom deep path
- **Phase 2:** Expanded levels per world (Food Truck → Coffee Shop → Startup → Shark Tank)
- **Phase 3:** Portfolio projects, resume builder, internship prep, mock interviews

---

## Team

Built for a hackathon to reimagine how students discover and prepare for careers—starting early, with direction, through play.

---

## License

MIT (or specify your license here)
