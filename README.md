# Ziglet Backend - Web3 Rewards Platform

**Authoritative Backend System** for managing Wallet Authentication, Social Linking (Twitter), Task Verification, and Faucet Distribution.

## 🚀 Tech Stack
- **Runtime:** Node.js (TypeScript)
- **Framework:** Express
- **Database:** PostgreSQL (TypeORM)
- **Cache/Locks:** Redis
- **Auth:** Web3 Wallet Signature (EIP-191) + JWT

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js v16+
- PostgreSQL running locally (default port 5432)
- Redis running locally (default port 6379)

### 2. Environment Variables
Create a `.env` file in root (if not exists):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ziglet_backend
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super-secure-secret
TWITTER_CLIENT_ID=your_id_here
TWITTER_CLIENT_SECRET=your_secret_here
TWITTER_CALLBACK_URL=http://localhost:3000/api/social/twitter/callback
ADMIN_API_KEY=admin-secret-key
```

### 3. Install & Build
```bash
npm install
npm run build
```

### 4. Database Initialization
Ensure your Postgres service is running. The app uses `synchronize: true` for MVP dev speed (auto-creates tables).
```bash
# Start the server to init tables
npm run start
# OR run dev mode
npm run dev
```

### 5. Seeding Data
Populate the database with initial tasks:
```bash
npm run seed
```

## 📚 API Endpoints

### Authentication `(AuthModule)`
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/nonce` | Request a nonce for a wallet address to sign. |
| `POST` | `/api/auth/verify` | Verify signature and login. Returns JWT. |

### Social `(SocialModule)`
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/social/twitter/connect` | Get Twitter OAuth redirect URL. |
| `POST` | `/api/social/twitter/callback` | Exchange code for user link (Internal/Callback). |

### Tasks `(TaskModule)`
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | List all tasks with `isCompleted` status. |
| `POST` | `/api/tasks/complete` | Verify and claim a task reward. |

### Admin & Faucet `(AdminModule)`
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/faucet/process` | Trigger batch processing of pending faucet claims. (Headers: `x-admin-key: <ADMIN_API_KEY>`) |

## 🔒 Security Features Implemented
1.  **Nonce-based Auth**: Prevents replay attacks on login.
2.  **Redis Locking**: Ensures Faucet is not drained by race conditions (`lock:faucet_process`).
3.  **Strict Inputs**: 1 Social Account per Wallet. Unique Constraints in DB.
4.  **Idempotency**: Tasks check `daily_limit` and `existing_completion` records before logic.

## 📝 Notes
- **Twitter Verification**: Currently checks if *any* Twitter account is linked. For full string match verification, valid Twitter Developer credentials must be added to `.env` and `TwitterService` logic enabled.
- **Faucet**: Currently mocks the blockchain transaction (`MOCK_TX_HASH`). Replace `FaucetService` logic with real `ethers.js` wallet calls when deploying to Testnet.
