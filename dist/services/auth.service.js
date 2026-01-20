"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const ethers_1 = require("ethers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const redis_1 = __importDefault(require("../config/redis"));
const data_source_1 = require("../data-source");
const User_1 = require("../database/entities/User");
class AuthService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    async generateNonce(walletAddress) {
        const nonce = `Sign this message to verify ownership of wallet ${walletAddress}. Nonce: ${(0, uuid_1.v4)()}`;
        // Store nonce in Redis with short expiration (5 mins)
        await redis_1.default.setEx(`nonce:${walletAddress.toLowerCase()}`, 300, nonce);
        return nonce;
    }
    async verifySignature(walletAddress, signature) {
        const normalizedAddress = walletAddress.toLowerCase();
        const storedNonce = await redis_1.default.get(`nonce:${normalizedAddress}`);
        if (!storedNonce) {
            throw new Error('Nonce expired or not found');
        }
        // Verify signature
        const recoveredAddress = ethers_1.ethers.verifyMessage(storedNonce, signature);
        if (recoveredAddress.toLowerCase() !== normalizedAddress) {
            throw new Error('Invalid signature');
        }
        // Check if user exists, otherwise create
        let user = await this.userRepository.findOneBy({ zig_address: normalizedAddress });
        if (!user) {
            user = this.userRepository.create({
                zig_address: normalizedAddress,
                last_login_at: new Date(),
            });
            await this.userRepository.save(user);
        }
        else {
            user.last_login_at = new Date();
            await this.userRepository.save(user);
        }
        // Generate JWT
        const options = {
            expiresIn: (process.env.JWT_EXPIRATION || '1h')
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, walletAddress: user.zig_address }, process.env.JWT_SECRET || 'default-secret', options);
        // Delete nonce to prevent replay
        await redis_1.default.del(`nonce:${normalizedAddress}`);
        return token;
    }
}
exports.AuthService = AuthService;
