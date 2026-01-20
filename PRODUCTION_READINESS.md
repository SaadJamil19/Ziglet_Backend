# Production Readiness Checklist

## 1. Security
- [ ] **Secrets Management**: Move `.env` variables to a secure secret manager (AWS Secrets Manager, Vault) in production.
- [ ] **DDoS Protection**: Rate limiting is enabled via Redis, but ensure Cloudflare/WAF is in front.
- [ ] **Admin Auth**: `x-admin-key` is weak. Replace with specific Admin JWTs or VPN-gated routes.
- [ ] **Wallet Signature**: Ensure `ethers.verifyMessage` handles all edge cases (EIP-712 structured data is preferred over simple strings for better UX).

## 2. Database & Data Integrity
- [ ] **Migrations**: Currently using `synchronize: true` which is DANGEROUS for prod. 
    - [ ] Run `typeorm migration:generate`
    - [ ] Disable synchronization in `data-source.ts`
- [ ] **Indexes**: Ensure `zig_address`, `twitter_user_id`, and `tx_hash` have proper indices (Added in Entity, verify in SQL).
- [ ] **Backups**: Configure automated daily backups for PostgreSQL.

## 3. Scalability
- [ ] **Redis**: Ensure Redis persistence (AOF/RDB) is configured if using it for critical locks, or treat locks as ephemeral.
- [ ] **Connection Pooling**: Tune TypeORM pool size for expected load.
- [ ] **Horizontal Scaling**: The app is stateless (except for local `pkceStore` memory - **Moved to Redis TODO**). To scale `social.controller.ts` across multiple instances, `pkceStore` MUST be moved to Redis.

## 4. Faucet Safety
- [ ] **Wallet Management**: `FAUCET_PRIVATE_KEY` in env is risky. Use a secure signer service or HSM.
- [ ] **Funds Monitoring**: Add alert if Faucet wallet balance < Threshold.
- [ ] **Dead Letter Queue**: Failed faucet transactions currently set status='failed'. Needs a retry mechanism or alert system.

## 5. Monitoring
- [ ] **Logs**: Integrate Sentry for error tracking.
- [ ] **Metrics**: Add Prometheus/Grafana endpoint for tracking:
    - Faucet drain rate
    - Task completion rate
    - API latency

## 6. Logic Validation
- [ ] **Twitter API**: Ensure rate limits (429) are handled gracefully in `TwitterService`.
- [ ] **Leaderboard**: `getLeaderboard` query needs caching (Redis 1 minute) if traffic is high.
