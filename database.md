# 🗄️ Ziglet Backend Database Documentation

This document describes the PostgreSQL database schema for the Ziglet Garden project. The architecture is designed for **Eventual Consistency**, **Idempotency**, and **High Scalability**.

---

## 🏗️ Core Architecture: Event-Based Rewards
Instead of just updating a "balance" column, every reward in this system is driven by a `task_events` record.
1. A **TaskEvent** is recorded (The Truth).
2. A **Reward** (FaucetClaim or PointsLedger) is linked to that event.
3. This prevents double-spending and allows for complete audit trails.

---

## 📊 Entity Relationship Summary

- **Users** have many **SocialAccounts**.
- **Users** trigger **TaskEvents** by completing **Tasks**.
- Each **TaskEvent** can be linked to exactly one **FaucetClaim** or **PointsLedger** entry.
- **UserLogins** tracks daily activity and drives the Daily Reward system.

---

## 📑 Table Definitions

### 1. `users`
Stores unique ZigChain identities.
- `id`: UUID (Primary Key)
- `zig_address`: `zig1...` formatted address (Unique Index)
- `last_login_at`: Timestamp of the most recent authentication.

### 2. `task_events` (CRITICAL)
The source of truth for all user actions.
- `uq_event`: Unique Constraint on `(task_id, external_id, event_date)`.
- `external_id`: Stores deterministic keys like `tweet_id` or `user_id`.
- `event_date`: Used for daily tasks (`YYYY-MM-DD`). For one-time tasks, this is `NULL`.

### 3. `user_logins`
Tracks daily login history for the Calendar UI and Daily Reward logic.
- `unique(user_id, login_date)`: Ensures only one entry per user per day.
- `claimed`: Boolean flag indicating if the day's reward was collected.

### 4. `faucet_claims` & `points_ledger`
Linked to `task_events` via a **Unique Index** on `event_id`.
- `status`: For Faucet, starts as `pending` and moves to `confirmed` after blockchain payout.
- `amount`: The quantity rewarded.

---

## ⌨️ Database Schema (SQL DDL)

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zig_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    type TEXT, -- social_check, submission, on_chain
    platform TEXT,
    reward_type TEXT NOT NULL, -- faucet, points
    reward_amount NUMERIC(18,0) NOT NULL,
    daily_limit INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Task Events (Idempotency Layer)
CREATE TABLE task_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    external_id TEXT NOT NULL,
    event_date DATE,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    CONSTRAINT uq_event UNIQUE (task_id, external_id, event_date)
);

-- User Login Tracking
CREATE TABLE user_logins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_login_day UNIQUE (user_id, login_date)
);

-- Faucet Claims (Downstream of Events)
CREATE TABLE faucet_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id UUID UNIQUE REFERENCES task_events(id)
);

-- Points Ledger
CREATE TABLE points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id UUID UNIQUE REFERENCES task_events(id)
);

-- Social Accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    platform_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_platform_user UNIQUE (platform, platform_user_id),
    CONSTRAINT uq_user_platform UNIQUE (user_id, platform)
);

-- Meme Submissions
CREATE TABLE meme_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', 
    admin_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);
```

---

## ⚡ Performance Optimization

We have implemented the following indexes to maintain sub-millisecond query times:

| Table | Index Columns | Purpose |
| :--- | :--- | :--- |
| `users` | `zig_address` | Fast authentication lookups. |
| `task_events` | `user_id`, `task_id` | Quick task history for users. |
| `user_logins` | `user_id`, `login_date` | Fast calendar and check-in validation. |
| `faucet_claims` | `user_id`, `status` | Pending payout batching. |
| `social_accounts`| `platform_user_id`| Sybil defense (checking if Twitter ID is reused). |
