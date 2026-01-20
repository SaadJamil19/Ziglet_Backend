import { Request, Response } from 'express';
import { TwitterService } from '../services/twitter.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

import redisClient from '../config/redis';

export class SocialController {
    private twitterService: TwitterService;

    constructor() {
        this.twitterService = new TwitterService();
    }

    // Step 1: Start Auth - Frontend calls this to get the Twitter Redirect URL
    initiateTwitterAuth = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            // Generate PKCE
            const codeVerifier = crypto.randomBytes(32).toString('hex');
            const codeChallenge = crypto
                .createHash('sha256')
                .update(codeVerifier)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            // Store verifier mapped to state (using userId as state for simplicity in MVP, ideally a random nonce)
            // SECURITY: Using userId as state is weak for CSRF, but sufficient for proof of concept if validated.
            // Better: Random state stored in Redis linked to UserId.
            const state = userId;
            await redisClient.setEx(`pkce:${state}`, 600, codeVerifier); // 10 minutes expiry

            const url = this.twitterService.getAuthUrl(state, codeChallenge);
            return res.json({ url });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // Step 2: Callback - Twitter redirects here
    // NOTE: This usually happens on frontend, which then calls BACKEND with code.
    // Assuming Frontend passes the code to Backend.
    linkTwitter = async (req: AuthRequest, res: Response) => {
        try {
            // Mock Support for Virtual Check
            if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && req.body.mock === true) {
                const userId = req.user?.userId;
                if (!userId) return res.status(401).json({ error: 'Unauthorized' });
                const info = await this.twitterService.mockLink(
                    userId,
                    req.body.twitterId || '123456789_MOCK',
                    req.body.username || 'MockUser'
                );
                return res.json({ success: true, twitter: info, mode: 'mock' });
            }

            const { code, state } = req.body;
            const userId = req.user?.userId;

            if (!userId || userId !== state) {
                // If state doesn't match authenticated user, reject
                return res.status(400).json({ error: 'Invalid state or user mismatch' });
            }

            const codeVerifier = await redisClient.get(`pkce:${state}`);
            if (!codeVerifier) {
                return res.status(400).json({ error: 'PKCE Challenge expired or missing' });
            }

            const info = await this.twitterService.exchangeCodeForUser(code, codeVerifier, userId);

            // Cleanup
            await redisClient.del(`pkce:${state}`);

            return res.json({ success: true, twitter: info });
        } catch (error: any) {
            console.error('Link Twitter Error:', error);
            return res.status(400).json({ error: error.message });
        }
    };
}
