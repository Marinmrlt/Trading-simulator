# 📈 Trading Simulator

A full-featured **crypto trading simulator** built with NestJS, TypeORM, and real-time market data from Binance, Kraken, or Coinbase.

Paper trade with **$10,000 virtual USD**, track performance, run backtests, and compete on the leaderboard — all without risking real money.

---

## ✨ Features

### Core Trading
- **Market & Limit orders** with fee simulation (multi-broker: Binance, Kraken, Coinbase, Fixed)
- **Stop Loss / Take Profit** with automatic trigger via trade monitor
- **Trailing Stop** — dynamic SL that follows peak price by offset %
- **OCO Orders** — One Cancels Other (linked SL + TP, auto-cancel on trigger)
- **Order types**: GTC, GTD (expiry date), IOC (immediate or cancel)
- **Simulated slippage** — ±0.1% random price deviation for realism

### Risk Management
- **Max position size** — limit single order to X% of portfolio value
- **Daily loss limit** — stop trading after $X realized losses per day
- **Configurable per user** via `PUT /trade/risk`

### Wallet & Portfolio
- **Auto-created $10,000 USD** wallet on registration
- **Deposit, withdraw, lock/unlock** funds
- **Portfolio summary** with live USD valuation
- **Equity curve** — hourly portfolio snapshots for historical tracking
- **Account reset** — wipe and restart with $10k

### Market Data
- **Real-time prices** via WebSocket (3s polling)
- **Multi-exchange support** — Binance (default), Kraken, Coinbase
- **OHLCV candle data** for charting
- **Custom price alerts** — "Notify me when BTC > $100k" (WebSocket push)

### Analytics
- **Performance dashboard** — win rate, avg P&L, total P&L, Sharpe ratio
- **Leaderboard** — rank all users by total P&L
- **Backtesting engine** — SMA crossover strategy on historical data
- **Technical analysis** — RSI, SMA, EMA, Bollinger Bands, MACD

### Infrastructure
- **JWT authentication** with refresh tokens
- **Rate limiting** — global 100 req/min, auth endpoints 10 req/min
- **Helmet** security headers
- **API versioning** — `/api/v1` prefix
- **Database migrations** support (TypeORM)
- **Swagger API docs** — auto-generated at `/api/docs`

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm

### Installation

```bash
git clone <repo-url>
cd trading-simulator
npm install
```

### Configuration

Create a `.env` file at the root:

```env
PORT=3000
DB_DATABASE=trading.db
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_MIGRATIONS_RUN=false
CORS_ORIGIN=*
EXCHANGE_MODE=PAPER
MARKET_PROVIDER=binance
JWT_SECRET=your-secret-key
```

### Run

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Swagger Docs

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) after starting the server.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login (returns JWT) |

### Market (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/market/assets` | All tracked assets |
| GET | `/api/v1/market/price/:symbol` | Single asset price |
| GET | `/api/v1/market/candles` | OHLCV candle data |

### Market — Alerts (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/market/alerts` | Create price alert |
| GET | `/api/v1/market/alerts` | List my alerts |
| DELETE | `/api/v1/market/alerts/:id` | Delete alert |

### Trade (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/trade/order` | Place market/limit order |
| POST | `/api/v1/trade/oco` | Place OCO (SL + TP) |
| GET | `/api/v1/trade/orders` | Order history |
| GET | `/api/v1/trade/positions` | Open positions |
| GET | `/api/v1/trade/risk` | View risk settings |
| PUT | `/api/v1/trade/risk` | Update risk settings |
| GET | `/api/v1/trade/performance` | Performance metrics |
| GET | `/api/v1/trade/leaderboard` | P&L leaderboard |
| DELETE | `/api/v1/trade/order/:id` | Cancel order |

### Wallet (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallet` | Wallet balances |
| GET | `/api/v1/wallet/portfolio` | Portfolio (USD value) |
| GET | `/api/v1/wallet/equity-curve` | Equity curve history |
| GET | `/api/v1/wallet/transactions` | Transaction history |
| POST | `/api/v1/wallet/deposit` | Deposit funds |
| POST | `/api/v1/wallet/withdraw` | Withdraw funds |
| POST | `/api/v1/wallet/reset` | Reset to $10k |

### Backtest
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/backtest/run` | Run SMA strategy |

---

## 🔌 WebSocket Events

Connect to `ws://localhost:3000` for real-time updates:

| Event | Payload | Description |
|-------|---------|-------------|
| `ticker` | `{ symbol, price }` | Price updates (3s) |
| `orderUpdate` | `{ orderId, status, ... }` | Order fill/cancel |
| `tradeAlert` | `{ type, symbol, ... }` | SL/TP/Trailing/OCO/Alert triggers |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_DATABASE` | — | SQLite database file path |
| `DB_SYNCHRONIZE` | `true` | Auto-sync schema (disable in prod) |
| `DB_LOGGING` | `false` | SQL query logging |
| `DB_MIGRATIONS_RUN` | `false` | Auto-run migrations on start |
| `EXCHANGE_MODE` | `PAPER` | `PAPER` or `LIVE` |
| `MARKET_PROVIDER` | `binance` | `binance`, `kraken`, or `coinbase` |
| `CORS_ORIGIN` | `*` | CORS allowed origin |
| `JWT_SECRET` | — | JWT signing secret |

---

## 🏗️ Architecture

src/
├── contexts/                 # Modular Bounded Contexts
│   ├── auth/                 # Authentication & Authorization
│   ├── users/                # User Management
│   ├── wallet/               # Wallet & Portfolio Management
│   ├── market/               # Market Data (aggregators, alerts)
│   ├── trade/                # Trading Engine (orders, risk, brokers)
│   ├── backtest/             # Backtesting Engine
│   └── technical-analysis/   # TA Indicators (RSI, MACD, etc.)
│   │
│   └── [module]/             # Standard 3-Layer Architecture
│       ├── domain/           # Business Logic (Enterprise Rules)
│       │   ├── models/       # Pure interfaces/types
│       │   ├── ports/        # Repository/Service interfaces
│       │   ├── errors/       # Domain-specific errors
│       │   └── services/     # Pure business logic services
│       ├── infrastructure/   # Implementation Details
│       │   ├── entities/     # Database entities (TypeORM)
│       │   ├── repositories/ # Repository implementations
│       │   └── adapters/     # External service adapters
│       └── application/      # Application Logic
│           ├── controllers/  # HTTP Controllers
│           ├── dto/          # Data Transfer Objects
│           └── presenters/   # Response formatting
│
├── core/                     # Shared Kernel
│   ├── decorators/           # Custom decorators
│   ├── errors/               # Base DomainError
│   ├── filters/              # Exception filters
│   └── interceptors/         # Response interceptors
│
└── main.ts                   # Application Entry Point

---

## 📝 License

MIT
