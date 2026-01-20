# Ziglet Backend - Master Roadmap & Architecture

## 1. Project Overview
**Ziglet** is a backend-first Web3 reward platform.
- **Identity:** ZigChain Wallet (Primary) + Twitter (Secondary).
- **Core Loop:** Auth -> Link Social -> Complete Tasks -> Verify -> Earn Faucet/Points.
- **External:** Telegram/Instagram verification is **out of scope** (handled effectively as boolean inputs).

---

## 2. Phase-wise Implementation Roadmap

### Phase 1: Foundations & Database
- [ ] Initialize Node/Express + TypeScript project.
- [ ] Configure local PostgreSQL connection (TypeORM/Prisma).
- [ ] Configure Redis connection (Rate limiting).
- [ ] Implement global error handling, logging (Winston), and security headers (Helmet).
- [ ] **Deliverable:** DB Schema migration.

### Phase 2: Wallet Authentication (Auth Module)
- [ ] API: `POST /auth/nonce` (Generate random nonce for wallet).
- [ ] API: `POST /auth/verify` (Verify signature, upsert user, issue JWT).
- [ ] Middleware: `authenticate` (JWT validation).
- [ ] Security: Nonce expiration (5 min), replay protection.

### Phase 3: Social Identity (Twitter)
- [ ] API: start Twitter OAuth flow.
- [ ] API: Twitter callback handling.
- [ ] Service: Store `social_accounts` with strict uniqueness.
- [ ] Constraint: 1 Wallet = 1 Twitter Account.

### Phase 4: Task Engine Core
- [ ] Database: Seed `tasks` (Follow, Tweet, etc.).
- [ ] API: `GET /tasks` (List available tasks with completion status).
- [ ] Service: Task Verification Logic (Base Class).

### Phase 5: Twitter Verification Implementation
- [ ] Integration: Twitter API v2 (User Lookup, Tweet Lookup).
- [ ] Logic: Verify "Follow Ziglet".
- [ ] Logic: Verify "Tweet with Hashtag/Mention".
- [ ] Anti-abuse: Check tweet age, author matching.

### Phase 6: Faucet & Rewards
- [ ] Database: `faucet_claims` table.
- [ ] Service: Locking mechanism (Redis) to prevent double-spending.
- [ ] Service: Transaction broadcasting (Mocked or Real implementation dependent on ZigChain lib availability).
- [ ] API: `POST /tasks/claim` (Verify task -> Distribute Reward).

### Phase 7: Admin & Meme Review
- [ ] API: `POST /submissions/meme` (User upload).
- [ ] API: `GET /admin/submissions` (Admin list).
- [ ] API: `POST /admin/submissions/:id/review` (Approve/Reject + Points).
- [ ] Role-based Access Control (RBAC) for Admin routes.

### Phase 8: Leaderboard
- [ ] API: `GET /leaderboard`.
- [ ] Query: Optimized aggregation of `points_ledger`.

---

## 3. Database Schema (PostgreSQL)

```sql
-- 1. Users (Identity Root)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zig_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- 2. Social Accounts (Twitter Context)
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'telegram', 'instagram')),
  platform_user_id TEXT NOT NULL, -- TwitterID, etc.
  username TEXT NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uq_social_platform_uid UNIQUE(platform, platform_user_id), -- Prevent account reuse
  CONSTRAINT uq_user_platform UNIQUE(user_id, platform) -- 1 acc per platform per wallet
);

-- 3. Tasks (Static/Seed Data)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'twitter-follow-main', 'daily-tweet'
  type VARCHAR(20) CHECK (type IN ('social_check', 'submission', 'on_chain')),
  platform VARCHAR(20),
  reward_type VARCHAR(20) CHECK (reward_type IN ('faucet', 'points')),
  reward_amount NUMERIC(18, 0), -- Points amount or Token amount
  daily_limit INTEGER DEFAULT 0, -- 0 = one-time, > 0 = daily
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}' -- Stores required hashtags, handles to follow, etc.
);

-- 4. Task Completions (History)
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  completion_data JSONB, -- Link to tweet, or proof
  CONSTRAINT uq_one_time_task UNIQUE NULLS NOT DISTINCT (user_id, task_id) -- Partial index concept handled via logic for daily
);

-- 5. Faucet Claims (Money)
CREATE TABLE faucet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_completion_id UUID REFERENCES task_completions(id),
  amount VARCHAR(50) NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL, -- Idempotency key
  status VARCHAR(20) DEFAULT 'confirmed',
  claimed_at TIMESTAMP DEFAULT NOW()
);

-- 6. Meme Submissions (Manual Review)
CREATE TABLE meme_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  image_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_feedback TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- 7. Points Ledger (Ranking)
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  reason VARCHAR(50) NOT NULL, -- 'task_reward', 'admin_adjustment'
  amount INTEGER NOT NULL, -- Can be negative
  reference_id UUID, -- Link to task_completion or submission
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. Security Architecture

### Authentication
- **Strategy**: EIP-191 / ZigChain equivalent message signing.
- **Flow**:
    1. Client req nonce -> Server redis SETEX `nonce:wallet` (5m).
    2. Client signs nonce.
    3. Server recovers address. If match && nonce valid -> Issue JWT.
    4. JWT Validity: 1 hour (Forces re-signing often for safety).

### API Security
- **Rate Limiting**: Tiered by IP and Auth Token.
    - Auth: 10 req/min.
    - Faucet: STRICT 1 req/day (logic level) + 5 req/hour (API level).
- **Idempotency**: All value-transfer endpoints (faucet) require specific task_completion_ids to prevent re-execution.

### Data Integrity
- **Transactions**: Critical flows (Claiming) must use database transactions.
- **Locks**: Redis Mutex on UserID during Faucet execution to prevent race conditions.
