
// Set environment to TEST to use In-Memory SQLite and Skip auto-start in app.ts
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Import dependencies AFTER setting env
import { AppDataSource } from './data-source';
import app from './app';
import { Task, TaskType, RewardType } from './database/entities/Task';
import { User } from './database/entities/User';
import { SocialAccount, SocialPlatform } from './database/entities/SocialAccount';
import axios from 'axios';
import { Secp256k1, Sha256 } from '@cosmjs/crypto';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import { pubkeyToAddress } from '@cosmjs/amino';

const TEST_PORT = 3001;
const API_URL = `http://localhost:${TEST_PORT}/api`;

async function main() {
    console.log('🔵 Starting Virtual Environment (In-Memory DB)...');

    // 1. Initialize In-Memory DB
    try {
        await AppDataSource.initialize();
        console.log('📦 In-Memory Database Initialized.');
    } catch (e: any) {
        console.error('DB Init Error:', e);
        require('fs').writeFileSync('debug_error.txt', JSON.stringify(e, Object.getOwnPropertyNames(e), 2) + '\n' + e.message + '\n' + e.stack);
        process.exit(1);
    }

    // 2. Start Server
    const server = app.listen(TEST_PORT, () => {
        console.log(`🚀 Virtual Server running on port ${TEST_PORT}`);
    });

    try {
        // 3. Seed Data
        console.log('🌱 Seeding Tasks...');
        const taskRepo = AppDataSource.getRepository(Task);
        await taskRepo.save(taskRepo.create({
            slug: 'twitter-follow',
            type: TaskType.SOCIAL_CHECK,
            platform: 'twitter',
            reward_type: RewardType.FAUCET,
            reward_amount: '1.0',
            daily_limit: 0,
            is_active: true,
            metadata: { target_handle: 'ZigletApp' }
        }));


        // --- VIRTUAL USER FLOW (COSMOS NATIVE) ---
        console.log('\n--- 👤 STEP 1: User Auth (Cosmos Native) ---');

        // Use a fixed or random mnemonic/key for testing
        // For simplicity in virtual-check, we'll generate a random Secp256k1 pair
        const privateKey = fromHex('af9e8e5f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f');
        const { pubkey } = await Secp256k1.makeKeypair(privateKey);
        const compressedPubKey = Secp256k1.compressPubkey(pubkey);
        const pubKeyBase64 = toBase64(compressedPubKey);

        const zigAddress = pubkeyToAddress({
            type: 'tendermint/PubKeySecp256k1',
            value: pubKeyBase64
        }, 'zig');

        console.log(`   Wallet ZIG: ${zigAddress}`);
        console.log(`   Pubkey: ${pubKeyBase64}`);

        // Get Nonce
        console.log('   -> Requesting Nonce...');
        const nonceRes = await axios.post(`${API_URL}/auth/nonce`, { walletAddress: zigAddress });
        const nonce = nonceRes.data.nonce;

        // Sign Nonce (Cosmos Style: Hash of message -> Secp256k1 Sign)
        const messageHash = new Sha256(Buffer.from(nonce)).digest();
        const signature = await Secp256k1.createSignature(messageHash, privateKey);
        let sigBytes = signature.toFixedLength();
        if (sigBytes.length === 65) sigBytes = sigBytes.slice(0, 64);

        const signatureBase64 = toBase64(sigBytes);
        console.log(`   Signature Len (Bytes): ${sigBytes.length}`);
        console.log(`   Signature Base64: ${signatureBase64}`);

        // Verify
        const loginRes = await axios.post(`${API_URL}/auth/verify`, {
            walletAddress: zigAddress,
            signature: signatureBase64,
            pubKey: pubKeyBase64
        });
        const token = loginRes.data.token;
        console.log('   ✅ Authenticated');


        console.log('\n--- 🐦 STEP 2: Link Twitter (Mock) ---');
        const linkRes = await axios.post(`${API_URL}/social/twitter/callback`, {
            mock: true,
            twitterId: '999_VIRTUAL',
            username: 'VirtualUser'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`   ✅ Linked @${linkRes.data.twitter.username}`);


        console.log('\n--- 📋 STEP 3: Verify Task Logic ---');
        // Check Initial State
        const t1 = await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
        const task = t1.data.tasks[0];
        console.log(`   Task: ${task.slug} | Completed: ${task.isCompleted}`);

        if (task.isCompleted) throw new Error('Task should be incomplete');

        // Complete
        console.log('   -> Completing Task...');
        const claimRes = await axios.post(`${API_URL}/tasks/complete`, {
            taskId: task.id,
            proof: { mock: true }
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('   ✅ Claim Result:', claimRes.data);

        // Check Final State
        const t2 = await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
        const finalTask = t2.data.tasks[0];
        console.log(`   Task: ${finalTask.slug} | Completed: ${finalTask.isCompleted}`);

        if (finalTask.isCompleted) {
            console.log('\n✨✨ VIRTUAL CHECK PASSED: System works end-to-end! ✨✨');
        } else {
            console.error('\n❌ FAILED: Task not marked complete.');
        }

    } catch (err: any) {
        console.error('❌ Virtual Check Failed:', err.response?.data || err.message);
    } finally {
        server.close();
        await AppDataSource.destroy();
        process.exit(0);
    }
}

main();
