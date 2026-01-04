# GramShiksha - Offline-First Educational Platform

GramShiksha is a Progressive Web Application (PWA) designed to bridge the digital divide by providing high-quality, gamified education in low-connectivity and remote environments.

### 🚀 **[Launch Live Application](https://VENOMRK22.github.io/GramShiksha/)**

---

## The 3 Pillars of GramShiksha

### 1. Offline-First Architecture 📶
Built on a local-first philosophy, GramShiksha ensures that learning never stops, even without an internet connection.
- **Local Database (RxDB)**: All student progress, lessons, and quiz results are stored locally on the device using IndexedDB.
- **PWA Capabilities**: The app installs as a native-like application on any device and caches critical assets for instant, offline access.
- **Resilient Reliability**: The application functions 100% offline. Server sync is an optional enhancement, not a requirement.

### 2. Gamified Learning Experience 🎮
To keep students engaged and motivated, we integrate core game mechanics into the learning process.
- **Level-Based Progression**: Students navigate a "World Map" of knowledge, unlocking new levels as they master subjects.
- **Rewards System**: Learners earn stars, coins, and badges for completing content and acing quizzes.
- **Leaderboards**: Friendly competition via village and class leaderboards fosters a sense of community and achievement.

### 3. Peer-to-Peer (P2P) Offline Sync 🔄
We solve the content distribution problem in remote areas with our innovative QR-based sync system.
- **Device-to-Device Sharing**: Teachers or students can share their progress or distribute new content by generating and scanning QR codes.
- **No Internet Required**: Data is compressed and encoded into QR streams, allowing "air-gapped" transfer of quizzes, lessons, and user profiles between devices directly.

---

## Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Database**: RxDB (Local-First)
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VENOMRK22/GramShiksha.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```
