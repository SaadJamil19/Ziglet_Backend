import { Secp256k1, Sha256 } from '@cosmjs/crypto';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import { pubkeyToAddress } from '@cosmjs/amino';
import { AuthService } from '../src/services/auth.service';
import redisClient from '../src/config/redis';
import { AppDataSource } from '../src/data-source';

describe('AuthService (Cosmos Native)', () => {
    let authService: AuthService;
    const privateKey = fromHex('af9e8e5f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f');
    let pubKeyBase64: string;
    let zigAddress: string;

    beforeAll(async () => {
        // Initialize DB (must be set up for tests specifically if needed, but here we just mock or use the data-source config)
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        authService = new AuthService();

        const { pubkey } = await Secp256k1.makeKeypair(privateKey);
        pubKeyBase64 = toBase64(Secp256k1.compressPubkey(pubkey));
        zigAddress = pubkeyToAddress({ type: 'tendermint/PubKeySecp256k1', value: pubKeyBase64 }, 'zig');
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it('should generate a valid nonce for zig1 address', async () => {
        const nonce = await authService.generateNonce(zigAddress);
        expect(nonce).toContain(zigAddress);
        expect(nonce).toContain('Nonce:');
    });

    it('should fail to generate nonce for 0x address', async () => {
        await expect(authService.generateNonce('0x123')).rejects.toThrow('Only zig1 addresses are allowed');
    });

    it('should verify a valid Cosmos signature', async () => {
        const nonce = await authService.generateNonce(zigAddress);

        const messageHash = new Sha256(Buffer.from(nonce)).digest();
        const signature = await Secp256k1.createSignature(messageHash, privateKey);
        const signatureBase64 = toBase64(signature.toFixedLength());

        const token = await authService.verifySignature(zigAddress, signatureBase64, pubKeyBase64);
        expect(token).toBeDefined();
    });

    it('should fail if zig_address prefix is wrong (0x)', async () => {
        await expect(authService.verifySignature('0x123', 'sig', 'pub')).rejects.toThrow('Only zig1 addresses are allowed');
    });

    it('should fail if public key does not match address', async () => {
        const nonce = await authService.generateNonce(zigAddress);
        const otherPrivKey = fromHex('0000000000000000000000000000000000000000000000000000000000000001');
        const { pubkey: otherPub } = await Secp256k1.makeKeypair(otherPrivKey);
        const otherPubBase64 = toBase64(Secp256k1.compressPubkey(otherPub));

        await expect(authService.verifySignature(zigAddress, 'sig', otherPubBase64)).rejects.toThrow('Public key does not match the provided zig1 address');
    });

    it('should fail if signature is invalid', async () => {
        const nonce = await authService.generateNonce(zigAddress);
        const invalidSig = toBase64(new Uint8Array(64).fill(0));

        await expect(authService.verifySignature(zigAddress, invalidSig, pubKeyBase64)).rejects.toThrow('Invalid Cosmos signature');
    });
});
