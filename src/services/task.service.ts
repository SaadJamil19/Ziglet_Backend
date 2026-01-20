import { AppDataSource } from '../data-source';
import { Task, TaskType, RewardType } from '../database/entities/Task';
import { TaskCompletion } from '../database/entities/TaskCompletion';
import { User } from '../database/entities/User';
import { FaucetClaim } from '../database/entities/FaucetClaim';
import { PointsLedger } from '../database/entities/PointsLedger';
import { TaskEvent } from '../database/entities/TaskEvent';
import { UserLogin } from '../database/entities/UserLogin';
import { TwitterService } from './twitter.service';
import crypto from 'crypto';
import redisClient from '../config/redis';

export class TaskService {
    private taskRepository = AppDataSource.getRepository(Task);
    private completionRepository = AppDataSource.getRepository(TaskCompletion);
    private claimRepository = AppDataSource.getRepository(FaucetClaim);
    private pointsRepository = AppDataSource.getRepository(PointsLedger);
    private userRepository = AppDataSource.getRepository(User);

    private twitterService = new TwitterService(); // We'll add verification logic there later

    async getTasks(userId: string) {
        const tasks = await this.taskRepository.find({
            where: { is_active: true },
            order: { reward_type: 'ASC' }
        });

        const completions = await this.completionRepository.find({
            where: { user: { id: userId } },
            relations: ['task']
        });

        const completionMap = new Set(completions.map(c => c.task.id));

        return tasks.map(task => ({
            ...task,
            isCompleted: completionMap.has(task.id),
            // Future: Add daily reset logic check here
        }));
    }

    async verifyAndCompleteTask(userId: string, taskId: string, proof?: any) {
        // --- 0. Concurrent Request Protection ---
        const lockKey = `lock:task:${userId}:${taskId}`;
        const locked = await redisClient.set(lockKey, '1', { NX: true, EX: 30 });
        if (!locked) throw new Error('Task processing in progress. Please wait.');

        // Start Transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const task = await queryRunner.manager.findOne(Task, { where: { id: taskId } });
            if (!task) throw new Error('Task not found');

            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
                relations: ['social_accounts']
            });
            if (!user) throw new Error('User not found');

            // --- 1. Deterministic Mapping (Idempotency Rules) ---
            let externalId: string | null = null;
            let eventDate: string | null = null;
            const todayStr = new Date().toISOString().split('T')[0];

            if (task.type === TaskType.SOCIAL_CHECK && task.platform === 'twitter') {
                const twitterAcc = user.social_accounts.find(a => a.platform === 'twitter');
                if (!twitterAcc) throw new Error('Link Twitter account first');

                if (task.slug === 'twitter-follow') {
                    // One-time Follow Bundle: external_id = user_id, event_date = NULL (per-user one-time)
                    externalId = user.id;
                    eventDate = null;
                } else if (task.slug === 'daily-tweet' || proof?.tweetId) {
                    // Twitter Tweet Task: external_id = tweet_id, event_date = NULL (global unique)
                    const hashtags = task.metadata?.required_hashtags || ['#Ziglet'];
                    const mention = task.metadata?.required_mention || '@ZigletApp';

                    const tweetId = await this.twitterService.checkTweet(twitterAcc.platform_user_id, hashtags, mention, proof?.tweetId);
                    if (!tweetId) throw new Error('No matching tweet found. Please ensure hashtags/mentions are correct.');

                    externalId = tweetId;
                    eventDate = null;
                }
            } else if (task.slug === 'daily-login') {
                // Verify if user actually logged in today
                const loginRecord = await queryRunner.manager.findOne(UserLogin, {
                    where: { user: { id: user.id }, login_date: todayStr }
                });
                if (!loginRecord) throw new Error('No login record found for today. Please re-login.');
                if (loginRecord.claimed) throw new Error('Daily reward already claimed.');

                externalId = user.id;
                eventDate = todayStr;

                // Mark as claimed in user_logins table
                loginRecord.claimed = true;
                await queryRunner.manager.save(loginRecord);

            } else if (task.daily_limit > 0) {
                // Daily Task (per-user): external_id = user_id, event_date = CURRENT_DATE
                externalId = user.id;
                eventDate = todayStr;
            } else if (task.type === TaskType.SUBMISSION) {
                // Meme Submission: external_id = submission_id, event_date = NULL
                externalId = proof?.submissionId || `sub_${crypto.randomUUID()}`;
                eventDate = null;
            } else {
                // Fallback for other one-time tasks: external_id = user_id, event_date = NULL
                externalId = user.id;
                eventDate = null;
            }

            if (!externalId) throw new Error('Failed to generate deterministic external_id');

            // --- 2. Insert Task Event (The Truth) ---
            const event = queryRunner.manager.create(TaskEvent, {
                user,
                task,
                event_type: task.type,
                external_id: externalId,
                event_date: eventDate as any,
                metadata: {
                    ...proof,
                    ip: proof?.ip,
                    ua: proof?.userAgent
                }
            });

            // This will fail if UNIQUE(task_id, external_id, event_date) is violated
            await queryRunner.manager.save(event);


            // --- 3. Update Legacy State (TaskCompletion) ---
            // We keep this for backward compat and easy "isCompleted" checks
            const completion = queryRunner.manager.create(TaskCompletion, {
                user,
                task,
                completed_at: new Date(),
                completion_data: proof
            });
            await queryRunner.manager.save(completion);


            // --- 4. Distribute Reward (Downstream of Event) ---
            if (task.reward_type === RewardType.POINTS) {
                const entry = queryRunner.manager.create(PointsLedger, {
                    user,
                    reason: `task_reward:${task.slug}`,
                    amount: Number(task.reward_amount),
                    reference_id: completion.id,
                    event: event // LINKED TO EVENT
                });
                await queryRunner.manager.save(entry);
            } else if (task.reward_type === RewardType.FAUCET) {
                const claim = queryRunner.manager.create(FaucetClaim, {
                    user,
                    task_completion: completion,
                    amount: task.reward_amount,
                    tx_hash: `PENDING_${crypto.randomUUID()}`,
                    status: 'pending',
                    event: event // LINKED TO EVENT
                });
                await queryRunner.manager.save(claim);
            }

            await queryRunner.commitTransaction();
            return { success: true, reward: task.reward_amount, type: task.reward_type, eventId: event.id };

        } catch (err: any) {
            await queryRunner.rollbackTransaction();
            // Handle Unique Constraint Violation elegantly
            if (err.message.includes('UNIQUE') || err.code === '23505' || err.code === 'SQLITE_CONSTRAINT') {
                // Already processed
                return { success: false, message: 'Task already completed or limit reached (Idempotent)' };
            }
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async distributeReward(user: User, task: Task, completion: TaskCompletion) {
        // Deprecated by transactional flow above, but kept if needed by other methods
    }
}
