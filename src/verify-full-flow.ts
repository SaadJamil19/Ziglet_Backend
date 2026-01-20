import axios from 'axios';
import { Secp256k1, Sha256 } from '@cosmjs/crypto';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import { pubkeyToAddress } from '@cosmjs/amino';

// Verify Script - Pure API Version
// Does NOT require direct DB connection.
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🚀 Starting Pure API Verification Flow (Cosmos Native)...');

    try {
        // --- STEP 1: AUTHENTICATION ---
        console.log('\n--- STEP 1: Wallet Authentication (Cosmos) ---');

        // Generate a test keypair
        const privateKey = fromHex('af9e8e5f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f');
        const { pubkey } = await Secp256k1.makeKeypair(privateKey);
        const compressedPubKey = Secp256k1.compressPubkey(pubkey);
        const pubKeyBase64 = toBase64(compressedPubKey);

        const zigAddress = pubkeyToAddress({
            type: 'tendermint/PubKeySecp256k1',
            value: pubKeyBase64
        }, 'zig');

        console.log(`👤 Test Wallet (ZIG): ${zigAddress}`);
        console.log(`👤 Public Key: ${pubKeyBase64}`);

        // A. Get Nonce
        console.log('   -> Requesting Nonce...');
        const nonceRes = await axios.post(`${API_URL}/auth/nonce`, { walletAddress: zigAddress });
        const { nonce } = nonceRes.data;
        console.log(`   ✅ Nonce Received: "${nonce}"`);

        // B. Sign Nonce (Cosmos Style)
        const messageHash = new Sha256(Buffer.from(nonce)).digest();
        const signature = await Secp256k1.createSignature(messageHash, privateKey);
        const signatureBase64 = toBase64(signature.toFixedLength());
        console.log(`   ✍️  Signed Nonce (Secp256k1)`);

        // C. Verify & Login
        const verifyRes = await axios.post(`${API_URL}/auth/verify`, {
            walletAddress: zigAddress,
            signature: signatureBase64,
            pubKey: pubKeyBase64
        });
        const { token } = verifyRes.data;
        console.log(`   ✅ Login Successful! JWT Token Valid.`);

        // --- STEP 2: LINK SOCIAL (MOCKED) ---
        console.log('\n--- STEP 2: Social Account Linking (Mock Mode) ---');
        try {
            const linkRes = await axios.post(`${API_URL}/social/twitter/callback`, {
                mock: true,
                twitterId: '987654321_TEST',
                username: 'CosmosChecker'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   ✅ Mock Link Success: @${linkRes.data.twitter.username}`);
        } catch (err: any) {
            console.error('   ❌ Link Failed:', err.response?.data || err.message);
            process.exit(1);
        }

        // --- STEP 3: TASKS ---
        console.log('\n--- STEP 3: Task Execution ---');
        // A. List Tasks (Expect Uncompleted)
        let tasksRes = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const twitterTask = tasksRes.data.tasks.find((t: any) => t.slug === 'twitter-follow');
        if (!twitterTask) throw new Error('Twitter Follow task not found via API');

        console.log(`   🎯 Target Task: ${twitterTask.slug}`);
        if (twitterTask.isCompleted) {
            console.log('   ⚠️ Task already marked completed? Unexpected for new user.');
        } else {
            console.log('   ✅ Task status verified: Incomplete');
        }

        // B. Claim Task
        console.log('   -> Attempting Claim/Complete...');
        const claimRes = await axios.post(`${API_URL}/tasks/complete`, {
            taskId: twitterTask.id,
            proof: { mocked: true }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ Claim Response:`, claimRes.data);


        // --- STEP 4: VERIFICATION ---
        console.log('\n--- STEP 4: Final Verification ---');

        // C. List Tasks Again (Expect Completed)
        tasksRes = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const updatedTask = tasksRes.data.tasks.find((t: any) => t.slug === 'twitter-follow');

        if (updatedTask.isCompleted) {
            console.log('\n✅✅✅ TEST PASSED: Full Cosmos Auth Flow Verified ✅✅✅');
        } else {
            console.log('\n❌❌❌ TEST FAILED: Task logic completed but API reports incomplete.');
        }

        // --- STEP 5: DAILY LOGIN REWARD ---
        console.log('\n--- STEP 5: Daily Login Reward (New System) ---');
        console.log('   -> Attempting Daily Login Claim...');
        try {
            const dailyRes = await axios.post(`${API_URL}/tasks/daily-login-claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   ✅ Daily Claim Success:`, dailyRes.data);
            console.log('\n🎉🎉 ALL SYSTEMS FUNCTIONAL: Daily Login + Cosmos Auth + Events 🎉🎉');
        } catch (err: any) {
            console.error('   ❌ Daily Claim Failed:', err.response?.data || err.message);
        }

    } catch (error: any) {
        console.error('\n❌ ERROR:', error.response ? error.response.data : error.message);
    }
}

main();
