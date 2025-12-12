# Real-Time Trading Dashboard

A comprehensive full-stack real-time trading dashboard featuring live cryptocurrency and stock price updates, interactive charts, customizable price alerts, and historical data analysis. Built with modern web technologies and microservices-friendly architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node->=18.0.0-green.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue.svg)

## Features

- **Real-time Updates**: Sub-second price comparisons and updates via WebSocket.
- **Interactive Charts**: Dynamic visualization with multiple time ranges (1H, 24H, 7D, 30D).
- **Smart Alerting**: Set custom price thresholds (High/Low) and receive instant browser notifications.
- **Optimized Caching**: Tiered in-memory caching for historical data to ensure high performance.
- **Mock Market Simulator**: Realistic price movement simulation for development and testing.
- **Responsive Design**: Fully responsive dashboard built for all device sizes.
- **Docker Ready**: One-command deployment using Docker Compose.

## 🚀 Deployment

The project is deployed and automatically updated via **Railway CI/CD**:

🔗 **Live Demo**: [https://trading-dashboardfrontend-production.up.railway.app/](https://trading-dashboardfrontend-production.up.railway.app/)

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Hooks & Context
- **Real-time**: Socket.IO Client
- **Visualization**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time**: Socket.IO
- **Caching**: Node-cache (In-memory LRU)

### Shared
- **Type Safety**: Shared TypeScript interfaces/types workspace

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Docker & Docker Compose** (Optional, for containerized run)

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/trading-dashboard.git
    cd trading-dashboard
    ```

2.  **Install dependencies**
    ```bash
    # Install dependencies for all workspaces (Root, Backend, Frontend, Shared)
    npm install
    ```

3.  **Environment Configuration**
    
    The application comes with default configuration. You can customize it by creating `.env` files.

    **Backend** (`backend/.env`):
    ```env
    PORT=3001
    CORS_ORIGIN=http://localhost:3000
    ```

    **Frontend** (`frontend/.env.local`):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001
    NEXT_PUBLIC_WS_URL=http://localhost:3001
    ```

## Running the Application

### Option A: Development Mode (Root Directory)

You can run both services simultaneously from the root directory:

```bash
# Starts both Backend (3001) and Frontend (3000)
npm run dev
```

### Option B: Individual Services (Manual)

1.  **Start the Backend**
    ```bash
    cd backend
    npm run dev
    # Runs on http://localhost:3001
    ```

2.  **Start the Frontend** (in a new terminal)
    ```bash
    cd frontend
    npm run dev
    # Runs on http://localhost:3000
    ```

### Option C: Docker Mode (Recommended for Preview)

Run the entire stack with a single command:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Quality Control

This project enforces code quality and commit standards using **Husky** and **Lint-Staged**:

- **Pre-commit**: Automatically runs `eslint` and `prettier` on staged files to ensure code style consistency.
- **Commit-msg**: Enforces [Conventional Commits](https://www.conventionalcommits.org/) format using **Commitlint**.
    - Example: `feat: add price alert feature`
    - Example: `fix: resolve websocket race condition`
- **Pre-push**: Ensures stability before pushing by:
    - Running backend unit tests.
    - verifying that the project builds successfully.

## Running Tests

Unit tests are implemented for critical backend services using Jest.

```bash
cd backend
npm test
```

**Coverage:**
- `TickerService`: Business logic and data generation.
- `CacheService`: Caching mechanisms and TTL.
- `TickerController`: API request handling.

## API Documentation

### REST API
Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/tickers` | List all available tickers | - |
| `GET` | `/tickers/:id` | Get details for a specific ticker | - |
| `GET` | `/tickers/:id/history` | Get historical OHLCV data | `hours` (default: 1) |
| `GET` | `/cache/stats` | View cache performance stats | - |

### WebSocket Events

**Connection**: `ws://localhost:3001`

**Client -> Server**
- `SUBSCRIBE`: Listen to specific ticker updates. Payload: `{ tickerIds: string[] }`
- `UNSUBSCRIBE`: Stop listening. Payload: `{ tickerIds: string[] }`
- `SUBSCRIBE_ALERT`: Set a price alert. Payload: `{ id: string, tickerId: string, price: number, type: 'lower'|'higher' }`
- `UNSUBSCRIBE_ALERT`: Remove an alert. Payload: `{ alertId: string }`

**Server -> Client**
- `PRICE_UPDATE`: Real-time price change. Payload: `PriceUpdate` object.
- `ALERT_TRIGGERED`: Alert threshold crossed. Payload: `AlertTriggered` object.

## 📂 Project Structure

```
trading-dashboard/
├── backend/                # Express server & Business logic
│   ├── src/
│   │   ├── controllers/    # Request handlers (TickerController)
│   │   ├── services/       # Core business logic (Ticker, Alert, Cache)
│   │   ├── websocket/      # Socket.IO handlers
│   │   ├── models/         # Data models and seed data
│   │   └── routes/         # Express routes
│   └── tests/              # Jest unit tests
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/            # Next.js 13+ App Directory
│   │   ├── components/     # React components
│   │   │   ├── common/     # Reusable UI components (Button, Modal, etc.)
│   │   │   ├── icons/      # SVG Icons
│   │   │   └── pages/      # Page-specific components
│   │   ├── context/        # Global state (Toast, Theme)
│   │   ├── services/       # API & WebSocket clients
│   │   ├── hooks/          # Custom React hooks (useWindowWidth, etc.)
│   │   ├── utils/          # Helper functions (formatters)
│   │   ├── types/          # Frontend-specific types
│   │   ├── styles/         # Global styles and CSS modules
│   │   └── enums/          # Frontend enums
└── shared/                 # Shared Types & interfaces workspace
```

## Performance & Architecture

### Caching Strategy
We use an **in-memory caching layer** (`CacheService`) to optimize historical data retrieval.
- **Tiered TTL**: Time-To-Live varies by request range:
    - **< 30 mins**: 5 seconds TTL (Live data needs freshness)
    - **1 Hour**: 5 minutes TTL
    - **24 Hours**: 8 minutes TTL
    - **> 24 Hours**: 10 minutes TTL
- **Eviction**: LRU (Least Recently Used) policy ensures memory safety (max 1000 keys).

### Clean Architecture
The backend follows **Separation of Concerns**:
- **Controllers** handle HTTP requests.
- **Services** interface encapsulates business logic (e.g., `TickerService`).
- **Data Layer** (Mock) is isolated, allowing easy swap for a real DB.
- **Dependency Injection**: Services are injected, making code testable and modular.

## Future Enhancements

- [ ] **Authentication**: User accounts to save alerts and favorites persistently.
- [ ] **Database**: Integration with TimescaleDB or InfluxDB for real historical data.
- [ ] **Redis**: Distributed caching for scaling multiple backend instances.
- [ ] **Technical Indicators**: RSI, MACD calculation on the backend.

## Troubleshooting

**Port Conflicts**
If ports 3000 or 3001 are in use:
1.  Check running processes: `lsof -i :3000`
2.  Kill process or change `PORT` in `.env`.

**WebSocket Connection Fails**
- Ensure backend is running.
- Check browser console for CORS errors.
- Verify `NEXT_PUBLIC_API_URL` matches backend URL.

---
Built for the Coding Interview Challenge.
