<div align="center">

# 🧭 Atlas AI

### Your Personal Intelligence Layer for Telegram

*Cut through information overload with AI-powered financial intelligence, personalized briefings, and smart productivity — all inside Telegram.*

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![Telegraf](https://img.shields.io/badge/Telegraf-v4-2CA5E0?logo=telegram)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?logo=openai)

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
- Detects important events
- Explains impact
- Personalizes responses

---

### 🌅 Daily Briefings

Receive concise AI-generated briefings including:

- Market Summary
- Companies You Follow
- Economic Highlights
- Things To Watch Today

---

### ⭐ Personalized Watchlists

Track companies you care about.

Examples:

- Nvidia
- Tesla
- Apple
- Microsoft

Atlas automatically prioritizes updates based on your watchlist.

---

### 💬 Long-Term Memory

Atlas gradually learns:

- Profession
- Interests
- Companies followed
- Preferred briefing schedule
- Previous conversations

Every interaction becomes more personalized.

---

### 📅 Smart Agenda

Manage your daily schedule directly inside Telegram.

- Today's agenda
- Meeting preparation
- Event summaries
- Google Calendar synchronization

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
               OpenAI / Groq AI
                      │
                      ▼
                 MySQL Database
```

---

# ⚙ Technology Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Backend | Express.js |
| Telegram | Telegraf |
| Database | MySQL + Sequelize |
| AI | OpenAI + Groq |
| Scheduling | node-cron |
| External APIs | GNews, Google Calendar |
| Security | Helmet, AES Encryption |

---

# 🚀 Key Features

| Feature | Status |
|----------|:------:|
| AI Onboarding | ✅ |
| Personalized User Profiles | ✅ |
| Conversation Memory | ✅ |
| Finance Intelligence | ✅ |
| AI Chat | ✅ |
| Watchlist | ✅ |
| Morning Brief | ✅ |
| Evening Summary | ✅ |
| Agenda Management | ✅ |
| Google Calendar | ✅ |
| Settings | ✅ |

---

# 📂 Project Structure

```text
src
│
├── bot
│   ├── bot.js
│   └── handlers.js
│
├── config
│
├── controllers
│
├── cron
│   ├── morningBrief.job.js
│   └── eveningBrief.job.js
│
├── middleware
│
├── models
│
├── routes
│
├── services
│   ├── agenda
│   ├── ai
│   ├── briefing
│   ├── calendar
│   ├── finance
│   ├── memory
│   ├── onboarding
│   └── watchlist
│
├── utils
│
└── app.js
```

---

# ⚡ Installation

```bash
git clone <repository-url>

cd atlas-ai

npm install
```

---

# 🔐 Environment Variables

```env
PORT=

BOT_TOKEN=

OPENAI_API_KEY=

GROQ_API_KEY=

GNEWS_API_KEY=

DB_HOST=

DB_PORT=

DB_NAME=

DB_USER=

DB_PASSWORD=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GOOGLE_REDIRECT_URI=

BASE_URL=
```

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

# 🤖 Telegram Commands

| Command | Description |
|----------|-------------|
| `/start` | Start Atlas |
| `/help` | Available commands |
| `/reset` | Reset conversation memory |
| `/agenda` | View today's schedule |
| `/connect_calendar` | Connect Google Calendar |

---

# 🔄 How Atlas Thinks

```text
User Message
      │
      ▼
Intent Detection
      │
      ▼
Memory Retrieval
      │
      ▼
Live Data Collection
      │
      ▼
AI Reasoning
      │
      ▼
Personalized Response
```

---

# 🎯 Design Principles

Atlas is built around four simple ideas:

- Save users time
- Surface only meaningful information
- Explain why updates matter
- Learn continuously through conversation

---

# 🔮 Roadmap

- Semantic Search
- Multi-Vertical Intelligence
- AI Recommendation Engine
- Slack Integration
- Email Intelligence
- Voice Conversations

---

# 📄 License

ISC License

---

<div align="center">

### Built with ❤️ to make AI genuinely useful.

</div>