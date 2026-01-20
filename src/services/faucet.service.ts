// Faucet Service - Cosmos Native
// In production, would use @cosmjs/stargate for SigningStargateClient
import { AppDataSource } from '../data-source';
import { FaucetClaim } from '../database/entities/FaucetClaim';
import redisClient from '../config/redis';

export class FaucetService {
    private claimRepository = AppDataSource.getRepository(FaucetClaim);

    // Placeholder for Cosmos-style provider
    // private rpc = process.env.ZIG_CHAIN_RPC;

    async processPendingClaims() {
        // 1. Lock execution to prevent double processing
        const lock = await redisClient.set('lock:faucet_process', '1', { NX: true, EX: 60 });
        if (!lock) {
            console.log('Faucet processing already in progress.');
            return;
        }

        try {
            const pendingClaims = await this.claimRepository.find({
                where: { status: 'pending' },
                take: 10 // Process 10 at a time
            });

            console.log(`Found ${pendingClaims.length} pending claims.`);

            for (const claim of pendingClaims) {
                await this.executeFaucetTransaction(claim);
            }
        } finally {
            await redisClient.del('lock:faucet_process');
        }
    }

    private async executeFaucetTransaction(claim: FaucetClaim) {
        try {
            console.log(`Processing claim ${claim.id} for amount ${claim.amount}`);

            // MOCK TRANSACTION EXECUTION
            // In prod:
            // const client = await SigningStargateClient.connectWithSigner(this.rpc, signer);
            // const result = await client.sendTokens(faucetAddress, claim.user.zig_address, [{ denom: "uzig", amount: "..." }], fee);
            // const realTxHash = result.transactionHash;

            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

            claim.status = 'confirmed';
            claim.tx_hash = mockTxHash;

            await this.claimRepository.save(claim);
            console.log(`Claim ${claim.id} confirmed with hash ${mockTxHash}`);
        } catch (error) {
            console.error(`Failed to process claim ${claim.id}`, error);
            claim.status = 'failed';
            // claim.error_reason = error.message; // If we had this column
            await this.claimRepository.save(claim);
        }
    }
}
