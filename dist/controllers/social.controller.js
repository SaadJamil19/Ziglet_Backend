"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const twitter_service_1 = require("../services/twitter.service");
const crypto_1 = __importDefault(require("crypto"));
// In-memory store for PKCE challenges (PROD: Use Redis)
const pkceStore = {};
class SocialController {
    constructor() {
        // Step 1: Start Auth - Frontend calls this to get the Twitter Redirect URL
        this.initiateTwitterAuth = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    return res.status(401).json({ error: 'Unauthorized' });
                // Generate PKCE
                const codeVerifier = crypto_1.default.randomBytes(32).toString('hex');
                const codeChallenge = crypto_1.default
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
                pkceStore[state] = codeVerifier; // Temporary in-memory
                const url = this.twitterService.getAuthUrl(state, codeChallenge);
                return res.json({ url });
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        };
        // Step 2: Callback - Twitter redirects here
        // NOTE: This usually happens on frontend, which then calls BACKEND with code.
        // Assuming Frontend passes the code to Backend.
        this.linkTwitter = async (req, res) => {
            try {
                const { code, state } = req.body;
                const userId = req.user?.userId;
                if (!userId || userId !== state) {
                    // If state doesn't match authenticated user, reject
                    return res.status(400).json({ error: 'Invalid state or user mismatch' });
                }
                const codeVerifier = pkceStore[state];
                if (!codeVerifier) {
                    return res.status(400).json({ error: 'PKCE Challenge expired or missing' });
                }
                const info = await this.twitterService.exchangeCodeForUser(code, codeVerifier, userId);
                // Cleanup
                delete pkceStore[state];
                return res.json({ success: true, twitter: info });
            }
            catch (error) {
                console.error('Link Twitter Error:', error);
                return res.status(400).json({ error: error.message });
            }
        };
        this.twitterService = new twitter_service_1.TwitterService();
    }
}
exports.SocialController = SocialController;
