"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetService = void 0;
const data_source_1 = require("../data-source");
const FaucetClaim_1 = require("../database/entities/FaucetClaim");
const redis_1 = __importDefault(require("../config/redis"));
class FaucetService {
    constructor() {
        this.claimRepository = data_source_1.AppDataSource.getRepository(FaucetClaim_1.FaucetClaim);
    }
    // Real implementation would use a provider
    // private provider = new ethers.JsonRpcProvider(process.env.ZIG_CHAIN_RPC);
    // private wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, this.provider);
    async processPendingClaims() {
        // 1. Lock execution to prevent double processing
        const lock = await redis_1.default.set('lock:faucet_process', '1', { NX: true, EX: 60 });
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
        }
        finally {
            await redis_1.default.del('lock:faucet_process');
        }
    }
    async executeFaucetTransaction(claim) {
        try {
            console.log(`Processing claim ${claim.id} for amount ${claim.amount}`);
            // MOCK TRANSACTION EXECUTION
            // In prod: 
            // const tx = await this.wallet.sendTransaction({ to: claim.user.zig_address, value: ethers.parseEther(claim.amount) });
            // const receipt = await tx.wait();
            // const realTxHash = receipt.hash;
            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            claim.status = 'confirmed';
            claim.tx_hash = mockTxHash;
            await this.claimRepository.save(claim);
            console.log(`Claim ${claim.id} confirmed with hash ${mockTxHash}`);
        }
        catch (error) {
            console.error(`Failed to process claim ${claim.id}`, error);
            claim.status = 'failed';
            // claim.error_reason = error.message; // If we had this column
            await this.claimRepository.save(claim);
        }
    }
}
exports.FaucetService = FaucetService;
