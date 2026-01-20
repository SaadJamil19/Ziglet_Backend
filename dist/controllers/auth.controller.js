"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    constructor() {
        this.generateNonce = async (req, res) => {
            try {
                const { walletAddress } = req.body;
                if (!walletAddress) {
                    return res.status(400).json({ error: 'Wallet address is required' });
                }
                const nonce = await this.authService.generateNonce(walletAddress);
                return res.json({ nonce });
            }
            catch (error) {
                console.error('Error generating nonce:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
        this.verifySignature = async (req, res) => {
            try {
                const { walletAddress, signature } = req.body;
                if (!walletAddress || !signature) {
                    return res.status(400).json({ error: 'Wallet address and signature are required' });
                }
                const token = await this.authService.verifySignature(walletAddress, signature);
                if (!token) {
                    return res.status(401).json({ error: 'Invalid signature or nonce expired' });
                }
                return res.json({ token });
            }
            catch (error) {
                console.error('Error verifying signature:', error);
                return res.status(500).json({ error: error.message || 'Internal server error' });
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
