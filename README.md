To **maximize clarity and deployment readiness**, I'll merge your documentation into a **single clean, production-ready `README.md`** with clear sectioning, minimal repetition, and focus on actual usage and deployment (especially for Render hosting). Here's the final optimized version:

---


# 🌾 CropAlert - Agricultural Monitoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9+-red.svg)](https://nestjs.com/)

> A modern platform to empower farmers with real-time weather data, smart alerts, and zone management. Built with React, NestJS, PostgreSQL, and Docker.

---

## 🚀 Quick Start

### ✅ Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL or Render DB service

### 🔧 Local Setup (Manual)

```bash
# Clone the repo
git clone git@github.com:mkatfi/CropAlert.git
cd CropAlert

# Backend
cd Server/backend
npm install
npm run start:dev

# Frontend (in a new terminal)
cd Client/frontend
npm install
npm start
````

### 🐳 Docker Setup (Recommended)

```bash
# Start all services
docker-compose up --build
```

> Or use `make up` if a Makefile is included.

---

## 🌍 Hosting on Render.com

### 1. 🗃️ PostgreSQL

* Create a **PostgreSQL database** on Render.
* Copy credentials (`host`, `user`, `password`, `db`).

### 2. 🟥 Backend (NestJS)

* Push `Server/backend` to GitHub.
* Create **Web Service** on Render:

  * **Build Command**: `npm install && npm run build`
  * **Start Command**: `npm run start:prod`
  * Add `.env` from below.

### 3. 🟦 Frontend (React)

* Push `Client/frontend` to GitHub.
* Create **Static Site** on Render:

  * **Build Command**: `npm install && npm run build`
  * **Publish Directory**: `build`
  * **Root Dir**: `Client/frontend` (if monorepo)

### 4. 🔐 Environment Variables

**Backend `.env`:**

```env
DB_TYPE=postgres
DB_HOST=your-db-host.render.com
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=your_db_name
JWT_SECRET=your-jwt-secret
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=true
PORT=3001
```

**Frontend `.env`:**

```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_WEATHER_API_KEY=your_visual_crossing_key
```

---

## 🛠️ Architecture

```
CropAlert/
├── Client/                  # React frontend
│   └── frontend/            # Contains components, pages, services
├── Server/                  # NestJS backend
│   ├── auth/                # Auth module
│   ├── user/                # User management
│   └── zone-data/           # Crop & zone alert logic
├── docker-compose.yml       # Dev containers
└── Makefile                 # Optional CLI helpers
```

---

## 💡 Features

### 🧑‍🌾 Core Agri Monitoring

* Smart alert system: pests, diseases, weather
* Realtime weather: Visual Crossing API
* GPS-based zone tracking
* Interactive Leaflet map UI

### 🌦️ Weather Intelligence

* Current & forecasted weather
* Zone-based weather impact
* Historical climate tracking

### 🔐 UX & Tech

* JWT authentication
* RESTful API
* WebSocket support for real-time
* PostgreSQL for data storage
* Docker for deployment

---

## 🧪 API Overview

### Auth

```http
POST /auth/register       // Register
POST /auth/login          // Login
GET  /auth/profile        // Get profile
```

### Zone & Alerts

```http
GET    /zone-data         // List zones
POST   /zone-data         // Create alert
PUT    /zone-data/:id     // Update alert
DELETE /zone-data/:id     // Delete alert
```

### Users

```http
GET /user                 // Get user
PUT /user                 // Update user
```

---

## 🔍 Usage Tips

### Zone & Alert Management

1. Create zones using GPS/map interface.
2. Add crop-specific alerts with severity levels.
3. Monitor zones live via weather overlays.

### Weather Monitoring

* Integrated Visual Crossing API
* Forecast, current, historical data
* Auto-location support

---

## 🔧 Dev Commands

```bash
# CropAlert
    make
```

---

## 🧩 Troubleshooting

| Issue                  | Solution                                           |
| ---------------------- | -------------------------------------------------- |
| ❌ Weather not showing  | Check `REACT_APP_WEATHER_API_KEY`                  |
| ❌ Map not loading      | Confirm Leaflet CSS is loaded, check console       |
| ❌ DB connection failed | Verify Render DB settings and `.env`               |
| ❌ 404 on React reload  | Add `/*` rewrite to `/index.html` in Render static |

---

## 🤝 Contributing

1. Fork & branch
2. Commit with clear message
3. Open Pull Request

Guidelines:

* Use TypeScript best practices
* Add unit/integration tests
* Lint & test before PR

---

## 📜 License

MIT — See `LICENSE` file for details.

---

## 🙏 Acknowledgments

* [Visual Crossing Weather API](https://www.visualcrossing.com/)
* [Leaflet.js](https://leafletjs.com/)
* [React](https://reactjs.org/)
* [NestJS](https://nestjs.com/)
