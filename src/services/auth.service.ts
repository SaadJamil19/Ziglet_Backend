import { Secp256k1, Secp256k1Signature, Sha256 } from '@cosmjs/crypto';
import { fromBase64 } from '@cosmjs/encoding';
import { pubkeyToAddress } from '@cosmjs/amino';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis';
import { AppDataSource } from '../data-source';
import { User } from '../database/entities/User';
import { UserLogin } from '../database/entities/UserLogin';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private loginRepository = AppDataSource.getRepository(UserLogin);

    async generateNonce(walletAddress: string): Promise<string> {
        if (!walletAddress.startsWith('zig1')) {
            throw new Error('Only zig1 addresses are allowed');
        }
        const nonce = `Sign this message to verify ownership of wallet ${walletAddress}. Nonce: ${uuidv4()}`;
        // Store nonce in Redis with short expiration (5 mins)
        await redisClient.setEx(`nonce:${walletAddress.toLowerCase()}`, 300, nonce);
        return nonce;
    }

    async verifySignature(walletAddress: string, signature: string, pubKey: string): Promise<string | null> {
        const normalizedAddress = walletAddress.toLowerCase();

        if (!normalizedAddress.startsWith('zig1')) {
            throw new Error('Only zig1 addresses are allowed');
        }

        const storedNonce = await redisClient.get(`nonce:${normalizedAddress}`);
        if (!storedNonce) {
            throw new Error('Nonce expired or not found');
        }

        // 1. Verify Public Key matches the zig1 Address
        // Consistent with Cosmos SDK: address = hash(pubkey)
        try {
            // 2. Verify Secp256k1 Signature
            const signatureBytes = fromBase64(signature);
            const pubKeyBytes = fromBase64(pubKey);

            const pubkeyObj = {
                type: 'tendermint/PubKeySecp256k1',
                value: pubKey
            };
            const derivedAddress = pubkeyToAddress(pubkeyObj, 'zig');

            if (derivedAddress.toLowerCase() !== normalizedAddress) {
                throw new Error('Public key does not match the provided zig1 address');
            }

            const messageBytes = Buffer.from(storedNonce);
            const messageHash = new Sha256(messageBytes).digest();

            // Handle both fixed-length (64 bytes) and potential 65-byte (with recovery) variations
            const normalizedSignature = signatureBytes.length === 65 ? signatureBytes.slice(0, 64) : signatureBytes;

            const secpSignature = normalizedSignature.length === 64
                ? Secp256k1Signature.fromFixedLength(normalizedSignature)
                : Secp256k1Signature.fromDer(normalizedSignature);

            const isValid = await Secp256k1.verifySignature(secpSignature, messageHash, pubKeyBytes);

            if (!isValid) {
                throw new Error('Invalid Cosmos signature');
            }

            console.log(`🔐 Native Zig Auth Success: ${normalizedAddress}`);

        } catch (err: any) {
            console.error('Auth Verification Error:', err.message);
            throw new Error(`Signature verification failed: ${err.message}`);
        }

        // Check if user exists, otherwise create
        let user = await this.userRepository.findOneBy({ zig_address: normalizedAddress });

        if (!user) {
            user = this.userRepository.create({
                zig_address: normalizedAddress,
                last_login_at: new Date(),
            });
            await this.userRepository.save(user);
        } else {
            user.last_login_at = new Date();
            await this.userRepository.save(user);
        }

        // --- 3. Record Daily Login for Rewards (Calendar UI) ---
        const todayStr = new Date().toISOString().split('T')[0];
        const existingLogin = await this.loginRepository.findOneBy({
            user: { id: user.id },
            login_date: todayStr
        });

        if (!existingLogin) {
            const loginRecord = this.loginRepository.create({
                user,
                login_date: todayStr,
                claimed: false
            });
            await this.loginRepository.save(loginRecord);
        }

        // Generate JWT
        const options: jwt.SignOptions = {
            expiresIn: (process.env.JWT_EXPIRATION || '1h') as any
        };

        const token = jwt.sign(
            { userId: user.id, walletAddress: user.zig_address },
            process.env.JWT_SECRET || 'default-secret',
            options
        );

        // Delete nonce to prevent replay
        await redisClient.del(`nonce:${normalizedAddress}`);

        return token;
    }
}
