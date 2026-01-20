import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    generateNonce = async (req: Request, res: Response) => {
        try {
            const { walletAddress } = req.body;
            if (!walletAddress) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }

            const nonce = await this.authService.generateNonce(walletAddress);
            return res.json({ nonce });
        } catch (error: any) {
            console.error('Error generating nonce:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };

    verifySignature = async (req: Request, res: Response) => {
        try {
            const { walletAddress, signature, pubKey } = req.body;
            if (!walletAddress || !signature || !pubKey) {
                return res.status(400).json({ error: 'walletAddress, signature, and pubKey are required' });
            }

            const token = await this.authService.verifySignature(walletAddress, signature, pubKey);
            if (!token) {
                return res.status(401).json({ error: 'Invalid signature or nonce expired' });
            }

            return res.json({ token });
        } catch (error: any) {
            console.error('Error verifying signature:', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    };
}
