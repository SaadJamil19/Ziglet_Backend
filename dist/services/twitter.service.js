"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterService = void 0;
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("../data-source");
const User_1 = require("../database/entities/User");
const SocialAccount_1 = require("../database/entities/SocialAccount");
class TwitterService {
    constructor() {
        this.socialRepository = data_source_1.AppDataSource.getRepository(SocialAccount_1.SocialAccount);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.clientId = process.env.TWITTER_CLIENT_ID;
        this.clientSecret = process.env.TWITTER_CLIENT_SECRET;
        this.callbackUrl = process.env.TWITTER_CALLBACK_URL;
        this.tokenUrl = 'https://api.twitter.com/2/oauth2/token';
        this.meUrl = 'https://api.twitter.com/2/users/me';
    }
    getAuthUrl(state, codeChallenge) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.callbackUrl,
            scope: 'tweet.read users.read follows.read offline.access',
            state: state, // Ideally verify this state matches the user session/wallet to prevent CSRF
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }
    async exchangeCodeForUser(code, codeVerifier, userId) {
        // 1. Get Access Token
        const params = new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: this.callbackUrl,
            code_verifier: codeVerifier,
        });
        // Basic Auth header for confidnetial client
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const tokenRes = await axios_1.default.post(this.tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${authHeader}`,
            },
        });
        const { access_token } = tokenRes.data;
        // 2. Get User Info
        const userRes = await axios_1.default.get(this.meUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const { id: twitterId, username } = userRes.data.data;
        // 3. Link Account (Check constraints)
        await this.linkAccount(userId, twitterId, username);
        return { twitterId, username };
    }
    async linkAccount(userId, twitterId, username) {
        // Check if this Twitter ID is already linked to ANY wallet
        const existing = await this.socialRepository.findOneBy({
            platform: SocialAccount_1.SocialPlatform.TWITTER,
            platform_user_id: twitterId
        });
        if (existing) {
            if (existing.user.id === userId) {
                return; // Already linked to self, ignore
            }
            throw new Error('This Twitter account is already linked to another wallet.');
        }
        // Check if this User already has a Twitter account linked
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['social_accounts']
        });
        if (!user)
            throw new Error('User not found');
        const alreadyLinked = user.social_accounts.some(acc => acc.platform === SocialAccount_1.SocialPlatform.TWITTER);
        if (alreadyLinked) {
            throw new Error('You have already linked a Twitter account.');
        }
        // Create Link
        const social = this.socialRepository.create({
            user: user,
            platform: SocialAccount_1.SocialPlatform.TWITTER,
            platform_user_id: twitterId,
            username: username,
            verified_at: new Date()
        });
        await this.socialRepository.save(social);
    }
}
exports.TwitterService = TwitterService;
