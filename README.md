# LinguaMind AI 🧠

An AI-powered adaptive language learning platform built with React, Firebase, and Groq (Llama 3.1).

## Features

- 🤖 AI Conversation Partner (Groq / Llama 3.1)
- 🎤 Speaking Confidence Analyzer (Web Speech API)
- 📚 Adaptive Learning Modules (Beginner → Advanced)
- 📖 Vocabulary Builder with Dictionary API
- 📅 AI-Generated 7-Day Study Planner
- 📊 Analytics Dashboard with Progress Charts
- 🔐 Firebase Authentication (Email + Google)
- 🌙 Dark / Light Theme

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | Frontend framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Router DOM | Navigation |
| Firebase Auth + Firestore | Auth & Database |
| Groq API (Llama 3.1) | AI features |
| Recharts | Data visualization |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/linguamind-ai.git
cd linguamind-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Get free Groq key at https://console.groq.com
VITE_GROQ_API_KEY=gsk_...
```

### 4. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google
3. Enable **Firestore Database**
4. Set Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{collection}/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── context/        — AuthContext, ThemeContext
├── firebase/       — Firebase config, auth, firestore
├── services/       — Groq AI service, recommendations
├── hooks/          — useSpeech (Web Speech API)
├── components/     — Reusable UI components
│   ├── ui/         — Button, GlassCard, Toast, etc.
│   ├── dashboard/  — Sidebar, TopBar, Layout
│   └── charts/     — Recharts wrappers
└── pages/          — Full page views
    ├── Landing/
    ├── Auth/
    ├── Dashboard/
    ├── Learning/
    ├── Speaking/
    ├── Chatbot/
    ├── Vocabulary/
    ├── Planner/
    └── Profile/
```

## License

MIT
