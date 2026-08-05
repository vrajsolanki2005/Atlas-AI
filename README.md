
<div align="center">

# Atlas AI

### Your Personal Intelligence Layer for Telegram

*Cut through information overload with AI-powered financial intelligence, personalized briefings, and smart productivity — all inside Telegram.*

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![Telegraf](https://img.shields.io/badge/Telegraf-v4-2CA5E0?logo=telegram)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![Swagger](https://img.shields.io/badge/Swagger-docs-85EA2D?logo=swagger)

</div>

---

# 🌍 The Problem

Every day users receive hundreds of notifications, articles, emails, and market updates.

Most of them are **noise**.

Atlas transforms that chaos into:

- 📌 What actually happened
- 💡 Why it matters
- 🎯 What deserves your attention

Instead of becoming another chatbot, Atlas acts as an **AI Intelligence Companion**.

---

# ✨ Core Capabilities

### 🧠 Intelligent Conversations

Natural conversations instead of command-based interactions.

```text
You:
What happened today?

Atlas:
Markets moved higher after strong AI earnings.

Why it matters:
Investor confidence in AI infrastructure remains strong,
especially for companies like Nvidia.
```

---

### 📈 Financial Intelligence

Rather than forwarding headlines, Atlas:

- Filters duplicate news
- Detects and ranks important events by impact score
- Explains why updates matter
- Personalizes responses based on your watchlist and profile

---

### 🌅 Daily Briefings

Receive concise AI-generated briefings including:

- Market Summary
- Companies You Follow
- What Changed Since Yesterday
- Why It Matters
- One Thing To Watch Today

Delivered automatically at 08:00 (morning) and 18:00 (evening) based on your preference.

---

### ⭐ Personalized Watchlists

Track companies you care about — Nvidia, Tesla, Apple, Microsoft, and more.

Atlas automatically prioritizes news and briefings based on your watchlist.
Mentions companies in chat? Atlas will suggest adding them automatically.

---

### 💬 Conversation Memory

Atlas remembers across sessions:

- Profession and interests
- Companies followed
- Preferred briefing schedule
- Previous conversations (per intent — onboarding vs chat)

Every interaction becomes more personalized over time.

---

### 📅 Smart Agenda + Google Calendar

Manage your daily schedule directly inside Telegram.

- View today's agenda
- Add events — synced to Google Calendar when connected
- AI meeting preparation based on event title
- AI daily calendar summary with insights
- Timezone-aware event fetching
- Token auto-refresh — stays connected without re-auth

---

# 🏗 Architecture

```text
                  Telegram
                      │
                      ▼
             Telegraf Bot Layer
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 AI Conversation   Finance Engine   Agenda Engine
      │               │                │
      └───────────────┼────────────────┘
                      ▼
             Personalization Layer
                      │
                      ▼
                 Groq / Llama 3.3
                      │
                      ▼
                 MySQL Database
```

---

# ⚙ Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Backend | Express.js 5 |
| Telegram | Telegraf v4 |
| Database | MySQL 8 + Sequelize |
| AI | Groq (Llama 3.3-70b) + OpenAI |
| Scheduling | node-cron |
| External APIs | GNews, Google Calendar v3 |
| Auth | Google OAuth2 |
| Security | Helmet, AES-256-CBC token encryption, rate limiting |
| Logging | Winston |
| API Docs | Swagger (OpenAPI 3.0) |
| Containerization | Docker + Docker Compose |

---

# 🚀 Key Features

| Feature | Status |
|---|:---:|
| AI Onboarding | ✅ |
| Personalized User Profiles | ✅ |
| Conversation Memory (per intent) | ✅ |
| Finance Intelligence | ✅ |
| News Deduplication & Ranking | ✅ |
| AI Chat with Intent Routing | ✅ |
| Watchlist + Auto-suggest | ✅ |
| Morning Brief (cron 08:00) | ✅ |
| Evening Summary (cron 18:00) | ✅ |
| Agenda Management | ✅ |
| Google Calendar OAuth2 | ✅ |
| Create Events → Google Calendar | ✅ |
| Timezone-aware Calendar Fetch | ✅ |
| Token Auto-refresh | ✅ |
| AI Meeting Prep | ✅ |
| AI Calendar Day Summary | ✅ |
| Settings (briefing, notifications, industries) | ✅ |
| Winston Logging | ✅ |
| Swagger API Docs | ✅ |
| Docker + Docker Compose | ✅ |

---

# 📂 Project Structure

```text
atlas/
├── src/
│   ├── bot/
│   │   ├── bot.js              # Telegraf setup and session
│   │   └── handlers.js         # All bot actions and text handlers
│   ├── config/
│   │   ├── db.js               # Sequelize connection
│   │   ├── groq.js             # Groq client
│   │   ├── openai.js           # OpenAI client
│   │   └── index.js            # Env config exports
│   ├── cron/
│   │   ├── morningBrief.job.js # Daily 08:00 briefing
│   │   └── eveningBrief.job.js # Daily 18:00 briefing
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── botRateLimit.js
│   │   ├── loggerMiddleware.js # Winston HTTP logger
│   │   └── rateLimit.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Preference.js
│   │   ├── Conversation.js
│   │   ├── Agenda.js
│   │   ├── Watchlist.js
│   │   ├── CalendarIntegration.js
│   │   ├── BriefingLog.js
│   │   └── index.js
│   ├── prompts/
│   │   ├── chatPrompt.js
│   │   └── onboardingPrompt.js
│   ├── routes/
│   │   ├── authRoute.js        # Google OAuth2 callback
│   │   ├── healthRoute.js
│   │   └── swaggerRoute.js     # /api-docs
│   ├── services/
│   │   ├── agenda/
│   │   │   ├── agendaService.js
│   │   │   └── agendaPrompt.js
│   │   ├── briefing/
│   │   │   └── briefingService.js
│   │   ├── cache/
│   │   │   └── newsCache.js
│   │   ├── calendar/
│   │   │   └── calendarService.js
│   │   ├── finance/
│   │   │   ├── financeService.js
│   │   │   ├── intelligenceService.js
│   │   │   └── newsService.js
│   │   ├── router/
│   │   │   └── aiRouter.js
│   │   ├── watchlist/
│   │   │   └── watchlistService.js
│   │   ├── aiService.js
│   │   ├── ConversationService.js
│   │   ├── memoryService.js
│   │   ├── preferenceService.js
│   │   └── userServices.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   ├── encrypt.js          # AES-256-CBC
│   │   ├── errorHandler.js
│   │   ├── logger.js           # Winston logger
│   │   ├── menu.js
│   │   └── profileMerge.js
│   └── app.js
├── logs/
│   ├── atlas.log
│   └── error.log
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
├── package.json
└── server.js
```

---

# 🐳 Docker

### Run with Docker Compose (recommended)

```bash
docker-compose up --build
```

This starts:
- `api` — Atlas on port 5000
- `mysql` — MySQL 8 with a persistent named volume

The API waits for MySQL to pass its healthcheck before starting.

### Run manually

```bash
docker build -t atlas-ai .
docker run -p 5000:5000 --env-file .env atlas-ai
```

---

# ⚡ Local Installation

```bash
git clone <repository-url>
cd atlas
npm install
```

---

# 🔐 Environment Variables

```env
PORT=5000

BOT_TOKEN=<telegram_bot_token>

OPENAI_API_KEY=<openai_api_key>
GROQ_API_KEY=<groq_api_key>
GNEWS_API_KEY=<gnews_api_key>

DB_HOST=localhost
DB_PORT=3306
DB_NAME=atlas_ai
DB_USER=<db_user>
DB_PASSWORD=<db_password>

GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

ENCRYPTION_SECRET=<strong_random_secret>
BASE_URL=http://localhost:5000
```

> When running via Docker Compose, `DB_HOST` is automatically overridden to `mysql` by the compose file.

---

# 🔑 Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable the **Google Calendar API**
3. Create **OAuth2 credentials** (Web application type)
4. Add your `GOOGLE_REDIRECT_URI` to the authorized redirect URIs
5. Copy client ID and secret into `.env`

---

# ▶ Running Atlas

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 📖 API Documentation

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

Documented endpoints:

| Endpoint | Description |
|---|---|
| `GET /health` | Server health check |
| `GET /auth/google` | Initiate Google OAuth2 |
| `GET /auth/google/callback` | OAuth2 callback |
| `GET /users/:telegramId` | Get user by Telegram ID |
| `GET /preferences/:userId` | Get user preferences |
| `PATCH /preferences/:userId` | Update user preferences |
| `GET /conversation/:userId` | Get conversation history |
| `DELETE /conversation/:userId` | Clear conversation history |
| `GET /watchlist/:userId` | Get watchlist |
| `POST /watchlist/:userId` | Add company to watchlist |
| `DELETE /watchlist/:userId` | Remove company from watchlist |

---

# 📋 Logging

Atlas uses **Winston** for structured logging.

| File | Contents |
|---|---|
| `logs/atlas.log` | All logs (info + error) |
| `logs/error.log` | Errors only |

Logs are also printed to stdout in development.

---

# 🤖 Telegram Commands

| Command | Description |
|---|---|
| `/start` | Start Atlas and begin onboarding |
| `/help` | Show available actions |
| `/reset` | Clear conversation and profile history |
| `/agenda` | View today's schedule |
| `/connect_calendar` | Connect Google Calendar |

---

# 🔄 How Atlas Thinks

```text
User Message
      │
      ▼
Intent Detection (finance / comparison / live / chat)
      │
      ▼
Memory Retrieval (last 8 messages)
      │
      ▼
Live Data Collection (GNews / Google Calendar)
      │
      ▼
AI Reasoning (Groq Llama 3.3-70b)
      │
      ▼
Personalized Response
```

---

# 🎯 Design Principles

- Save users time
- Surface only meaningful information
- Explain why updates matter
- Learn continuously through conversation
- Never overwhelm — concise, actionable, Telegram-native

---

# 📄 License

ISC License

---

<div align="center">

### Built with ❤️ to make AI genuinely useful.

</div>
