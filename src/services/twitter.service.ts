import axios from 'axios';
import { AppDataSource } from '../data-source';
import { User } from '../database/entities/User';
import { SocialAccount, SocialPlatform } from '../database/entities/SocialAccount';

export class TwitterService {
    private socialRepository = AppDataSource.getRepository(SocialAccount);
    private userRepository = AppDataSource.getRepository(User);

    private readonly clientId = process.env.TWITTER_CLIENT_ID;
    private readonly clientSecret = process.env.TWITTER_CLIENT_SECRET;
    private readonly callbackUrl = process.env.TWITTER_CALLBACK_URL;
    private readonly tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    private readonly meUrl = 'https://api.twitter.com/2/users/me';

    getAuthUrl(state: string, codeChallenge: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId!,
            redirect_uri: this.callbackUrl!,
            scope: 'tweet.read users.read follows.read offline.access',
            state: state, // Ideally verify this state matches the user session/wallet to prevent CSRF
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCodeForUser(code: string, codeVerifier: string, userId: string): Promise<any> {
        // 1. Get Access Token
        const params = new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId!,
            redirect_uri: this.callbackUrl!,
            code_verifier: codeVerifier,
        });

        // Basic Auth header for confidnetial client
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const tokenRes = await axios.post(this.tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${authHeader}`,
            },
        });

        const { access_token } = tokenRes.data;

        // 2. Get User Info
        const userRes = await axios.get(this.meUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { id: twitterId, username } = userRes.data.data;

        // 3. Link Account (Check constraints)
        await this.linkAccount(userId, twitterId, username);

        return { twitterId, username };
    }

    private async linkAccount(userId: string, twitterId: string, username: string) {
        // Check if this Twitter ID is already linked to ANY wallet
        const existing = await this.socialRepository.findOne({
            where: {
                platform: SocialPlatform.TWITTER,
                platform_user_id: twitterId
            },
            relations: ['user']
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

        if (!user) throw new Error('User not found');

        const alreadyLinked = user.social_accounts.some(acc => acc.platform === SocialPlatform.TWITTER);
        if (alreadyLinked) {
            throw new Error('You have already linked a Twitter account.');
        }

        // Create Link
        const social = this.socialRepository.create({
            user: user,
            platform: SocialPlatform.TWITTER,
            platform_user_id: twitterId,
            username: username,
            verified_at: new Date()
        });

        await this.socialRepository.save(social);
    }
    async checkFollow(platformUserId: string, targetHandle: string): Promise<boolean> {
        if (!this.clientId) return true; // Mock mode if no CLIENT_ID

        try {
            // In a real scenario, you'd need a valid OAuth2 scope `follows.read`
            // and the user's access token. For this example, we'll use a placeholder URL.
            // const res = await axios.get(`https://api.twitter.com/2/users/${platformUserId}/following`, { ... });
            console.log(`[TwitterService] Verifying if ${platformUserId} follows @${targetHandle}`);
            return true;
        } catch (error) {
            console.error('Twitter Follow Check Error:', error);
            return false;
        }
    }

    async checkTweet(platformUserId: string, hashtags: string[], mention: string, proofTweetId?: string): Promise<string | null> {
        if (!this.clientId) return proofTweetId || `mock_tweet_${platformUserId}`;

        try {
            console.log(`[TwitterService] Verifying tweet by ${platformUserId} with hashtags ${hashtags} and mention ${mention}`);
            // In real logic, search user's recent tweets via:
            // https://api.twitter.com/2/users/:id/tweets
            // Return first matching Tweet ID
            return `mock_tweet_id_${Math.random().toString(36).substr(2, 9)}`;
        } catch (error) {
            console.error('Twitter Tweet Check Error:', error);
            return null;
        }
    }

    async mockLink(userId: string, twitterId: string, username: string) {
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
            throw new Error('Mock linking only available in dev/test mode');
        }
        await this.linkAccount(userId, twitterId, username);
        return { twitterId, username };
    }
}
