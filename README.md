# 🏁 Monster Race — Live Vote Counting System

A fast, clean, and real-time web application built with **React**, **Vite**, **Node.js/Express**, and **Socket.io** to record and count votes for a 10-monster competition. Everything updates live across all connected devices and persists to `data/monsters.json`.

---

## 🌟 Key Features

- **10 Monsters:**
  1. 🧛 Dracula
  2. 🧟 Frankenstein
  3. 🧻 Ancient Mummy
  4. 🐺 Werewolf
  5. 👁️ Cyclops
  6. 🦖 Godzilla
  7. 👻 Ghost
  8. 🦶 Bigfoot
  9. 🧟‍♂️ Fast Zombie
  10. 🦇 Night Gargoyle

- **Navigation Bar with Integrated Tabs:**
  - 📊 **Global Summary**: Leaderboards, total vote metrics, percentage progress bars, and breakdown.
  - 👾 **Monsters**: Select any monster (1 to 10) to see a table listing every membership that voted for it and their exact vote count (no duplicate rows). Includes `+1`, `-1`, and delete actions.
  - 🗳️ **Record Votes**: High-speed ballot entry form designed for manual paper ballots. Select monster (1-10 or shortcut <kbd>Alt + 1..0</kbd>), enter 3-4 digit membership, and press <kbd>Enter</kbd>.

- **Multiple Votes Allowed per Membership:**
  - Memberships can vote multiple times for the same monster.
  - In the monster table, each membership appears **only once**, clearly showing the total number of votes it contributed.

- **Real-Time Multi-Device Sync:**
  - Powered by **Socket.io**.
  - Any vote submitted from any phone, tablet, or laptop immediately updates all connected screens with live toaster notifications.
  - Shows connected devices count in the top bar.

- **Data Persistence:**
  - Every vote change is immediately written atomically to `data/monsters.json`.

- **Docker & GitHub Actions:**
  - Production-ready `Dockerfile` with multi-stage build.
  - `docker-compose.yml` with host volume mapping `./data:/app/data`.
  - CI/CD workflow in `.github/workflows/deploy.yml` that runs automated tests, builds the app, and publishes to GitHub Container Registry (GHCR).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix client install
```

### 2. Development Mode (Frontend + Backend with hot reload)
```bash
npm run dev
```
- Client: `http://localhost:5173`
- Backend API & WebSockets: `http://localhost:3001`

### 3. Production Mode
```bash
npm run build
npm start
```
Open `http://localhost:3001` in your browser.

### 4. Run Automated Tests
```bash
npm test
```

---

## 📱 Multi-Device Access on Local Wi-Fi

1. Start the server on your computer (`npm start` or Docker).
2. Check your computer's local IP address (`ipconfig` on Windows or `ifconfig`/`ip a` on Mac/Linux, e.g., `192.168.1.50`).
3. Open `http://192.168.1.50:3001` on any mobile phone or tablet on the same Wi-Fi network.

---

## 🐳 Docker Deployment

```bash
docker compose up -d --build
```
Access the application at `http://localhost:3001`. Data persists in `./data/monsters.json`.
