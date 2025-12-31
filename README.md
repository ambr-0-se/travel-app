## 🧳 Dubai–Oman Family Explorer

A comprehensive travel companion application that combines intelligent itinerary planning, contextual AI assistance, and practical travel tools to help travelers navigate and enjoy their journeys across **Dubai (UAE)** and **Oman**. Built as a Progressive Web App (PWA) with offline capabilities, it provides seamless access to daily schedules, navigation, travel insights, and trip documentation—all designed to enhance the travel experience with minimal friction.


## 📚 Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Key takeaways](#key-takeaways)


<a id="features"></a>
## ✨ Features

- **🗓️ Itinerary & day planning**
  - **Daily itinerary** with add/delete and basic edits (title + location)
  - **Auto-opens today’s date** (or the next upcoming day)
  - **Day tips**: weather + highlights + “what to bring” + “look out for”

- **🧭 Navigation**
  - One-tap **Google Maps directions**: current location → destination (default `travelmode=transit`)

- **💰 Budget**
  - Simple expense tracker with categories + totals (stored locally)

- **📓 Journal**
  - Create journal entries with **text + multiple images** (stored locally)

- **🤖 AI Assistant**
  - Chat powered by Gemini, with itinerary context (done/upcoming/next)
  - **Voice input (STT)** via browser SpeechRecognition
  - Optional **"Use my location"** (reads `navigator.geolocation` and passes lat/lng into the model prompt)


<a id="tech-stack"></a>
## 🧱 Tech stack

- **Frontend**: React 19 + TypeScript
- **Build tooling**: Vite
- **AI**: Gemini via `@google/genai`
- **PWA / caching**: `vite-plugin-pwa` (Workbox)
- **Styling**: Tailwind (CDN) + Font Awesome (CDN)
- **Storage**: `localStorage` (itinerary, budget, journal, cached weather)


<a id="run-locally"></a>
## 💻 Run locally

- **Prerequisites**: Node.js

- **Install dependencies**: 
  - Frontend: `npm install`
  - Backend: `npm run server:install` (or `cd server && npm install`)
- **Set env var**: create `.env.local` in the root directory with `GEMINI_API_KEY=...`
- **Run**:
  - **Both frontend and backend**: `npm run dev:full` (recommended)
  - **Frontend only**: `npm run dev` (requires backend to be running separately)
  - **Backend only**: `npm run server:dev`


<a id="deploy"></a>
## 🚀 Deploy

### Frontend
- **Build**: `npm run build` (outputs `dist/`)
- **Preview**: `npm run preview`
- **Vercel**: `npm run deploy:vercel` / `npm run deploy:vercel:prod`
- **Netlify**: `npm run deploy:netlify`
- **Surge**: `npm run deploy:surge`

### Backend
- **Deploy separately** to a platform like Railway, Render, Fly.io, or Heroku
- **Environment variable**: Set `GEMINI_API_KEY` in your backend hosting provider's environment variables
- **Frontend environment**: Set `VITE_API_URL` to your backend URL (e.g., `https://your-backend.railway.app`)

See `server/README.md` for detailed backend deployment instructions.


<a id="key-takeaways"></a>
## 🧠 Key takeaways

1) **Why “travel planning agents” faded as a startup idea (early 2025)**

- **Commoditization happened fast**: with vibe coding, basic “chat + itinerary” wrappers became easy to replicate. Without depth, differentiation is fragile.
- **The problem is broader than discovery**: real travel planning spans culture and etiquette, geographic clustering, transport trade-offs, packing, safety, and “must-do / must-eat / must-buy” constraints.
- **Strong products need more than chat**: personalization (preferences and travel history), continuously refreshed information, multimodal UX (maps, images), and structured, interactive organization are typically required to deliver a reliable planning experience.

2) **Reliability remains a bottleneck**

- **LLMs still make simple but costly mistakes**: when I built this project, I ran into basic errors (e.g., the model changing travel dates or altering my itinerary). Vibe coding boosts speed, but hallucinations make **manual review** indispensable—often the biggest bottleneck in production settings.
- **Risk compounds with scale**: without effective safeguards, it’s plausible that a major incident will occur due to unreviewed code or reviewed code that still misses a vulnerability.

3) **Vibe coding as a broadly valuable skill**

- **For builders**: it’s increasingly important for developers and researchers to master vibe coding to improve iteration speed and the quality of work.
- **For non-technical users**: modern AI IDEs (e.g., Claude Code, Antigravity, Cursor, Loveable) are mature enough to help non-technical people build tools and MVPs—signaling a broader democratization of building.
- **Examples**
  - **Sales**: scrape a prospect’s public presence, summarize their profile, and draft account-specific outreach strategies.
  - **Marketing**: summarize user feedback across channels and generate insights and prioritized improvements.
