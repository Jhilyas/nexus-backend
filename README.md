# NEXUS — Where Every Future Begins 🌌

> The Ultimate AI-Powered Educational Orientation Platform for Morocco

![NEXUS Platform](https://img.shields.io/badge/Version-1.0.0-667eea?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)

---

## 🚀 Overview

NEXUS is a revolutionary platform that combines artificial intelligence with comprehensive educational data to help Moroccan students navigate their post-baccalaureate journey. The platform features an intelligent orientation engine, an AI mentor named SAGE, timeline simulations, and a premium glassmorphism UI.

---

## ✨ Features

### Core Features
- 🔮 **AI Oracle** — Intelligent orientation quiz that analyzes your profile
- 🧠 **SAGE Mentor** — 24/7 AI companion powered by GPT-4
- ⏱️ **Timeline Simulator** — Visualize your future career trajectory
- 📊 **Command Center** — Personal dashboard with progress tracking
- 🎓 **Schools Explorer** — Browse and compare 100+ schools
- 💎 **Premium Tiers** — Free, Pro, Elite, and God Mode

### Technical Features
- 🌍 Multi-language support (French, Arabic, English)
- 🌙 Premium dark theme with glassmorphism
- 📱 Fully responsive design
- ⚡ Real-time AI responses
- 🔐 JWT authentication

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Vanilla CSS with Custom Properties
- Canvas API for particle effects
- Custom hooks and services

### Backend
- Node.js + Express
- OpenAI GPT-4 API
- JWT Authentication
- In-memory database (PostgreSQL-ready)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (optional, for AI features)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus.git
cd nexus

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 — Frontend:**
```bash
npm run dev
# Opens at http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
# Runs at http://localhost:3001
```

### Production Build

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

---

## 📁 Project Structure

```
nexus/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                 # Design system
│   ├── services/
│   │   └── api.js               # API client
│   └── components/
│       ├── layout/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       ├── effects/
│       │   └── CosmicBackground.jsx
│       ├── hero/
│       │   └── HeroSection.jsx
│       ├── features/
│       │   └── FeaturesSection.jsx
│       ├── ai/
│       │   ├── OrientationEngine.jsx
│       │   └── AIMentor.jsx
│       ├── dashboard/
│       │   ├── Dashboard.jsx
│       │   └── TimelineSimulator.jsx
│       ├── explore/
│       │   └── SchoolsExplorer.jsx
│       ├── pricing/
│       │   └── PricingSection.jsx
│       └── auth/
│           └── AuthModal.jsx
└── backend/
    ├── package.json
    ├── server.js
    └── .env
```

---

## 🎨 Design System

### Color Palette
- `--nexus-void`: #050508 (Deep space)
- `--nexus-aurora-1`: #667eea (Primary)
- `--nexus-aurora-2`: #764ba2 (Secondary)
- `--nexus-aurora-5`: #00f2fe (Accent)

### Typography
- Display: Outfit
- Body: Inter
- Arabic: Cairo
- Mono: JetBrains Mono

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/sage/chat` | Chat with AI mentor |
| POST | `/api/orientation/analyze` | Analyze orientation answers |
| GET | `/api/schools` | List all schools |
| GET | `/api/careers` | List all careers |
| POST | `/api/timeline/simulate` | Simulate career timeline |
| GET | `/api/health` | Health check |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Built with ❤️ for Moroccan students

---

<p align="center">
  <strong>NEXUS — Là où chaque avenir commence</strong>
</p>
